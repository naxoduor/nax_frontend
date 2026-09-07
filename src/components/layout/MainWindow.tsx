import type { AppStatus, ProjectNode, Sequence, SelectionRange } from "../../types/bioinformatics"
import { MenuBar } from "./MenuBar";
import { ToolBar } from "./ToolBar";
import { SidePanel } from "./SidePanel";
import { StatusBar } from "./StatusBar";
import { AlignmentViewer } from "../alignment/AlignmentViewer";

interface MainWindowProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  sequences: Sequence[];
  projectTree: ProjectNode[];
  expanded: Record<string, boolean>;
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showConsensus: boolean;
  showGrid: boolean;
  activeTab: string;
  status: AppStatus;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleInspector: () => void;
  onToggleExpanded: (id: string) => void;
  onSelectProjectNode: (node: ProjectNode) => void;
  onSelectSequence: (id: string) => void;
  onSelectionChange: (selection: SelectionRange) => void;
  onZoomChange: (zoom: number) => void;
  onToggleConsensus: () => void;
  onToggleGrid: () => void;
  onOpenDialog: () => void;
  onImport: () => void;
  onAlign: () => void;
  onAnalyze: () => void;
  onAction: (message: string) => void;
  onOpenInspector: () => void;
}

export function MainWindow(props: MainWindowProps) {
  const columns = props.sequences[0]?.sequence.length ?? 0;

  return (
    <div className={props.darkMode ? "app dark" : "app light"}>
      <MenuBar
        darkMode={props.darkMode}
        sidebarOpen={props.sidebarOpen}
        inspectorOpen={props.inspectorOpen}
        onToggleTheme={props.onToggleTheme}
        onToggleSidebar={props.onToggleSidebar}
        onToggleInspector={props.onToggleInspector}
      />

      <ToolBar
        zoom={props.zoom}
        onZoomChange={props.onZoomChange}
        onOpen={props.onOpenDialog}
        onImport={props.onImport}
        onAlign={props.onAlign}
        onAnalyze={props.onAnalyze}
        onAction={props.onAction}
      />

      <div className={`workspace ${props.inspectorOpen ? "" : "no-inspector"} ${props.sidebarOpen ? "" : "no-sidebar"}`}>
        {props.sidebarOpen && (
          <SidePanel
            nodes={props.projectTree}
            expanded={props.expanded}
            onToggle={props.onToggleExpanded}
            onSelect={props.onSelectProjectNode}
          />
        )}

        <main className="main">
          <div className="tabs">
            <div className="tabs-left">
              <button className="tab">
                BRCA1.fasta
                <span className="tab-close">×</span>
              </button>
              <button className="tab active">
                {props.activeTab}
                <span className="tab-close">×</span>
              </button>
              <button className="tab">
                Results
                <span className="tab-close">×</span>
              </button>
            </div>
          </div>

          <AlignmentViewer
            sequences={props.sequences}
            selectedSequenceIds={props.selectedSequenceIds}
            selection={props.selection}
            zoom={props.zoom}
            showConsensus={props.showConsensus}
            showGrid={props.showGrid}
            onSelectSequence={props.onSelectSequence}
            onSelectionChange={props.onSelectionChange}
            onToggleConsensus={props.onToggleConsensus}
            onToggleGrid={props.onToggleGrid}
            onAction={props.onAction}
          />

          <div className="bottom-panel">
            <div className="bottom-tabs">
              <button className="active">Tasks</button>
              <button>Console</button>
              <button>Log</button>
            </div>
            <div className="task-row">
              <div className="task-icon">✓</div>
              <div className="task-text">
                <strong>BRCA1_MSA.aln</strong>
                <span>Alignment workspace loaded</span>
              </div>
              <div className="task-progress">
                <div className="progress-fill" />
              </div>
              <span className="task-state">Completed</span>
            </div>
          </div>
        </main>

        {props.inspectorOpen && (
          <Inspector
            sequences={props.sequences}
            selectedSequenceIds={props.selectedSequenceIds}
            selection={props.selection}
            columnCount={columns}
            onAction={props.onAction}
            onClose={props.onToggleInspector}
          />
        )}
      </div>

      <StatusBar
        status={props.status}
        sequenceCount={props.sequences.length}
        columnCount={columns}
        column={props.selection.start}
      />
    </div>
  );
}

function Inspector({
  sequences,
  selectedSequenceIds,
  selection,
  columnCount,
  onAction,
  onClose,
}: {
  sequences: Sequence[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  columnCount: number;
  onAction: (message: string) => void;
  onClose: () => void;
}) {
  const selected = sequences.filter((sequence) =>
    selectedSequenceIds.includes(sequence.id),
  );

  return (
    <aside className="inspector">
      <div className="panel-title">
        <span>INSPECTOR</span>
        <button className="icon-button" onClick={onClose} title="Close inspector">
          ×
        </button>
      </div>

      <div className="inspector-card">
        <div className="card-heading">Selection</div>
        <Property label="Sequences" value={selected.length} />
        <Property label="Start" value={selection.start} />
        <Property label="End" value={selection.end} />
        <Property
          label="Length"
          value={selection.end - selection.start + 1}
        />
      </div>

      <div className="inspector-card">
        <div className="card-heading">Alignment</div>
        <Property label="Sequences" value={sequences.length} />
        <Property label="Columns" value={columnCount} />
        <Property label="Algorithm" value="Clustal Omega" />
        <Property label="Identity" value="87.4%" />
      </div>

      <div className="inspector-card">
        <div className="card-heading">Color scheme</div>
        <div className="scheme">
          <span className="nucleotide A">A</span>
          <span className="nucleotide T">T</span>
          <span className="nucleotide G">G</span>
          <span className="nucleotide C">C</span>
          <span className="nucleotide gap">-</span>
        </div>

        <select defaultValue="nucleotide">
          <option value="nucleotide">Nucleotide</option>
          <option value="clustal">Clustal</option>
          <option value="hydrophobicity">Hydrophobicity</option>
        </select>
      </div>

      <div className="inspector-card">
        <div className="card-heading">Quick actions</div>
        <button
          className="action-button"
          onClick={() => onAction("Reverse complement")}
        >
          Reverse complement
        </button>
        <button
          className="action-button"
          onClick={() => onAction("Translation opened")}
        >
          Translate sequence
        </button>
        <button
          className="action-button"
          onClick={() => onAction("Consensus exported")}
        >
          Export consensus
        </button>
      </div>
    </aside>
  );
}

function Property({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="property">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
