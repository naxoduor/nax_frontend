// import { useMemo, useRef, useState } from "react";
// import {
//   AlignCenter,
//   AlignHorizontalSpaceAround,
//   ArrowDownToLine,
//   ArrowLeft,
//   ArrowRight,
//   BarChart3,
//   Check,
//   ChevronDown,
//   ChevronRight,
//   Clipboard,
//   Copy,
//   FilePlus2,
//   FolderOpen,
//   GitBranch,
//   Grid2X2,
//   HelpCircle,
//   Highlighter,
//   Layers3,
//   Maximize2,
//   Menu,
//   Minus,
//   MoreHorizontal,
//   PanelLeft,
//   Play,
//   Plus,
//   RotateCcw,
//   RotateCw,
//   Search,
//   Settings,
//   SlidersHorizontal,
//   Sparkles,
//   Split,
//   Sun,
//   Terminal,
//   Trash2,
//   Upload,
//   ZoomIn,
//   ZoomOut
// } from "lucide-react";

// type Sequence = {
//   id: string;
//   description: string;
//   sequence: string;
// };

// type ProjectNode = {
//   id: string;
//   label: string;
//   type: "folder" | "file" | "alignment";
//   children?: ProjectNode[];
// };

// const initialSequences: Sequence[] = [
//   {
//     id: "seq1",
//     description: "Homo sapiens BRCA1",
//     sequence: "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
//   {
//     id: "seq2",
//     description: "Mus musculus BRCA1",
//     sequence: "ATGCGTACGATCGG-TAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGG-TAGCTAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
//   {
//     id: "seq3",
//     description: "Danio rerio BRCA1",
//     sequence: "ATGCGT-CGATCGGCTAGCTAG-TAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAG-TAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
//   {
//     id: "seq4",
//     description: "Gallus gallus BRCA1",
//     sequence: "ATGCGTACGATCGGCTAG-TAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
//   {
//     id: "seq5",
//     description: "Xenopus tropicalis BRCA1",
//     sequence: "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGAT-GATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
//   {
//     id: "seq6",
//     description: "Danio rerio homolog",
//     sequence: "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA"
//   },
// ];

// const projectTree: ProjectNode[] = [
//   {
//     id: "project",
//     label: "LAG Project",
//     type: "folder",
//     children: [
//       { id: "sequences", label: "Sequences", type: "folder", children: [
//         { id: "brca", label: "BRCA1.fasta", type: "file" },
//         { id: "tp53", label: "TP53.fasta", type: "file" },
//       ]},
//       { id: "alignments", label: "Alignments", type: "folder", children: [
//         { id: "msa", label: "BRCA1_MSA.aln", type: "alignment" },
//       ]},
//       { id: "bam", label: "BAM / VCF", type: "folder" },
//       { id: "results", label: "Analysis Results", type: "folder" },
//     ],
//   },
// ];

// function IconButton({
//   children,
//   title,
//   onClick,
//   active = false,
// }: {
//   children: React.ReactNode;
//   title: string;
//   onClick?: () => void;
//   active?: boolean;
// }) {
//   return (
//     <button className={`icon-button ${active ? "active" : ""}`} title={title} onClick={onClick}>
//       {children}
//     </button>
//   );
// }

// function App() {
//   const [dark, setDark] = useState(true);
//   const [sidebar, setSidebar] = useState(true);
//   const [rightPanel, setRightPanel] = useState(true);
//   const [zoom, setZoom] = useState(100);
//   const [activeTab, setActiveTab] = useState("BRCA1_MSA.aln");
//   const [selectedRows, setSelectedRows] = useState<string[]>(["seq1"]);
//   const [selection, setSelection] = useState({ start: 12, end: 42 });
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("Ready");
//   const [consensus, setConsensus] = useState(true);
//   const [showGrid, setShowGrid] = useState(true);
//   const [expanded, setExpanded] = useState<Record<string, boolean>>({
//     project: true, sequences: true, alignments: true
//   });

//   const filteredSequences = useMemo(
//     () =>
//       initialSequences.filter(
//         s =>
//           !search ||
//           s.id.toLowerCase().includes(search.toLowerCase()) ||
//           s.description.toLowerCase().includes(search.toLowerCase())
//       ),
//     [search]
//   );

//   const setAction = (message: string) => {
//     setStatus(message);
//     window.setTimeout(() => setStatus("Ready"), 2200);
//   };

//   const toggleRow = (id: string) => {
//     setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   return (
//     <div className={dark ? "app dark" : "app light"}>
//       <header className="topbar">
//         <div className="brand">
//           <div className="brand-mark">L</div>
//           <div>
//             <div className="brand-title">LAG</div>
//             <div className="brand-subtitle">Bioinformatics Workbench</div>
//           </div>
//         </div>

//         <nav className="menu">
//           <button>File <ChevronDown size={12}/></button>
//           <button>Edit <ChevronDown size={12}/></button>
//           <button>View <ChevronDown size={12}/></button>
//           <button>Tools <ChevronDown size={12}/></button>
//           <button>Actions <ChevronDown size={12}/></button>
//           <button>Settings <ChevronDown size={12}/></button>
//           <button>Help</button>
//         </nav>

//         <div className="top-actions">
//           <IconButton title="Toggle sidebar" onClick={() => setSidebar(v => !v)}>
//             <PanelLeft size={17}/>
//           </IconButton>
//           <IconButton title="Toggle right panel" onClick={() => setRightPanel(v => !v)}>
//             <SlidersHorizontal size={17}/>
//           </IconButton>
//           <IconButton title="Toggle theme" onClick={() => setDark(v => !v)}>
//             <Sun size={17}/>
//           </IconButton>
//           <div className="avatar">NO</div>
//         </div>
//       </header>

//       <div className="toolbar">
//         <div className="toolbar-group">
//           <ToolbarButton icon={<FolderOpen size={16}/>} label="Open" onClick={() => setAction("Open file dialog")}/>
//           <ToolbarButton icon={<FilePlus2 size={16}/>} label="New" onClick={() => setAction("New document")}/>
//           <ToolbarButton icon={<Upload size={16}/>} label="Import" onClick={() => setAction("Import sequences")}/>
//         </div>
//         <div className="separator"/>
//         <div className="toolbar-group">
//           <ToolbarButton icon={<RotateCcw size={16}/>} label="Undo" onClick={() => setAction("Undo")}/>
//           <ToolbarButton icon={<RotateCw size={16}/>} label="Redo" onClick={() => setAction("Redo")}/>
//           <ToolbarButton icon={<Copy size={16}/>} label="Copy" onClick={() => setAction("Copied selection")}/>
//           <ToolbarButton icon={<Clipboard size={16}/>} label="Paste" onClick={() => setAction("Pasted sequence")}/>
//         </div>
//         <div className="separator"/>
//         <div className="toolbar-group">
//           <ToolbarButton icon={<Sparkles size={16}/>} label="Align" primary onClick={() => setAction("Alignment task started")}/>
//           <ToolbarButton icon={<GitBranch size={16}/>} label="Phylogeny" onClick={() => setAction("Phylogenetic analysis")}/>
//           <ToolbarButton icon={<BarChart3 size={16}/>} label="Analyze" onClick={() => setAction("Analysis tools opened")}/>
//         </div>
//         <div className="toolbar-spacer"/>
//         <div className="zoom-control">
//           <ZoomOut size={14}/>
//           <input
//             type="range"
//             min="50"
//             max="180"
//             value={zoom}
//             onChange={e => setZoom(Number(e.target.value))}
//           />
//           <ZoomIn size={14}/>
//           <span>{zoom}%</span>
//         </div>
//       </div>

//       <div className="workspace">
//         {sidebar && (
//           <aside className="sidebar">
//             <div className="panel-title">
//               <span>PROJECT</span>
//               <div>
//                 <IconButton title="New"><Plus size={15}/></IconButton>
//                 <IconButton title="More"><MoreHorizontal size={15}/></IconButton>
//               </div>
//             </div>
//             <div className="project-path">
//               <span className="status-dot"/>
//               /home/user/projects/lag
//             </div>
//             <ProjectTree
//               nodes={projectTree}
//               expanded={expanded}
//               setExpanded={setExpanded}
//               onSelect={node => setAction(`Selected ${node.label}`)}
//             />

//             <div className="side-section">
//               <div className="panel-title compact">
//                 <span>TOOLS</span>
//               </div>
//               <ToolLink icon={<Sparkles size={15}/>} text="Multiple Sequence Alignment"/>
//               <ToolLink icon={<GitBranch size={15}/>} text="Phylogenetic Tree"/>
//               <ToolLink icon={<Layers3 size={15}/>} text="Genome Browser"/>
//               <ToolLink icon={<Terminal size={15}/>} text="External Tools"/>
//             </div>
//           </aside>
//         )}

//         <main className="main">
//           <div className="tabs">
//             <div className="tabs-left">
//               <Tab label="BRCA1.fasta" />
//               <Tab label="BRCA1_MSA.aln" active={activeTab === "BRCA1_MSA.aln"} onClick={() => setActiveTab("BRCA1_MSA.aln")}/>
//               <Tab label="Results" />
//             </div>
//             <div className="tab-actions">
//               <IconButton title="Split view"><Split size={16}/></IconButton>
//               <IconButton title="Maximize"><Maximize2 size={16}/></IconButton>
//             </div>
//           </div>

//           <div className="editor">
//             <div className="editor-toolbar">
//               <div className="tool-cluster">
//                 <button className="select-button"><AlignHorizontalSpaceAround size={15}/> Alignment <ChevronDown size={12}/></button>
//                 <IconButton title="Consensus" active={consensus} onClick={() => setConsensus(v => !v)}><Check size={15}/></IconButton>
//                 <IconButton title="Grid" active={showGrid} onClick={() => setShowGrid(v => !v)}><Grid2X2 size={15}/></IconButton>
//                 <IconButton title="Highlight"><Highlighter size={15}/></IconButton>
//               </div>
//               <div className="editor-search">
//                 <Search size={14}/>
//                 <input
//                   value={search}
//                   onChange={e => setSearch(e.target.value)}
//                   placeholder="Find sequence..."
//                 />
//               </div>
//               <div className="tool-cluster">
//                 <IconButton title="Move left"><ArrowLeft size={15}/></IconButton>
//                 <IconButton title="Move right"><ArrowRight size={15}/></IconButton>
//                 <IconButton title="Delete"><Trash2 size={15}/></IconButton>
//               </div>
//             </div>

//             <AlignmentViewer
//               sequences={filteredSequences}
//               selectedRows={selectedRows}
//               toggleRow={toggleRow}
//               selection={selection}
//               setSelection={setSelection}
//               zoom={zoom}
//               consensus={consensus}
//               showGrid={showGrid}
//             />
//           </div>

//           <div className="bottom-panel">
//             <div className="bottom-tabs">
//               <button className="active">Tasks</button>
//               <button>Console</button>
//               <button>Log</button>
//             </div>
//             <div className="task-row">
//               <div className="task-icon"><Check size={13}/></div>
//               <div className="task-text">
//                 <strong>BRCA1_MSA.aln</strong>
//                 <span>Alignment completed successfully</span>
//               </div>
//               <div className="task-progress"><div className="progress-fill"/></div>
//               <span className="task-state">Completed</span>
//             </div>
//           </div>
//         </main>

//         {rightPanel && (
//           <aside className="inspector">
//             <div className="panel-title">
//               <span>INSPECTOR</span>
//               <IconButton title="Settings"><Settings size={15}/></IconButton>
//             </div>

//             <div className="inspector-card">
//               <div className="card-heading">Selection</div>
//               <div className="property"><span>Sequences</span><b>{selectedRows.length}</b></div>
//               <div className="property"><span>Start</span><b>{selection.start}</b></div>
//               <div className="property"><span>End</span><b>{selection.end}</b></div>
//               <div className="property"><span>Length</span><b>{selection.end - selection.start + 1}</b></div>
//             </div>

//             <div className="inspector-card">
//               <div className="card-heading">Alignment</div>
//               <div className="property"><span>Sequences</span><b>{filteredSequences.length}</b></div>
//               <div className="property"><span>Columns</span><b>{filteredSequences[0]?.sequence.length ?? 0}</b></div>
//               <div className="property"><span>Algorithm</span><b>Clustal Omega</b></div>
//               <div className="property"><span>Identity</span><b>87.4%</b></div>
//             </div>

//             <div className="inspector-card">
//               <div className="card-heading">Color scheme</div>
//               <div className="scheme">
//                 <span className="nucleotide A">A</span>
//                 <span className="nucleotide T">T</span>
//                 <span className="nucleotide G">G</span>
//                 <span className="nucleotide C">C</span>
//                 <span className="nucleotide gap">-</span>
//               </div>
//               <select defaultValue="nucleotide">
//                 <option value="nucleotide">Nucleotide</option>
//                 <option value="clustal">Clustal</option>
//                 <option value="hydrophobicity">Hydrophobicity</option>
//               </select>
//             </div>

//             <div className="inspector-card">
//               <div className="card-heading">Quick actions</div>
//               <button className="action-button" onClick={() => setAction("Reverse complement")}>Reverse complement</button>
//               <button className="action-button" onClick={() => setAction("Translation opened")}>Translate sequence</button>
//               <button className="action-button" onClick={() => setAction("Consensus exported")}>Export consensus</button>
//             </div>
//           </aside>
//         )}
//       </div>

//       <footer className="statusbar">
//         <div><span className="green-dot"/> {status}</div>
//         <div className="status-center">DNA · {filteredSequences.length} sequences · {filteredSequences[0]?.sequence.length ?? 0} columns</div>
//         <div>Ln 1 · Col {selection.start} · UTF-8</div>
//       </footer>
//     </div>
//   );
// }

// function ToolbarButton({
//   icon, label, onClick, primary = false
// }: {
//   icon: React.ReactNode; label: string; onClick?: () => void; primary?: boolean;
// }) {
//   return (
//     <button className={`toolbar-button ${primary ? "primary" : ""}`} onClick={onClick}>
//       {icon}<span>{label}</span>
//     </button>
//   );
// }

// function ToolLink({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return <button className="tool-link">{icon}<span>{text}</span></button>;
// }

// function Tab({ label, active = false, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
//   return <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>{label}<span className="tab-close">×</span></button>;
// }

// function ProjectTree({
//   nodes, expanded, setExpanded, depth = 0, onSelect
// }: {
//   nodes: ProjectNode[];
//   expanded: Record<string, boolean>;
//   setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
//   depth?: number;
//   onSelect: (node: ProjectNode) => void;
// }) {
//   return (
//     <div className="tree">
//       {nodes.map(node => {
//         const isExpanded = expanded[node.id];
//         const folder = node.type === "folder";
//         return (
//           <div key={node.id}>
//             <button
//               className={`tree-row depth-${depth}`}
//               onClick={() => {
//                 onSelect(node);
//                 if (folder) setExpanded(e => ({ ...e, [node.id]: !e[node.id] }));
//               }}
//             >
//               {folder ? (isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) : <span className="tree-indent"/>}
//               {node.type === "folder" ? <Layers3 size={15}/> : node.type === "alignment" ? <AlignCenter size={15}/> : <FilePlus2 size={15}/>}
//               <span>{node.label}</span>
//             </button>
//             {folder && isExpanded && node.children && (
//               <ProjectTree
//                 nodes={node.children}
//                 expanded={expanded}
//                 setExpanded={setExpanded}
//                 depth={depth + 1}
//                 onSelect={onSelect}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// function AlignmentViewer({
//   sequences,
//   selectedRows,
//   toggleRow,
//   selection,
//   setSelection,
//   zoom,
//   consensus,
//   showGrid
// }: {
//   sequences: Sequence[];
//   selectedRows: string[];
//   toggleRow: (id: string) => void;
//   selection: {start: number; end: number};
//   setSelection: React.Dispatch<React.SetStateAction<{start: number; end: number}>>;
//   zoom: number;
//   consensus: boolean;
//   showGrid: boolean;
// }) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const charWidth = Math.max(8, 10 * zoom / 100);
//   const rowHeight = 31;
//   const rulerStep = Math.max(5, Math.round(10 / (zoom / 100)));
//   const columns = sequences[0]?.sequence.length ?? 0;

//   const consensusString = useMemo(() => {
//     if (!sequences.length) return "";
//     return Array.from({ length: columns }, (_, i) => {
//       const counts: Record<string, number> = {};
//       sequences.forEach(s => {
//         const c = s.sequence[i] ?? "-";
//         counts[c] = (counts[c] ?? 0) + 1;
//       });
//       return Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
//     }).join("");
//   }, [sequences, columns]);

//   const handleColumnClick = (column: number, shift: boolean) => {
//     if (shift) {
//       setSelection(s => ({ start: Math.min(s.start, column), end: Math.max(s.end, column) }));
//     } else {
//       setSelection({ start: column, end: column });
//     }
//   };

//   return (
//     <div className="alignment-shell">
//       <div className="alignment-corner">
//         <div className="corner-title">Sequences</div>
//         <div className="corner-subtitle">{sequences.length} loaded</div>
//       </div>

//       <div className="alignment-scroll" ref={scrollRef}>
//         <div className="ruler" style={{ width: columns * charWidth }}>
//           {Array.from({length: columns}, (_, i) =>
//             i % rulerStep === 0 ? (
//               <button
//                 key={i}
//                 className="ruler-label"
//                 style={{ left: i * charWidth }}
//                 onClick={() => handleColumnClick(i + 1, false)}
//               >
//                 {i + 1}
//               </button>
//             ) : null
//           )}
//         </div>

//         {consensus && (
//           <div className="sequence-row consensus-row" style={{width: columns * charWidth}}>
//             <div className="row-label-spacer"/>
//             <div className="bases">
//               {consensusString.split("").map((c, i) =>
//                 <Base key={i} char={c} width={charWidth} selected={i + 1 >= selection.start && i + 1 <= selection.end} grid={showGrid}/>
//               )}
//             </div>
//           </div>
//         )}

//         {sequences.map((seq, rowIndex) => (
//           <div className="sequence-row" key={seq.id} style={{ width: columns * charWidth }}>
//             <button
//               className={`row-label ${selectedRows.includes(seq.id) ? "selected" : ""}`}
//               onClick={() => toggleRow(seq.id)}
//             >
//               <span className="row-number">{rowIndex + 1}</span>
//               <span className="row-id">{seq.id}</span>
//             </button>
//             <div className="bases">
//               {seq.sequence.split("").map((c, i) =>
//                 <Base
//                   key={i}
//                   char={c}
//                   width={charWidth}
//                   selected={i + 1 >= selection.start && i + 1 <= selection.end}
//                   grid={showGrid}
//                   onClick={() => handleColumnClick(i + 1, false)}
//                 />
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function Base({
//   char, width, selected, grid, onClick
// }: {
//   char: string; width: number; selected: boolean; grid: boolean; onClick?: () => void;
// }) {
//   return (
//     <button
//       className={`base base-${char.toUpperCase()} ${selected ? "selected" : ""} ${grid ? "grid" : ""}`}
//       style={{ width }}
//       onClick={onClick}
//     >
//       {char}
//     </button>
//   );
// }

// export default App;