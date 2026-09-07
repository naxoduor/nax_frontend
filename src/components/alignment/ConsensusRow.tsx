interface ConsensusRowProps {
  consensus: string;
  charWidth: number;
  selection: { start: number; end: number };
  showGrid: boolean;
}

export function ConsensusRow({
  consensus,
  charWidth,
  selection,
  showGrid,
}: ConsensusRowProps) {
  return (
    <div
      className="sequence-row consensus-row"
      style={{ width: consensus.length * charWidth + 145 }}
    >
      <div className="row-label-spacer">
        <span className="consensus-label">CONS</span>
      </div>

      <div className="bases">
        {[...consensus].map((character, index) => {
          const selected =
            index + 1 >= selection.start && index + 1 <= selection.end;

          return (
            <span
              key={index}
              className={`base base-${character.toUpperCase()} ${
                selected ? "selected" : ""
              } ${showGrid ? "grid" : ""}`}
              style={{ width: charWidth }}
            >
              {character}
            </span>
          );
        })}
      </div>
    </div>
  );
}
