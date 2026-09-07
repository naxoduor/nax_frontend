import type { AppStatus } from "../../types/bioinformatics"
interface StatusBarProps {
  status: AppStatus;
  sequenceCount: number;
  columnCount: number;
  column: number;
}

export function StatusBar({
  status,
  sequenceCount,
  columnCount,
  column,
}: StatusBarProps) {
  return (
    <footer className="statusbar">
      <div>
        <span className={`status-dot ${status.kind}`} />
        {status.message}
      </div>

      <div className="status-center">
        DNA · {sequenceCount} sequences · {columnCount} columns
      </div>

      <div>
        Ln 1 · Col {column} · UTF-8
      </div>
    </footer>
  );
}
