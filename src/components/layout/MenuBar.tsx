import { ChevronDown, PanelLeft, SlidersHorizontal, Sun } from "lucide-react"

const menuItems = [
  {
    label: "File",
    items: ["New Project", "Open", "Open Recent", "Save", "Save As", "Import Sequence", "Export"],
  },
  {
    label: "Edit",
    items: ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All", "Find"],
  },
  {
    label: "View",
    items: ["Project Panel", "Inspector", "Theme", "Zoom In", "Zoom Out", "Reset View"],
  },
  {
    label: "Tools",
    items: ["Align", "Analyze", "Workflow", "Consensus", "Grid Overlay", "Ruler Settings"],
  },
  {
    label: "Actions",
    items: ["Run Alignment", "Transfer Workflow", "Refresh Data", "Validate Session", "Open Log"],
  },
  {
    label: "Settings",
    items: ["Preferences", "Workspace", "Project Settings", "Keyboard Shortcuts", "About"],
  },
  {
    label: "Help",
    items: ["Documentation", "Keyboard Shortcuts", "Community", "Support", "About"],
  },
];

interface MenuBarProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  onOpenWorkflowPage: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
}

export function MenuBar({
  darkMode,
  sidebarOpen,
  inspectorOpen,
  onOpenWorkflowPage,
  onToggleTheme,
  onToggleSidebar,
  onToggleInspector,
}: MenuBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">L</div>
        <div>
          <div className="brand-title">LAG</div>
          <div className="brand-subtitle">Bioinformatics Workbench</div>
        </div>
      </div>

      <nav className="menu" aria-label="Application menu">
        {menuItems.map(({ label, items }) => (
          <div className="menu-item" key={label}>
            <button type="button" className="menu-trigger" aria-haspopup="menu">
              {label}
              <ChevronDown size={12} />
            </button>
            <ul className="submenu" role="menu" aria-label={`${label} submenu`}>
              {items.map((subItem) => (
                <li key={subItem}>
                  <button type="button" className="submenu-item" role="menuitem" onClick={onOpenWorkflowPage}>
                    {subItem}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="top-actions">
        <button
          className={`icon-button ${sidebarOpen ? "active" : ""}`}
          title="Toggle project panel"
          onClick={onToggleSidebar}
        >
          <PanelLeft size={17} />
        </button>
        <button
          className={`icon-button ${inspectorOpen ? "active" : ""}`}
          title="Toggle inspector"
          onClick={onToggleInspector}
        >
          <SlidersHorizontal size={17} />
        </button>
        <button
          className="icon-button"
          title={`Switch to ${darkMode ? "light" : "dark"} theme`}
          onClick={onToggleTheme}
        >
          <Sun size={17} />
        </button>
        <div className="avatar">NO</div>
      </div>
    </header>
  );
}
