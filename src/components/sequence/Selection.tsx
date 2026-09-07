import type { SelectionRange } from "../../types/bioinformatics";

interface SelectionProps {
  range: SelectionRange;
  column: number;
}

export function Selection({ range, column }: SelectionProps) {
  if (column < range.start || column > range.end) {
    return null;
  }

  return <span className="selection-overlay" aria-hidden="true" />;
}
