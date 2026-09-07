import { Ruler } from "./Ruler";
import { SequenceRow } from "./SequenceRow";
import type { Sequence, SelectionRange } from "../../types/bioinformatics";

interface SequenceViewerProps {
  sequences: Sequence[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showGrid: boolean;
  onSelectSequence: (id: string) => void;
  onSelectionChange: (range: SelectionRange) => void;
}

export function SequenceViewer({
  sequences,
  selectedSequenceIds,
  selection,
  zoom,
  showGrid,
  onSelectSequence,
  onSelectionChange,
}: SequenceViewerProps) {
  const charWidth = Math.max(8, 10 * (zoom / 100));
  const columns = Math.max(...sequences.map((s) => s.sequence.length), 0);

  const selectColumn = (column: number) => {
    onSelectionChange({ start: column, end: column });
  };

  return (
    <div className="alignment-shell">
      <div className="alignment-corner">
        <div className="corner-title">Sequences</div>
        <div className="corner-subtitle">{sequences.length} loaded</div>
      </div>

      <div className="alignment-scroll">
        <Ruler
          columns={columns}
          charWidth={charWidth}
          onColumnClick={selectColumn}
        />

        {sequences.map((sequence, index) => (
          <SequenceRow
            key={sequence.id}
            sequence={sequence}
            rowNumber={index + 1}
            selected={selectedSequenceIds.includes(sequence.id)}
            selection={selection}
            charWidth={charWidth}
            showGrid={showGrid}
            onSelectSequence={() => onSelectSequence(sequence.id)}
            onColumnClick={selectColumn}
          />
        ))}
      </div>
    </div>
  );
}''',
