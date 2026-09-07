import {
  AlignCenter,
  BarChart3,
  Clipboard,
  Copy,
  FilePlus2,
  FolderOpen,
  GitBranch,
  RotateCcw,
  RotateCw,
  Sparkles,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface ToolBarProps {
  zoom: number;
  onZoomChange: (value: number) => void;
  onOpen: () => void;
  onImport: () => void;
  onAlign: () => void;
  onAnalyze: () => void;
  onAction: (message: string) => void;
}

function ToolButton({
  icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button className={`toolbar-button ${primary ? "primary" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function ToolBar({
  zoom,
  onZoomChange,
  onOpen,
  onImport,
  onAlign,
  onAnalyze,
  onAction,
}: ToolBarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolButton icon={<FolderOpen size={16} />} label="Open" onClick={onOpen} />
        <ToolButton
          icon={<FilePlus2 size={16} />}
          label="New"
          onClick={() => onAction("New document created")}
        />
        <ToolButton icon={<Upload size={16} />} label="Import" onClick={onImport} />
      </div>

      <div className="separator" />

      <div className="toolbar-group">
        <ToolButton
          icon={<RotateCcw size={16} />}
          label="Undo"
          onClick={() => onAction("Undo")}
        />
        <ToolButton
          icon={<RotateCw size={16} />}
          label="Redo"
          onClick={() => onAction("Redo")}
        />
        <ToolButton
          icon={<Copy size={16} />}
          label="Copy"
          onClick={() => onAction("Selection copied")}
        />
        <ToolButton
          icon={<Clipboard size={16} />}
          label="Paste"
          onClick={() => onAction("Sequence pasted")}
        />
      </div>

      <div className="separator" />

      <div className="toolbar-group">
        <ToolButton
          icon={<Sparkles size={16} />}
          label="Align"
          primary
          onClick={onAlign}
        />
        <ToolButton
          icon={<GitBranch size={16} />}
          label="Phylogeny"
          onClick={() => onAction("Phylogenetic analysis opened")}
        />
        <ToolButton
          icon={<BarChart3 size={16} />}
          label="Analyze"
          onClick={onAnalyze}
        />
      </div>

      <div className="toolbar-spacer" />

      <div className="zoom-control">
        <ZoomOut size={14} />
        <input
          type="range"
          min={50}
          max={180}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          aria-label="Alignment zoom"
        />
        <ZoomIn size={14} />
        <span>{zoom}%</span>
      </div>

      <AlignCenter size={15} className="toolbar-end-icon" />
    </div>
  );
}
