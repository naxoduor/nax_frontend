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


