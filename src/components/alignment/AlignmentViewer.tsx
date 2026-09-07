import { useMemo, useState } from "react";
import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { calculateConsensus } from "../../services/alignment";
import { AlignmentToolbar } from "./AlignmentToolbar";
import { ConsensusRow } from "./ConsensusRow";
import { AlignmentRow } from "./AlignmentRow";
import { Ruler } from "../sequence/Ruler";

interface AlignmentViewerProps {
  sequences: Sequence[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showConsensus: boolean;
  showGrid: boolean;
  onSelectSequence: (id: string) => void;
  onSelectionChange: (range: SelectionRange) => void;
  onToggleConsensus: () => void;
  onToggleGrid: () => void;
  onAction: (message: string) => void;
}

export function AlignmentViewer({
  sequences,
  selectedSequenceIds,
  selection,
  zoom,
  showConsensus,
  showGrid,
  onSelectSequence,
  onSelectionChange,
  onToggleConsensus,
  onToggleGrid,
  onAction,
}: AlignmentViewerProps) {
  const [search, setSearch] = useState("");

  const filteredSequences = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sequences;

    return sequences.filter(
      (sequence) =>
        sequence.id.toLowerCase().includes(query) ||
        sequence.description.toLowerCase().includes(query),
    );
  }, [sequences, search]);

  const consensus = useMemo(
    () => calculateConsensus(filteredSequences),
    [filteredSequences],
  );

  const columns = Math.max(
    consensus.length,
    ...filteredSequences.map((s) => s.sequence.length),
    0,
  );

  const charWidth = Math.max(8, 10 * (zoom / 100));

  const handleColumnClick = (column: number, shiftKey: boolean) => {
    if (shiftKey) {
      onSelectionChange({
        start: Math.min(selection.start, column),
        end: Math.max(selection.end, column),
      });
    } else {
      onSelectionChange({ start: column, end: column });
    }
  };

  return (
    <div className="editor">
      <AlignmentToolbar
        showConsensus={showConsensus}
        showGrid={showGrid}
        search={search}
        onSearchChange={setSearch}
        onToggleConsensus={onToggleConsensus}
        onToggleGrid={onToggleGrid}
        onAction={onAction}
      />

      <div className="alignment-shell">
        <div className="alignment-corner">
          <div className="corner-title">Multiple Sequence Alignment</div>
          <div className="corner-subtitle">
            {filteredSequences.length} sequences
          </div>
        </div>

        <div className="alignment-scroll">
          <Ruler
            columns={columns}
            charWidth={charWidth}
            onColumnClick={(column) => handleColumnClick(column, false)}
          />

          {showConsensus && (
            <ConsensusRow
              consensus={consensus}
              charWidth={charWidth}
              selection={selection}
              showGrid={showGrid}
            />
          )}

          {filteredSequences.map((sequence, index) => (
            <AlignmentRow
              key={sequence.id}
              sequence={sequence}
              rowNumber={index + 1}
              selected={selectedSequenceIds.includes(sequence.id)}
              selection={selection}
              charWidth={charWidth}
              showGrid={showGrid}
              onSelectSequence={() => onSelectSequence(sequence.id)}
              onColumnClick={handleColumnClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
