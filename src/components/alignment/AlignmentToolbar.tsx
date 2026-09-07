import {
  AlignHorizontalSpaceAround,
  Check,
  Grid2X2,
  Highlighter,
  Search,
} from "lucide-react";

interface AlignmentToolbarProps {
  showConsensus: boolean;
  showGrid: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onToggleConsensus: () => void;
  onToggleGrid: () => void;
  onAction: (message: string) => void;
}

export function AlignmentToolbar({
  showConsensus,
  showGrid,
  search,
  onSearchChange,
  onToggleConsensus,
  onToggleGrid,
  onAction,
}: AlignmentToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="tool-cluster">
        <button className="select-button">
          <AlignHorizontalSpaceAround size={15} />
          Alignment
        </button>

        <button
          className={`icon-button ${showConsensus ? "active" : ""}`}
          title="Toggle consensus"
          onClick={onToggleConsensus}
        >
          <Check size={15} />
        </button>

        <button
          className={`icon-button ${showGrid ? "active" : ""}`}
          title="Toggle grid"
          onClick={onToggleGrid}
        >
          <Grid2X2 size={15} />
        </button>

        <button
          className="icon-button"
          title="Highlight"
          onClick={() => onAction("Highlight mode enabled")}
        >
          <Highlighter size={15} />
        </button>
      </div>

      <div className="editor-search">
        <Search size={14} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Find sequence..."
          aria-label="Find sequence"
        />
      </div>
    </div>
  );
}
