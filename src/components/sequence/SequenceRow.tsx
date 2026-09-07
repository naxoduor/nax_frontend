import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { SequenceHeader } from "./SequenceHeader";

interface SequenceRowProps {
  sequence: Sequence;
  rowNumber: number;
  selected: boolean;
  selection: SelectionRange;
  charWidth: number;
  showGrid: boolean;
  onSelectSequence: () => void;
  onColumnClick: (column: number) => void;
}

export function SequenceRow({
  sequence,
  rowNumber,
  selected,
  selection,
  charWidth,
  showGrid,
  onSelectSequence,
  onColumnClick,
}: SequenceRowProps) {
  return (
    <div
      className="sequence-row"
      style={{ width: sequence.sequence.length * charWidth + 145 }}
    >
      <SequenceHeader
        id={sequence.id}
        description={sequence.description}
        rowNumber={rowNumber}
        selected={selected}
        onClick={onSelectSequence}
      />

      <div className="bases">
        {[...sequence.sequence].map((character, index) => (
          <button
            key={`${sequence.id}-${index}`}
            className={`base base-${character.toUpperCase()} ${
              index + 1 >= selection.start && index + 1 <= selection.end
                ? "selected"
                : ""
            } ${showGrid ? "grid" : ""}`}
            style={{ width: charWidth }}
            onClick={() => onColumnClick(index + 1)}
            title={`${sequence.id}:${index + 1}`}
          >
            {character}
          </button>
        ))}
      </div>
    </div>
  );
}
