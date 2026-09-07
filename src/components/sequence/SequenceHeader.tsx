interface SequenceHeaderProps {
  id: string;
  description: string;
  rowNumber: number;
  selected: boolean;
  onClick: () => void;
}

export function SequenceHeader({
  id,
  description,
  rowNumber,
  selected,
  onClick,
}: SequenceHeaderProps) {
  return (
    <button
      className={`row-label ${selected ? "selected" : ""}`}
      title={description}
      onClick={onClick}
    >
      <span className="row-number">{rowNumber}</span>
      <span className="row-id">{id}</span>
    </button>
  );
}