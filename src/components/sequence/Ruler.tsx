interface RulerProps {
  columns: number;
  charWidth: number;
  onColumnClick: (column: number) => void;
  compact?: boolean;
}

export function Ruler({
  columns,
  charWidth,
  onColumnClick,
  compact = false,
}: RulerProps) {
  const step = Math.max(5, Math.round(10 / (charWidth / 10)));

  return (
    <div
      className={`ruler ${compact ? "ruler-compact" : ""}`}
      style={{ width: columns * charWidth, height: compact ? 14 : 31 }}
    >
      {Array.from({ length: columns }, (_, index) => {
        const isTick = index % step === 0;

        if (compact && !isTick) {
          return null;
        }

        const labelText = compact
          ? index + 1
          : index + 1;

        return (
          <button
            key={index}
            className={`ruler-label ${compact ? "ruler-label-compact" : ""}`}
            style={{ left: index * charWidth, width: charWidth }}
            onClick={() => onColumnClick(index + 1)}
          >
            {labelText}
          </button>
        );
      })}
    </div>
  );
}
