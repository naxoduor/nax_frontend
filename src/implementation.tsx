from pathlib import Path
import shutil, zipfile, textwrap

root = Path("/mnt/data/lag-ugene-react-ts")
if root.exists():
    shutil.rmtree(root)
(root/"src/components/layout").mkdir(parents=True)
(root/"src/components/project").mkdir(parents=True)
(root/"src/components/sequence").mkdir(parents=True)
(root/"src/components/alignment").mkdir(parents=True)
(root/"src/components/dialogs").mkdir(parents=True)
(root/"src/pages").mkdir(parents=True)
(root/"src/services").mkdir(parents=True)
(root/"src/store").mkdir(parents=True)
(root/"src/types").mkdir(parents=True)

files = {
"package.json": r'''{
  "name": "lag-ugene-react-ts",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.1"
  }
}''',

"index.html": r'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LAG — UGENE-style Bioinformatics Workbench</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>''',

"tsconfig.json": r'''{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}''',

"tsconfig.app.json": r'''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}''',

"tsconfig.node.json": r'''{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}''',

"vite.config.ts": r'''import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});''',

"src/types/bioinformatics.ts": r'''export type SequenceType = "DNA" | "RNA" | "PROTEIN";

export interface Sequence {
  id: string;
  description: string;
  sequence: string;
  type: SequenceType;
}

export type ProjectNodeType = "folder" | "sequence" | "alignment" | "bam" | "vcf";

export interface ProjectNode {
  id: string;
  label: string;
  type: ProjectNodeType;
  children?: ProjectNode[];
}

export interface SelectionRange {
  start: number;
  end: number;
}

export type DialogType = "open" | "align" | "analysis" | null;

export interface AlignmentOptions {
  algorithm: "Clustal Omega" | "MAFFT" | "Kalign";
  gapOpen: number;
  gapExtend: number;
}

export interface AnalysisOptions {
  analysis: "Consensus" | "Conservation" | "Translation" | "GC Content";
}

export interface AppStatus {
  message: string;
  kind: "ready" | "running" | "success" | "error";
}''',

"src/services/alignment.ts": r'''import type { AlignmentOptions, Sequence } from "../types/bioinformatics";

export function calculateConsensus(sequences: Sequence[]): string {
  if (!sequences.length) return "";

  const length = Math.max(...sequences.map((s) => s.sequence.length));

  return Array.from({ length }, (_, index) => {
    const counts = new Map<string, number>();

    for (const sequence of sequences) {
      const base = sequence.sequence[index] ?? "-";
      counts.set(base, (counts.get(base) ?? 0) + 1);
    }

    let best = "-";
    let bestCount = -1;

    for (const [base, count] of counts.entries()) {
      if (count > bestCount) {
        best = base;
        bestCount = count;
      }
    }

    return best;
  }).join("");
}

export function calculateIdentity(sequences: Sequence[]): number {
  if (sequences.length < 2) return sequences.length ? 100 : 0;

  const length = Math.max(...sequences.map((s) => s.sequence.length));
  let identical = 0;
  let comparable = 0;

  for (let i = 0; i < length; i += 1) {
    const chars = sequences
      .map((s) => s.sequence[i] ?? "-")
      .filter((c) => c !== "-");

    if (!chars.length) continue;

    comparable += 1;
    if (new Set(chars).size === 1) identical += 1;
  }

  return comparable ? (identical / comparable) * 100 : 0;
}

export function gcContent(sequence: string): number {
  const clean = sequence.toUpperCase().replace(/[^ACGT]/g, "");
  if (!clean.length) return 0;

  const gc = [...clean].filter((base) => base === "G" || base === "C").length;
  return (gc / clean.length) * 100;
}

export function reverseComplement(sequence: string): string {
  const complements: Record<string, string> = {
    A: "T",
    T: "A",
    G: "C",
    C: "G",
    U: "A",
    N: "N",
    "-": "-",
  };

  return [...sequence.toUpperCase()]
    .reverse()
    .map((base) => complements[base] ?? "N")
    .join("");
}

export function simulateAlignment(
  sequences: Sequence[],
  options: AlignmentOptions,
): Promise<Sequence[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const maxLength = Math.max(...sequences.map((s) => s.sequence.length));

      const aligned = sequences.map((sequence, sequenceIndex) => {
        let value = sequence.sequence.padEnd(maxLength, "-");

        // Small deterministic visual variation for the demo.
        if (options.algorithm !== "Clustal Omega" && sequenceIndex % 2 === 1) {
          value = value.slice(0, 8) + "-" + value.slice(8);
        }

        return {
          ...sequence,
          sequence: value.slice(0, maxLength + 1),
        };
      });

      resolve(aligned);
    }, 900);
  });
}''',

"src/services/api.ts": r'''import type {
  AlignmentOptions,
  AnalysisOptions,
  ProjectNode,
  Sequence,
} from "../types/bioinformatics";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<ProjectNode[]>("/projects"),

  getSequence: (id: string) =>
    request<Sequence>(`/sequences/${encodeURIComponent(id)}`),

  getAlignment: (id: string) =>
    request<Sequence[]>(`/alignments/${encodeURIComponent(id)}`),

  createAlignment: (sequenceIds: string[], options: AlignmentOptions) =>
    request<{ taskId: string }>("/alignments", {
      method: "POST",
      body: JSON.stringify({ sequenceIds, options }),
    }),

  getTask: (taskId: string) =>
    request<{ id: string; status: string; progress: number }>(
      `/tasks/${encodeURIComponent(taskId)}`,
    ),

  runAnalysis: (sequenceIds: string[], options: AnalysisOptions) =>
    request<{ taskId: string }>("/analysis", {
      method: "POST",
      body: JSON.stringify({ sequenceIds, options }),
    }),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json() as Promise<ProjectNode>;
  },
};''',

"src/store/projectStore.ts": r'''import type {
  AppStatus,
  DialogType,
  ProjectNode,
  SelectionRange,
  Sequence,
} from "../types/bioinformatics";

export interface ProjectState {
  sequences: Sequence[];
  projectTree: ProjectNode[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showConsensus: boolean;
  showGrid: boolean;
  darkMode: boolean;
  activeDialog: DialogType;
  status: AppStatus;
}

export const initialSequences: Sequence[] = [
  {
    id: "seq1",
    description: "Homo sapiens BRCA1",
    type: "DNA",
    sequence:
      "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
  },
  {
    id: "seq2",
    description: "Mus musculus BRCA1",
    type: "DNA",
    sequence:
      "ATGCGTACGATCGG-TAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGG-TAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
  },
  {
    id: "seq3",
    description: "Danio rerio BRCA1",
    type: "DNA",
    sequence:
      "ATGCGT-CGATCGGCTAGCTAG-TAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAG-TAGGCTAACCGGTACGATCGATCGATCGGCTA",
  },
  {
    id: "seq4",
    description: "Gallus gallus BRCA1",
    type: "DNA",
    sequence:
      "ATGCGTACGATCGGCTAG-TAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
  },
  {
    id: "seq5",
    description: "Xenopus tropicalis BRCA1",
    type: "DNA",
    sequence:
      "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGAT-GATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
  },
  {
    id: "seq6",
    description: "Danio rerio homolog",
    type: "DNA",
    sequence:
      "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACCGGTACGATCGATCGATCGGCTA",
  },
];

export const initialProjectTree: ProjectNode[] = [
  {
    id: "project",
    label: "LAG Project",
    type: "folder",
    children: [
      {
        id: "sequences",
        label: "Sequences",
        type: "folder",
        children: [
          { id: "brca1", label: "BRCA1.fasta", type: "sequence" },
          { id: "tp53", label: "TP53.fasta", type: "sequence" },
        ],
      },
      {
        id: "alignments",
        label: "Alignments",
        type: "folder",
        children: [
          {
            id: "brca1-msa",
            label: "BRCA1_MSA.aln",
            type: "alignment",
          },
        ],
      },
      { id: "bam", label: "BAM / VCF", type: "folder" },
      { id: "results", label: "Analysis Results", type: "folder" },
    ],
  },
];

export const initialProjectState: ProjectState = {
  sequences: initialSequences,
  projectTree: initialProjectTree,
  selectedSequenceIds: ["seq1"],
  selection: { start: 12, end: 42 },
  zoom: 100,
  showConsensus: true,
  showGrid: true,
  darkMode: true,
  activeDialog: null,
  status: { message: "Ready", kind: "ready" },
};''',

"src/components/layout/MenuBar.tsx": r'''import { ChevronDown, PanelLeft, SlidersHorizontal, Sun } from "lucide-react";

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
}''',

"src/components/layout/ToolBar.tsx": r'''import {
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
}''',

"src/components/layout/StatusBar.tsx": r'''import type { AppStatus } from "../../types/bioinformatics";

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
}''',

"src/components/layout/SidePanel.tsx": r'''import { AlignCenter, GitBranch, Layers3, Plus, Terminal, MoreHorizontal } from "lucide-react";
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
}''',

"src/components/layout/MainWindow.tsx": r'''import type { AppStatus, ProjectNode, Sequence, SelectionRange } from "../../types/bioinformatics";
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
}''',

"src/components/project/ProjectItem.tsx": r'''import {
  AlignCenter,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
} from "lucide-react";
import type { ProjectNode } from "../../types/bioinformatics";

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
}''',

"src/components/project/ProjectTree.tsx": r'''import type { ProjectNode } from "../../types/bioinformatics";
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
}''',

"src/components/sequence/SequenceHeader.tsx": r'''interface SequenceHeaderProps {
  id: string;
  description: string;
  rowNumber: number;
  selected: boolean;
  onClick: () => void;
}

export function SequenceHeader({
  id,
  description,
  rowNumber,
  selected,
  onClick,
}: SequenceHeaderProps) {
  return (
    <button
      className={`row-label ${selected ? "selected" : ""}`}
      title={description}
      onClick={onClick}
    >
      <span className="row-number">{rowNumber}</span>
      <span className="row-id">{id}</span>
    </button>
  );
}''',

"src/components/sequence/Ruler.tsx": r'''interface RulerProps {
  columns: number;
  charWidth: number;
  onColumnClick: (column: number) => void;
}

export function Ruler({ columns, charWidth, onColumnClick }: RulerProps) {
  const step = Math.max(5, Math.round(10 / (charWidth / 10)));

  return (
    <div className="ruler" style={{ width: columns * charWidth }}>
      {Array.from({ length: columns }, (_, index) =>
        index % step === 0 ? (
          <button
            key={index}
            className="ruler-label"
            style={{ left: index * charWidth }}
            onClick={() => onColumnClick(index + 1)}
          >
            {index + 1}
          </button>
        ) : null,
      )}
    </div>
  );
}''',

"src/components/sequence/Selection.tsx": r'''import type { SelectionRange } from "../../types/bioinformatics";

interface SelectionProps {
  range: SelectionRange;
  column: number;
}

export function Selection({ range, column }: SelectionProps) {
  if (column < range.start || column > range.end) {
    return null;
  }

  return <span className="selection-overlay" aria-hidden="true" />;
}''',

"src/components/sequence/SequenceRow.tsx": r'''import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { SequenceHeader } from "./SequenceHeader";

interface SequenceRowProps {
  sequence: Sequence;
  rowNumber: number;
  selected: boolean;
  selection: SelectionRange;
  charWidth: number;
  showGrid: boolean;
  onSelectSequence: () => void;
  onColumnClick: (column: number) => void;
}

export function SequenceRow({
  sequence,
  rowNumber,
  selected,
  selection,
  charWidth,
  showGrid,
  onSelectSequence,
  onColumnClick,
}: SequenceRowProps) {
  return (
    <div
      className="sequence-row"
      style={{ width: sequence.sequence.length * charWidth + 145 }}
    >
      <SequenceHeader
        id={sequence.id}
        description={sequence.description}
        rowNumber={rowNumber}
        selected={selected}
        onClick={onSelectSequence}
      />

      <div className="bases">
        {[...sequence.sequence].map((character, index) => (
          <button
            key={`${sequence.id}-${index}`}
            className={`base base-${character.toUpperCase()} ${
              index + 1 >= selection.start && index + 1 <= selection.end
                ? "selected"
                : ""
            } ${showGrid ? "grid" : ""}`}
            style={{ width: charWidth }}
            onClick={() => onColumnClick(index + 1)}
            title={`${sequence.id}:${index + 1}`}
          >
            {character}
          </button>
        ))}
      </div>
    </div>
  );
}''',

"src/components/sequence/SequenceViewer.tsx": r'''import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { Ruler } from "./Ruler";
import { SequenceRow } from "./SequenceRow";

interface SequenceViewerProps {
  sequences: Sequence[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showGrid: boolean;
  onSelectSequence: (id: string) => void;
  onSelectionChange: (range: SelectionRange) => void;
}

export function SequenceViewer({
  sequences,
  selectedSequenceIds,
  selection,
  zoom,
  showGrid,
  onSelectSequence,
  onSelectionChange,
}: SequenceViewerProps) {
  const charWidth = Math.max(8, 10 * (zoom / 100));
  const columns = Math.max(...sequences.map((s) => s.sequence.length), 0);

  const selectColumn = (column: number) => {
    onSelectionChange({ start: column, end: column });
  };

  return (
    <div className="alignment-shell">
      <div className="alignment-corner">
        <div className="corner-title">Sequences</div>
        <div className="corner-subtitle">{sequences.length} loaded</div>
      </div>

      <div className="alignment-scroll">
        <Ruler
          columns={columns}
          charWidth={charWidth}
          onColumnClick={selectColumn}
        />

        {sequences.map((sequence, index) => (
          <SequenceRow
            key={sequence.id}
            sequence={sequence}
            rowNumber={index + 1}
            selected={selectedSequenceIds.includes(sequence.id)}
            selection={selection}
            charWidth={charWidth}
            showGrid={showGrid}
            onSelectSequence={() => onSelectSequence(sequence.id)}
            onColumnClick={selectColumn}
          />
        ))}
      </div>
    </div>
  );
}''',

"src/components/alignment/AlignmentToolbar.tsx": r'''import {
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
}''',

"src/components/alignment/ConsensusRow.tsx": r'''interface ConsensusRowProps {
  consensus: string;
  charWidth: number;
  selection: { start: number; end: number };
  showGrid: boolean;
}

export function ConsensusRow({
  consensus,
  charWidth,
  selection,
  showGrid,
}: ConsensusRowProps) {
  return (
    <div
      className="sequence-row consensus-row"
      style={{ width: consensus.length * charWidth + 145 }}
    >
      <div className="row-label-spacer">
        <span className="consensus-label">CONS</span>
      </div>

      <div className="bases">
        {[...consensus].map((character, index) => {
          const selected =
            index + 1 >= selection.start && index + 1 <= selection.end;

          return (
            <span
              key={index}
              className={`base base-${character.toUpperCase()} ${
                selected ? "selected" : ""
              } ${showGrid ? "grid" : ""}`}
              style={{ width: charWidth }}
            >
              {character}
            </span>
          );
        })}
      </div>
    </div>
  );
}''',

"src/components/alignment/AlignmentRow.tsx": r'''import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { SequenceHeader } from "../sequence/SequenceHeader";

interface AlignmentRowProps {
  sequence: Sequence;
  rowNumber: number;
  selected: boolean;
  selection: SelectionRange;
  charWidth: number;
  showGrid: boolean;
  onSelectSequence: () => void;
  onColumnClick: (column: number, shiftKey: boolean) => void;
}

export function AlignmentRow({
  sequence,
  rowNumber,
  selected,
  selection,
  charWidth,
  showGrid,
  onSelectSequence,
  onColumnClick,
}: AlignmentRowProps) {
  return (
    <div
      className="sequence-row"
      style={{ width: sequence.sequence.length * charWidth + 145 }}
    >
      <SequenceHeader
        id={sequence.id}
        description={sequence.description}
        rowNumber={rowNumber}
        selected={selected}
        onClick={onSelectSequence}
      />

      <div className="bases">
        {[...sequence.sequence].map((character, index) => {
          const column = index + 1;
          const selectedColumn =
            column >= selection.start && column <= selection.end;

          return (
            <button
              key={`${sequence.id}-${index}`}
              className={`base base-${character.toUpperCase()} ${
                selectedColumn ? "selected" : ""
              } ${showGrid ? "grid" : ""}`}
              style={{ width: charWidth }}
              onClick={(event) => onColumnClick(column, event.shiftKey)}
            >
              {character}
            </button>
          );
        })}
      </div>
    </div>
  );
}''',

"src/components/alignment/AlignmentViewer.tsx": r'''import { useMemo, useState } from "react";
import type { Sequence, SelectionRange } from "../../types/bioinformatics";
import { calculateConsensus } from "../../services/alignment";
import { AlignmentToolbar } from "./AlignmentToolbar";
import { ConsensusRow } from "./ConsensusRow";
import { AlignmentRow } from "./AlignmentRow";
import { Ruler } from "../sequence/Ruler";

interface AlignmentViewerProps {
  sequences: Sequence[];
  selectedSequenceIds: string[];
  selection: SelectionRange;
  zoom: number;
  showConsensus: boolean;
  showGrid: boolean;
  onSelectSequence: (id: string) => void;
  onSelectionChange: (range: SelectionRange) => void;
  onToggleConsensus: () => void;
  onToggleGrid: () => void;
  onAction: (message: string) => void;
}

export function AlignmentViewer({
  sequences,
  selectedSequenceIds,
  selection,
  zoom,
  showConsensus,
  showGrid,
  onSelectSequence,
  onSelectionChange,
  onToggleConsensus,
  onToggleGrid,
  onAction,
}: AlignmentViewerProps) {
  const [search, setSearch] = useState("");

  const filteredSequences = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sequences;

    return sequences.filter(
      (sequence) =>
        sequence.id.toLowerCase().includes(query) ||
        sequence.description.toLowerCase().includes(query),
    );
  }, [sequences, search]);

  const consensus = useMemo(
    () => calculateConsensus(filteredSequences),
    [filteredSequences],
  );

  const columns = Math.max(
    consensus.length,
    ...filteredSequences.map((s) => s.sequence.length),
    0,
  );

  const charWidth = Math.max(8, 10 * (zoom / 100));

  const handleColumnClick = (column: number, shiftKey: boolean) => {
    if (shiftKey) {
      onSelectionChange({
        start: Math.min(selection.start, column),
        end: Math.max(selection.end, column),
      });
    } else {
      onSelectionChange({ start: column, end: column });
    }
  };

  return (
    <div className="editor">
      <AlignmentToolbar
        showConsensus={showConsensus}
        showGrid={showGrid}
        search={search}
        onSearchChange={setSearch}
        onToggleConsensus={onToggleConsensus}
        onToggleGrid={onToggleGrid}
        onAction={onAction}
      />

      <div className="alignment-shell">
        <div className="alignment-corner">
          <div className="corner-title">Multiple Sequence Alignment</div>
          <div className="corner-subtitle">
            {filteredSequences.length} sequences
          </div>
        </div>

        <div className="alignment-scroll">
          <Ruler
            columns={columns}
            charWidth={charWidth}
            onColumnClick={(column) => handleColumnClick(column, false)}
          />

          {showConsensus && (
            <ConsensusRow
              consensus={consensus}
              charWidth={charWidth}
              selection={selection}
              showGrid={showGrid}
            />
          )}

          {filteredSequences.map((sequence, index) => (
            <AlignmentRow
              key={sequence.id}
              sequence={sequence}
              rowNumber={index + 1}
              selected={selectedSequenceIds.includes(sequence.id)}
              selection={selection}
              charWidth={charWidth}
              showGrid={showGrid}
              onSelectSequence={() => onSelectSequence(sequence.id)}
              onColumnClick={handleColumnClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}''',

"src/components/dialogs/OpenFileDialog.tsx": r'''import { useRef } from "react";
import { Upload, X } from "lucide-react";

interface OpenFileDialogProps {
  onClose: () => void;
  onFile: (file: File) => void;
}

export function OpenFileDialog({ onClose, onFile }: OpenFileDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <strong>Open Sequence File</strong>
            <span>Import FASTA, FASTQ, or alignment files</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div
          className="dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) onFile(file);
          }}
        >
          <Upload size={28} />
          <strong>Drop a sequence file here</strong>
          <span>or click to browse your computer</span>
          <small>Supported: .fa .fasta .fas .fna .fastq .fq .aln</small>
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".fa,.fasta,.fas,.fna,.fastq,.fq,.aln,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />

        <div className="dialog-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
        </div>
      </div>
    </div>
  );
}''',

"src/components/dialogs/AlignDialog.tsx": r'''import { useState } from "react";
import { X } from "lucide-react";
import type { AlignmentOptions } from "../../types/bioinformatics";

interface AlignDialogProps {
  selectedCount: number;
  onClose: () => void;
  onRun: (options: AlignmentOptions) => void;
}

export function AlignDialog({
  selectedCount,
  onClose,
  onRun,
}: AlignDialogProps) {
  const [algorithm, setAlgorithm] =
    useState<AlignmentOptions["algorithm"]>("Clustal Omega");
  const [gapOpen, setGapOpen] = useState(-10);
  const [gapExtend, setGapExtend] = useState(-0.2);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="dialog small" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <strong>Multiple Sequence Alignment</strong>
            <span>{selectedCount} selected sequence(s)</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="form">
          <label>
            Alignment algorithm
            <select
              value={algorithm}
              onChange={(event) =>
                setAlgorithm(event.target.value as AlignmentOptions["algorithm"])
              }
            >
              <option>Clustal Omega</option>
              <option>MAFFT</option>
              <option>Kalign</option>
            </select>
          </label>

          <label>
            Gap opening penalty
            <input
              type="number"
              value={gapOpen}
              onChange={(event) => setGapOpen(Number(event.target.value))}
            />
          </label>

          <label>
            Gap extension penalty
            <input
              type="number"
              step="0.1"
              value={gapExtend}
              onChange={(event) => setGapExtend(Number(event.target.value))}
            />
          </label>
        </div>

        <div className="dialog-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() =>
              onRun({
                algorithm,
                gapOpen,
                gapExtend,
              })
            }
          >
            Run alignment
          </button>
        </div>
      </div>
    </div>
  );
}''',

"src/components/dialogs/AnalysisDialog.tsx": r'''import { useState } from "react";
import { X } from "lucide-react";
import type { AnalysisOptions } from "../../types/bioinformatics";

interface AnalysisDialogProps {
  selectedCount: number;
  onClose: () => void;
  onRun: (options: AnalysisOptions) => void;
}

export function AnalysisDialog({
  selectedCount,
  onClose,
  onRun,
}: AnalysisDialogProps) {
  const [analysis, setAnalysis] =
    useState<AnalysisOptions["analysis"]>("Consensus");

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="dialog small" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <strong>Sequence Analysis</strong>
            <span>{selectedCount} selected sequence(s)</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="form">
          <label>
            Analysis
            <select
              value={analysis}
              onChange={(event) =>
                setAnalysis(event.target.value as AnalysisOptions["analysis"])
              }
            >
              <option>Consensus</option>
              <option>Conservation</option>
              <option>Translation</option>
              <option>GC Content</option>
            </select>
          </label>
        </div>

        <div className="dialog-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => onRun({ analysis })}
          >
            Run analysis
          </button>
        </div>
      </div>
    </div>
  );
}''',

"src/pages/Workspace.tsx": r'''import { useCallback, useMemo, useState } from "react";
import { MainWindow } from "../components/layout/MainWindow";
import { OpenFileDialog } from "../components/dialogs/OpenFileDialog";
import { AlignDialog } from "../components/dialogs/AlignDialog";
import { AnalysisDialog } from "../components/dialogs/AnalysisDialog";
import { initialProjectState } from "../store/projectStore";
import { simulateAlignment, gcContent } from "../services/alignment";
import type {
  AlignmentOptions,
  AnalysisOptions,
  DialogType,
  ProjectNode,
  SelectionRange,
  Sequence,
} from "../types/bioinformatics";

function parseSequenceFile(content: string, fileName: string): Sequence[] {
  const isFastq = fileName.toLowerCase().endsWith(".fastq") ||
    fileName.toLowerCase().endsWith(".fq");

  if (isFastq) {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const sequences: Sequence[] = [];

    for (let i = 0; i + 1 < lines.length; i += 4) {
      const header = lines[i]?.replace(/^@/, "").trim() || `seq${i / 4 + 1}`;
      const sequence = lines[i + 1]?.trim().toUpperCase() ?? "";

      if (sequence) {
        sequences.push({
          id: header.split(/\s+/)[0],
          description: header,
          sequence,
          type: "DNA",
        });
      }
    }

    return sequences;
  }

  const records: Sequence[] = [];
  let current: Sequence | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith(">")) {
      if (current) records.push(current);

      const header = line.slice(1).trim();
      const [id, ...description] = header.split(/\s+/);

      current = {
        id: id || `seq${records.length + 1}`,
        description: description.join(" ") || header,
        sequence: "",
        type: "DNA",
      };
    } else if (current) {
      current.sequence += line.replace(/\s+/g, "").toUpperCase();
    }
  }

  if (current) records.push(current);

  return records;
}

export function Workspace() {
  const [state, setState] = useState(initialProjectState);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    project: true,
    sequences: true,
    alignments: true,
  });

  const selectedSequences = useMemo(
    () =>
      state.sequences.filter((sequence) =>
        state.selectedSequenceIds.includes(sequence.id),
      ),
    [state.sequences, state.selectedSequenceIds],
  );

  const setStatus = useCallback(
    (message: string, kind: "ready" | "running" | "success" | "error" = "ready") => {
      setState((current) => ({
        ...current,
        status: { message, kind },
      }));
    },
    [],
  );

  const handleAction = useCallback(
    (message: string) => {
      setStatus(message, "success");
      window.setTimeout(() => setStatus("Ready", "ready"), 1800);
    },
    [setStatus],
  );

  const handleSelectSequence = (id: string) => {
    setState((current) => {
      const exists = current.selectedSequenceIds.includes(id);

      return {
        ...current,
        selectedSequenceIds: exists
          ? current.selectedSequenceIds.filter((item) => item !== id)
          : [...current.selectedSequenceIds, id],
      };
    });
  };

  const handleAlignment = async (options: AlignmentOptions) => {
    if (!selectedSequences.length) {
      handleAction("Select at least one sequence");
      return;
    }

    setState((current) => ({
      ...current,
      activeDialog: null,
      status: {
        message: `Running ${options.algorithm}...`,
        kind: "running",
      },
    }));

    const aligned = await simulateAlignment(selectedSequences, options);

    setState((current) => {
      const ids = new Set(aligned.map((sequence) => sequence.id));

      return {
        ...current,
        sequences: current.sequences.map((sequence) =>
          ids.has(sequence.id)
            ? aligned.find((item) => item.id === sequence.id) ?? sequence
            : sequence,
        ),
        status: {
          message: `${options.algorithm} alignment completed`,
          kind: "success",
        },
      };
    });

    window.setTimeout(() => setStatus("Ready", "ready"), 2200);
  };

  const handleAnalysis = (options: AnalysisOptions) => {
    if (!selectedSequences.length) {
      handleAction("Select at least one sequence");
      return;
    }

    let message = `${options.analysis} analysis completed`;

    if (options.analysis === "GC Content") {
      const average =
        selectedSequences.reduce(
          (sum, sequence) => sum + gcContent(sequence.sequence),
          0,
        ) / selectedSequences.length;

      message = `Average GC content: ${average.toFixed(2)}%`;
    }

    setState((current) => ({
      ...current,
      activeDialog: null,
      status: {
        message,
        kind: "success",
      },
    }));

    window.setTimeout(() => setStatus("Ready", "ready"), 2500);
  };

  const handleFile = async (file: File) => {
    try {
      const content = await file.text();
      const sequences = parseSequenceFile(content, file.name);

      if (!sequences.length) {
        setStatus("No sequences found in file", "error");
        return;
      }

      setState((current) => ({
        ...current,
        sequences,
        selectedSequenceIds: [sequences[0].id],
        activeDialog: null,
        status: {
          message: `${sequences.length} sequence(s) loaded from ${file.name}`,
          kind: "success",
        },
      }));

      window.setTimeout(() => setStatus("Ready", "ready"), 2500);
    } catch {
      setStatus("Could not read sequence file", "error");
    }
  };

  const handleProjectNode = (node: ProjectNode) => {
    if (node.type === "alignment") {
      handleAction(`Opened ${node.label}`);
    } else if (node.type !== "folder") {
      handleAction(`Selected ${node.label}`);
    }
  };

  const handleImport = () => {
    setState((current) => ({ ...current, activeDialog: "open" }));
  };

  const setDialog = (dialog: DialogType) => {
    setState((current) => ({ ...current, activeDialog: dialog }));
  };

  return (
    <>
      <MainWindow
        darkMode={state.darkMode}
        sidebarOpen={sidebarOpen}
        inspectorOpen={inspectorOpen}
        sequences={state.sequences}
        projectTree={state.projectTree}
        expanded={expanded}
        selectedSequenceIds={state.selectedSequenceIds}
        selection={state.selection}
        zoom={state.zoom}
        showConsensus={state.showConsensus}
        showGrid={state.showGrid}
        activeTab="BRCA1_MSA.aln"
        status={state.status}
        onToggleTheme={() =>
          setState((current) => ({
            ...current,
            darkMode: !current.darkMode,
          }))
        }
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        onToggleInspector={() => setInspectorOpen((value) => !value)}
        onToggleExpanded={(id) =>
          setExpanded((current) => ({ ...current, [id]: !current[id] }))
        }
        onSelectProjectNode={handleProjectNode}
        onSelectSequence={handleSelectSequence}
        onSelectionChange={(selection: SelectionRange) =>
          setState((current) => ({ ...current, selection }))
        }
        onZoomChange={(zoom) =>
          setState((current) => ({ ...current, zoom }))
        }
        onToggleConsensus={() =>
          setState((current) => ({
            ...current,
            showConsensus: !current.showConsensus,
          }))
        }
        onToggleGrid={() =>
          setState((current) => ({
            ...current,
            showGrid: !current.showGrid,
          }))
        }
        onOpenDialog={() => setDialog("open")}
        onImport={handleImport}
        onAlign={() => setDialog("align")}
        onAnalyze={() => setDialog("analysis")}
        onAction={handleAction}
        onOpenInspector={() => setInspectorOpen(true)}
      />

      {state.activeDialog === "open" && (
        <OpenFileDialog
          onClose={() => setDialog(null)}
          onFile={handleFile}
        />
      )}

      {state.activeDialog === "align" && (
        <AlignDialog
          selectedCount={selectedSequences.length}
          onClose={() => setDialog(null)}
          onRun={handleAlignment}
        />
      )}

      {state.activeDialog === "analysis" && (
        <AnalysisDialog
          selectedCount={selectedSequences.length}
          onClose={() => setDialog(null)}
          onRun={handleAnalysis}
        />
      )}
    </>
  );
}''',

"src/App.tsx": r'''import { Workspace } from "./pages/Workspace";

export default function App() {
  return <Workspace />;
}''',

"src/main.tsx": r'''import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);''',

"src/styles.css": r''':root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #d8dee9;
  background: #11151b;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 1050px;
  overflow: hidden;
}

button,
input,
select {
  font: inherit;
}

button {
  color: inherit;
}

.app {
  height: 100vh;
  display: grid;
  grid-template-rows: 58px 48px minmax(0, 1fr) 25px;
  background: #11151b;
  color: #d8dee9;
}

.app.light {
  background: #f5f7fa;
  color: #263241;
}

.topbar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #252c35;
  background: #171c23;
  padding: 0 12px;
  gap: 24px;
}

.light .topbar {
  background: #ffffff;
  border-color: #dfe4ea;
}

.brand {
  width: 215px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #3278c7;
  color: white;
  font-size: 20px;
  font-weight: 800;
}

.brand-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: .08em;
}

.brand-subtitle {
  font-size: 10px;
  color: #7f8b9a;
  margin-top: 1px;
}

.menu {
  display: flex;
  gap: 3px;
  align-self: stretch;
  align-items: center;
}

.menu button {
  background: transparent;
  border: 0;
  padding: 7px 9px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #aeb7c4;
  cursor: pointer;
}

.menu button:hover {
  background: #222933;
  color: #fff;
}

.top-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-button {
  border: 1px solid transparent;
  background: transparent;
  width: 30px;
  height: 30px;
  display: inline-grid;
  place-items: center;
  border-radius: 5px;
  cursor: pointer;
  color: #8f9aaa;
}

.icon-button:hover {
  background: #222933;
  color: #e7edf6;
}

.icon-button.active {
  background: #243c59;
  color: #63a8ff;
  border-color: #2e557d;
}

.avatar {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background: #33404f;
  display: grid;
  place-items: center;
  font-size: 10px;
  margin-left: 7px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-bottom: 1px solid #252c35;
  background: #151a21;
}

.light .toolbar {
  background: #fff;
  border-color: #dfe4ea;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-spacer {
  flex: 1;
}

.separator {
  width: 1px;
  height: 25px;
  background: #2a313b;
  margin: 0 4px;
}

.toolbar-button {
  height: 34px;
  padding: 0 9px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 5px;
  color: #9ba6b5;
  font-size: 11px;
  cursor: pointer;
}

.toolbar-button:hover {
  background: #222933;
  color: #e5ebf4;
}

.toolbar-button.primary {
  background: #1d4974;
  border-color: #2a639c;
  color: #d9ecff;
}

.zoom-control {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7d8998;
  font-size: 11px;
}

.zoom-control input {
  width: 90px;
  accent-color: #4e94db;
}

.toolbar-end-icon {
  color: #5e6b7b;
}

.workspace {
  min-height: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 255px;
}

.workspace.no-sidebar {
  grid-template-columns: minmax(0, 1fr) 255px;
}

.workspace.no-inspector {
  grid-template-columns: 240px minmax(0, 1fr);
}

.workspace.no-sidebar.no-inspector {
  grid-template-columns: minmax(0, 1fr);
}

.sidebar,
.inspector {
  min-width: 0;
  background: #151a21;
  border-right: 1px solid #252c35;
  overflow: auto;
}

.inspector {
  border-right: 0;
  border-left: 1px solid #252c35;
}

.light .sidebar,
.light .inspector {
  background: #fff;
  border-color: #dfe4ea;
}

.panel-title {
  height: 43px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8591a1;
  font-size: 10px;
  letter-spacing: .12em;
  font-weight: 700;
}

.panel-title > div {
  display: flex;
  gap: 1px;
}

.panel-title .icon-button {
  width: 25px;
  height: 25px;
}

.panel-title.compact {
  height: 35px;
}

.project-path {
  margin: 0 10px 9px;
  padding: 7px 8px;
  border: 1px solid #252d38;
  border-radius: 5px;
  background: #11161c;
  font-size: 9px;
  color: #687485;
  display: flex;
  align-items: center;
  gap: 6px;
}

.light .project-path {
  background: #f5f7fa;
  border-color: #e1e6ec;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background: #718096;
}

.status-dot.success {
  background: #43c78b;
}

.status-dot.running {
  background: #e6b85c;
}

.status-dot.error {
  background: #e26868;
}

.tree {
  padding: 0 6px;
}

.tree-row {
  width: 100%;
  height: 31px;
  border: 0;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 7px;
  color: #8995a5;
  text-align: left;
  font-size: 11px;
  cursor: pointer;
}

.tree-row:hover {
  background: #202731;
  color: #dce4ee;
}

.light .tree-row:hover {
  background: #eef2f6;
  color: #243244;
}

.tree-row.depth-1 {
  padding-left: 23px;
}

.tree-row.depth-2 {
  padding-left: 42px;
}

.tree-indent {
  width: 14px;
  flex-shrink: 0;
}

.side-section {
  margin-top: 18px;
  border-top: 1px solid #252c35;
  padding-top: 6px;
}

.tool-link {
  width: 100%;
  border: 0;
  background: transparent;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  color: #808c9d;
  font-size: 10px;
  text-align: left;
  cursor: pointer;
}

.tool-link:hover {
  color: #dbe4ef;
  background: #202731;
}

.main {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 38px minmax(0, 1fr) 110px;
  background: #10151b;
}

.light .main {
  background: #f4f6f9;
}

.tabs {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #252c35;
  background: #171c23;
}

.light .tabs {
  background: #fff;
  border-color: #dfe4ea;
}

.tabs-left {
  display: flex;
  min-width: 0;
}

.tab {
  border: 0;
  border-right: 1px solid #252c35;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #788494;
  padding: 0 14px;
  min-width: 125px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 13px;
  cursor: pointer;
}

.tab:hover {
  color: #cbd4df;
}

.tab.active {
  color: #e1e8f1;
  background: #10151b;
  border-bottom-color: #438fd7;
}

.light .tab {
  border-color: #dfe4ea;
}

.light .tab.active {
  background: #f4f6f9;
  color: #263241;
}

.tab-close {
  font-size: 15px;
  color: #596575;
}

.editor {
  min-height: 0;
  display: grid;
  grid-template-rows: 39px minmax(0, 1fr);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 7px;
  border-bottom: 1px solid #252c35;
  background: #141920;
}

.light .editor-toolbar {
  background: #fff;
  border-color: #dfe4ea;
}

.tool-cluster {
  display: flex;
  align-items: center;
  gap: 2px;
}

.select-button {
  height: 29px;
  border: 1px solid #303944;
  border-radius: 4px;
  background: #1a2028;
  color: #aeb8c6;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  font-size: 10px;
  cursor: pointer;
}

.light .select-button {
  background: #f8fafc;
  border-color: #d9dfe7;
  color: #4d5b6b;
}

.editor-search {
  margin-left: auto;
  width: 210px;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #303944;
  background: #10151b;
  border-radius: 4px;
  padding: 0 8px;
  color: #647184;
}

.editor-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #cfd7e2;
  font-size: 10px;
}

.light .editor-search {
  background: #f8fafc;
  border-color: #d9dfe7;
}

.light .editor-search input {
  color: #263241;
}

.alignment-shell {
  min-height: 0;
  min-width: 0;
  position: relative;
  display: grid;
  grid-template-columns: 145px minmax(0, 1fr);
  overflow: hidden;
  background: #0d1217;
}

.light .alignment-shell {
  background: #fff;
}

.alignment-corner {
  position: relative;
  z-index: 4;
  border-right: 1px solid #2a313b;
  border-bottom: 1px solid #2a313b;
  background: #171d24;
  padding: 12px;
}

.light .alignment-corner {
  background: #f4f7fa;
  border-color: #dfe4ea;
}

.corner-title {
  font-size: 10px;
  color: #a8b2c0;
  font-weight: 700;
}

.corner-subtitle {
  margin-top: 3px;
  color: #626f80;
  font-size: 9px;
}

.alignment-scroll {
  overflow: auto;
  min-width: 0;
  min-height: 0;
  position: relative;
}

.ruler {
  height: 31px;
  position: sticky;
  top: 0;
  z-index: 3;
  background: #171d24;
  border-bottom: 1px solid #2a313b;
}

.light .ruler {
  background: #f4f7fa;
  border-color: #dfe4ea;
}

.ruler-label {
  position: absolute;
  top: 0;
  height: 31px;
  border: 0;
  border-left: 1px solid #2c3540;
  background: transparent;
  color: #647082;
  font-size: 8px;
  padding: 0 3px;
  cursor: pointer;
}

.ruler-label:hover {
  color: #aab7c7;
  background: #202833;
}

.sequence-row {
  height: 31px;
  display: flex;
  min-width: max-content;
}

.row-label,
.row-label-spacer {
  position: sticky;
  left: 0;
  z-index: 2;
  width: 145px;
  height: 31px;
  flex: 0 0 145px;
}

.row-label {
  border: 0;
  border-right: 1px solid #2a313b;
  border-bottom: 1px solid #242b34;
  background: #13191f;
  color: #8995a5;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  text-align: left;
  cursor: pointer;
}

.light .row-label {
  background: #f8fafc;
  border-color: #e2e7ed;
  color: #526173;
}

.row-label.selected {
  background: #1c3856;
  color: #dceeff;
}

.light .row-label.selected {
  background: #dcecff;
  color: #244a73;
}

.row-number {
  width: 16px;
  color: #566273;
  font-size: 8px;
}

.row-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
}

.row-label-spacer {
  border-right: 1px solid #2a313b;
  background: #13191f;
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.light .row-label-spacer {
  background: #f8fafc;
  border-color: #e2e7ed;
}

.consensus-label {
  font: 700 9px ui-monospace, monospace;
  color: #8fa2b7;
}

.bases {
  display: flex;
  height: 31px;
}

.base {
  height: 31px;
  flex: 0 0 auto;
  border: 0;
  background: #10151b;
  color: #b8c4d3;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
  text-align: center;
}

.light .base {
  background: #fff;
  color: #354252;
}

.base.grid {
  border-right: 1px solid #1c232b;
  border-bottom: 1px solid #1c232b;
}

.light .base.grid {
  border-color: #eef1f4;
}

.base:hover {
  background: #24303d;
}

.base.selected {
  background: #234a70;
  color: #fff;
}

.light .base.selected {
  background: #cfe5fb;
  color: #143958;
}

.base-A {
  color: #68b5ff;
}

.base-T {
  color: #ef9b9b;
}

.base-G {
  color: #78d7a7;
}

.base-C {
  color: #e5c276;
}

.base-U {
  color: #ef9b9b;
}

.base-N {
  color: #a6aeba;
}

.base-gap {
  color: #566273;
}

.consensus-row .base {
  font-weight: 800;
  color: #d9e2ee;
  background: #17202a;
}

.consensus-row .base-A {
  color: #78c0ff;
}

.consensus-row .base-T {
  color: #f3a4a4;
}

.consensus-row .base-G {
  color: #8ce0b5;
}

.consensus-row .base-C {
  color: #efd084;
}

.bottom-panel {
  border-top: 1px solid #252c35;
  background: #141920;
}

.light .bottom-panel {
  background: #fff;
  border-color: #dfe4ea;
}

.bottom-tabs {
  height: 34px;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #252c35;
}

.light .bottom-tabs {
  border-color: #dfe4ea;
}

.bottom-tabs button {
  min-width: 65px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #687486;
  font-size: 9px;
  cursor: pointer;
}

.bottom-tabs button.active {
  color: #b9c5d3;
  border-bottom-color: #428bd4;
}

.task-row {
  height: 55px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
}

.task-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #1c4b36;
  color: #61d49b;
  font-size: 12px;
}

.task-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 145px;
}

.task-text strong {
  font-size: 9px;
  color: #aeb9c8;
}

.task-text span {
  font-size: 8px;
  color: #687587;
}

.task-progress {
  flex: 1;
  height: 4px;
  background: #252d37;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  width: 100%;
  height: 100%;
  background: #3f9a72;
}

.task-state {
  color: #59bd8c;
  font-size: 8px;
}

.inspector {
  padding-bottom: 10px;
}

.inspector-card {
  margin: 0 10px 9px;
  padding: 11px;
  border: 1px solid #282f39;
  border-radius: 5px;
  background: #11161c;
}

.light .inspector-card {
  background: #f8fafc;
  border-color: #e0e6ed;
}

.card-heading {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: #8c98a8;
  margin-bottom: 9px;
}

.property {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  font-size: 9px;
  border-bottom: 1px solid #222933;
}

.light .property {
  border-color: #e6ebf0;
}

.property:last-child {
  border-bottom: 0;
}

.property span {
  color: #687586;
}

.property b {
  color: #b8c3d1;
  font-weight: 600;
  text-align: right;
}

.light .property b {
  color: #3c4b5c;
}

.scheme {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.nucleotide {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font: 700 10px ui-monospace, monospace;
  background: #202832;
}

.nucleotide.A { color: #68b5ff; }
.nucleotide.T { color: #ef9b9b; }
.nucleotide.G { color: #78d7a7; }
.nucleotide.C { color: #e5c276; }
.nucleotide.gap { color: #667384; }

.inspector select,
.form select,
.form input {
  width: 100%;
  height: 31px;
  border: 1px solid #303944;
  background: #171d24;
  color: #aab5c4;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 10px;
  outline: none;
}

.light .inspector select,
.light .form select,
.light .form input {
  background: #fff;
  border-color: #d6dde5;
  color: #425163;
}

.action-button {
  width: 100%;
  height: 31px;
  border: 1px solid #2b3440;
  border-radius: 4px;
  background: #171d24;
  color: #8996a6;
  text-align: left;
  padding: 0 9px;
  font-size: 9px;
  margin-top: 5px;
  cursor: pointer;
}

.action-button:hover {
  background: #202933;
  color: #d5dee9;
}

.light .action-button {
  background: #fff;
  border-color: #dce2e9;
  color: #526173;
}

.statusbar {
  border-top: 1px solid #252c35;
  background: #0e1318;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 9px;
  color: #5e6b7b;
  font-size: 8px;
}

.light .statusbar {
  background: #fff;
  border-color: #dfe4ea;
}

.statusbar > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.statusbar .status-dot {
  width: 6px;
  height: 6px;
}

.statusbar .status-dot.ready {
  background: #718096;
}

.statusbar .status-dot.success {
  background: #43c78b;
}

.statusbar .status-dot.running {
  background: #e6b85c;
}

.statusbar .status-dot.error {
  background: #e26868;
}

.status-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(4, 8, 12, .72);
  backdrop-filter: blur(2px);
}

.dialog {
  width: 540px;
  border: 1px solid #303944;
  border-radius: 8px;
  background: #171d24;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .45);
  overflow: hidden;
}

.dialog.small {
  width: 430px;
}

.light .dialog {
  background: #fff;
  border-color: #d8dfe7;
  box-shadow: 0 24px 80px rgba(35, 50, 65, .2);
}

.dialog-header {
  min-height: 61px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #2a313b;
}

.light .dialog-header {
  border-color: #e2e7ed;
}

.dialog-header > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dialog-header strong {
  font-size: 13px;
}

.dialog-header span {
  font-size: 9px;
  color: #728093;
}

.dropzone {
  margin: 22px;
  min-height: 190px;
  border: 1px dashed #3a4654;
  border-radius: 7px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: #8290a1;
  cursor: pointer;
  text-align: center;
}

.dropzone:hover {
  border-color: #4d91d2;
  background: #172333;
}

.dropzone strong {
  color: #c4cfdb;
  font-size: 12px;
}

.dropzone span,
.dropzone small {
  font-size: 9px;
}

.form {
  padding: 18px;
  display: grid;
  gap: 15px;
}

.form label {
  display: grid;
  gap: 6px;
  color: #8996a7;
  font-size: 9px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 15px;
  border-top: 1px solid #2a313b;
}

.light .dialog-footer {
  border-color: #e2e7ed;
}

.primary-button,
.secondary-button {
  height: 32px;
  border-radius: 4px;
  padding: 0 13px;
  font-size: 10px;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #347ab8;
  background: #28669c;
  color: #fff;
}

.primary-button:hover {
  background: #3278b4;
}

.secondary-button {
  border: 1px solid #303944;
  background: transparent;
  color: #929eae;
}

.secondary-button:hover {
  background: #222a34;
}

@media (max-width: 1250px) {
  .workspace {
    grid-template-columns: 210px minmax(0, 1fr);
  }

  .inspector {
    display: none;
  }

  .workspace.no-sidebar,
  .workspace.no-inspector {
    grid-template-columns: minmax(0, 1fr);
  }

  .workspace.no-sidebar.no-inspector {
    grid-template-columns: minmax(0, 1fr);
  }

  .brand {
    width: 180px;
  }
}

@media (max-width: 1050px) {
  body {
    min-width: 900px;
  }

  .menu button:nth-child(n + 5) {
    display: none;
  }

  .toolbar-button span {
    display: none;
  }
}
'''
}

for rel, content in files.items():
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(textwrap.dedent(content).lstrip(), encoding="utf-8")

readme = """# LAG UGENE-style React + TypeScript UI

## Run

```bash
npm install
npm run dev