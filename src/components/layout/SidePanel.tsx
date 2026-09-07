import { AlignCenter, GitBranch, Layers3, Plus, Terminal, MoreHorizontal } from "lucide-react"
import type { ProjectNode } from "../../types/bioinformatics";
import { ProjectTree } from "../project/ProjectTree";

interface SidePanelProps {
  nodes: ProjectNode[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: ProjectNode) => void;
}

export function SidePanel({
  nodes,
  expanded,
  onToggle,
  onSelect,
}: SidePanelProps) {
  return (
    <aside className="sidebar">
      <div className="panel-title">
        <span>PROJECT</span>
        <div>
          <button className="icon-button" title="New project">
            <Plus size={15} />
          </button>
          <button className="icon-button" title="More">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      <div className="project-path">
        <span className="status-dot success" />
        /home/user/projects/lag
      </div>

      <ProjectTree
        nodes={nodes}
        expanded={expanded}
        onToggle={onToggle}
        onSelect={onSelect}
      />

      <div className="side-section">
        <div className="panel-title compact">
          <span>TOOLS</span>
        </div>

        <button className="tool-link">
          <AlignCenter size={15} />
          <span>Multiple Sequence Alignment</span>
        </button>

        <button className="tool-link">
          <GitBranch size={15} />
          <span>Phylogenetic Tree</span>
        </button>

        <button className="tool-link">
          <Layers3 size={15} />
          <span>Genome Browser</span>
        </button>

        <button className="tool-link">
          <Terminal size={15} />
          <span>External Tools</span>
        </button>
      </div>
    </aside>
  );
}
