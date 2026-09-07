interface RulerProps {
  columns: number;
  charWidth: number;
  onColumnClick: (column: number) => void;
}

export function Ruler({ columns, charWidth, onColumnClick }: RulerProps) {
  const step = Math.max(5, Math.round(10 / (charWidth / 10)));

  return (
    <div className="ruler" style={{ width: columns * charWidth }}>
      {Array.from({ length: columns }, (_, index) =>
        index % step === 0 ? (
          <button
            key={index}
            className="ruler-label"
            style={{ left: index * charWidth }}
            onClick={() => onColumnClick(index + 1)}
          >
            {index + 1}
          </button>
        ) : null,
      )}
    </div>
  );
}
