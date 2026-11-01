import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Database, Dna, FlaskConical, Settings2 } from "lucide-react";
import { NODE_DEFINITIONS } from "../../nodeDefinitions";

const icons: Record<string, React.ReactNode> = {
  Data: <Database size={15} />,
  Alignment: <Dna size={15} />,
  NGS: <FlaskConical size={15} />,
  Analysis: <FlaskConical size={15} />,
  Utility: <Settings2 size={15} />
};

export default function Palette() {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = [...new Set(NODE_DEFINITIONS.map((n) => n.category))];
  const filtered = NODE_DEFINITIONS.filter((n) =>
    `${n.label} ${n.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const dragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/ugene-node", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="palette panel">
      <div className="panel-heading">WORKFLOW</div>
      <div className="palette-search">
        <Search size={15} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tools..." />
      </div>

      {categories.map((category) => {
        const nodes = filtered.filter((n) => n.category === category);
        if (!nodes.length) return null;
        const isCollapsed = collapsed[category];
        return (
          <section key={category} className="palette-group">
            <button
              className="group-heading"
              onClick={() => setCollapsed((v) => ({ ...v, [category]: !v[category] }))}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {icons[category]}
              <span>{category}</span>
            </button>
            {!isCollapsed && nodes.map((n) => (
              <div
                key={n.type}
                draggable
                onDragStart={(e) => dragStart(e, n.type)}
                className="palette-item"
                title={n.description}
              >
                <span className="tool-dot" />
                {n.label}
              </div>
            ))}
          </section>
        );
      })}
    </aside>
  );
}
