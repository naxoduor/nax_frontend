    import { SequenceHeader } from "../sequence/SequenceHeader";

interface AlignmentRowProps {
  sequence: Sequence;
  rowNumber: number;
  selected: boolean;
  selection: SelectionRange;
  charWidth: number;
  showGrid: boolean;
  onSelectSequence: () => void;
  onColumnClick: (column: number, shiftKey: boolean) => void;
}

export function AlignmentRow({
  sequence,
  rowNumber,
  selected,
  selection,
  charWidth,
  showGrid,
  onSelectSequence,
  onColumnClick,
}: AlignmentRowProps) {
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
        {[...sequence.sequence].map((character, index) => {
          const column = index + 1;
          const selectedColumn =
            column >= selection.start && column <= selection.end;

          return (
            <button
              key={`${sequence.id}-${index}`}
              className={`base base-${character.toUpperCase()} ${
                selectedColumn ? "selected" : ""
              } ${showGrid ? "grid" : ""}`}
              style={{ width: charWidth }}
              onClick={(event) => onColumnClick(column, event.shiftKey)}
            >
              {character}
            </button>
          );
        })}
      </div>
    </div>
  );
}
