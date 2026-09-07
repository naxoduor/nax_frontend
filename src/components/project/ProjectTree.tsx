import type { ProjectNode } from "../../types/bioinformatics";
import { ProjectItem } from "./ProjectItem";
interface ProjectTreeProps {
  nodes: ProjectNode[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: ProjectNode) => void;
  depth?: number;
}

export function ProjectTree({
  nodes,
  expanded,
  onToggle,
  onSelect,
  depth = 0,
}: ProjectTreeProps) {
  return (
    <div className="tree">
      {nodes.map((node) => (
        <div key={node.id}>
          <ProjectItem
            node={node}
            depth={depth}
            expanded={Boolean(expanded[node.id])}
            onToggle={onToggle}
            onSelect={onSelect}
          />

          {node.type === "folder" && expanded[node.id] && node.children && (
            <ProjectTree
              nodes={node.children}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
