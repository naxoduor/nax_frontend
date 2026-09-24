export interface Sequence {
  id: string;
  description: string;
  sequence: string;
  type: SequenceType;
}

export type SequenceType = "DNA" | "RNA" | "PROTEIN";

export type ProjectNodeType = "folder" | "sequence" | "alignment" | "bam"





 | "vcf";

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

export interface UgeneSchemaTransferRequest {
  schemaVersion: "1.0";
  operation: "ALIGNMENT";
  sequences: Sequence[];
  options: AlignmentOptions;
}

export interface UgeneSchemaTransferResponse {
  status: "completed" | "accepted";
  taskId?: string;
  sequences?: Sequence[];
  message?: string;
}

export interface PortSchema {
  id: string;
  name?: string;
  type: string;
}

export interface NodeSchema {
  id: string;
  type: string;
  inputs: PortSchema[];
  outputs: PortSchema[];
}

export interface ConnectionSchema {
  id?: string;
  sourceNode: string;
  sourcePort: string;
  targetNode: string;
  targetPort: string;
}

export interface WorkflowSchema {
  nodes: NodeSchema[];
  connections: ConnectionSchema[];
}

export interface WorkflowTransferResponse {
  status: "completed" | "accepted";
  taskId?: string;
  message?: string;
}

export const workflow: WorkflowSchema = {
  nodes: [
    {
      id: "reader",
      type: "SequenceReader",
      inputs: [],
      outputs: [{ id: "sequence", type: "Sequence" }],
    },
    {
      id: "mafft",
      type: "MAFFTWorker",
      inputs: [{ id: "sequence", type: "Sequence" }],
      outputs: [{ id: "result", type: "AnalysisResult" }],
    },
    {
      id: "clustalo",
      type: "ClustalOWorker",
      inputs: [{ id: "sequence", type: "Sequence" }],
      outputs: [{ id: "result", type: "AnalysisResult" }],
    },
    {
      id: "clustalw",
      type: "ClustalWWorker",
      inputs: [{ id: "sequence", type: "Sequence" }],
      outputs: [{ id: "result", type: "AnalysisResult" }],
    },
    // {
    //   id: "kalign",
    //   type: "KalignWorker",
    //   inputs: [{ id: "sequence", type: "Sequence" }],
    //   outputs: [{ id: "result", type: "AnalysisResult" }],
    // },

    // {
    //   id: "filewriter",
    //   type: "FileWriterWorker",
    //   inputs: [{ id: "sequence", type: "Sequence" }],
    //   outputs: [{ id: "result", type: "AnalysisResult" }],
    // },
  ],
  connections: [
    // {
    //   sourceNode: "reader",
    //   sourcePort: "sequence",
    //   targetNode: "analysis",
    //   targetPort: "sequence",
    // },
  ],
};

export interface AppStatus {
  message: string;
  kind: "ready" | "running" | "success" | "error";
}


