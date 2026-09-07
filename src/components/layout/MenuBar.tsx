import { ChevronDown, PanelLeft, SlidersHorizontal, Sun } from "lucide-react"
interface MenuBarProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
}

export function MenuBar({
  darkMode,
  sidebarOpen,
  inspectorOpen,
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
        {["File", "Edit", "View", "Tools", "Actions", "Settings"].map((item) => (
          <button key={item}>
            {item}
            <ChevronDown size={12} />
          </button>
        ))}
        <button>Help</button>
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
