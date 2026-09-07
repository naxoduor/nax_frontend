import {
  AlignCenter,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
} from "lucide-react";
import type { ProjectNode } from "../../types/bioinformatics"

interface ProjectItemProps {
  node: ProjectNode;
  depth: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: ProjectNode) => void;
}

export function ProjectItem({
  node,
  depth,
  expanded,
  onToggle,
  onSelect,
}: ProjectItemProps) {
  const isFolder = node.type === "folder";

  return (
    <button
      className={`tree-row depth-${Math.min(depth, 2)}`}
      onClick={() => {
        onSelect(node);
        if (isFolder) onToggle(node.id);
      }}
    >
      {isFolder ? (
        expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
      ) : (
        <span className="tree-indent" />
      )}

      {isFolder ? (
        <Folder size={15} />
      ) : node.type === "alignment" ? (
        <AlignCenter size={15} />
      ) : (
        <FileText size={15} />
      )}

      <span>{node.label}</span>
    </button>
  );
}
