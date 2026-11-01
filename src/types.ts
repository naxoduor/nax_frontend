export type DataType =
  | "SEQUENCE"
  | "DNA"
  | "RNA"
  | "PROTEIN"
  | "FASTQ"
  | "MSA"
  | "BAM"
  | "VCF"
  | "HMM"
  | "TAXONOMY"
  | "GENERIC";

export type PortSpec = {
  id: string;
  name: string;
  dataType: DataType;
  required?: boolean;
  multiple?: boolean;
};


export type NodeDefinition = {
  type: string;
  label: string;
  category: string;
  description: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  defaults: Record<string, string | number | boolean>;
};


export type WorkflowNodeData = {
  nodeType: string;
  label: string;
  category: string;
  description: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  parameters: Record<string, string | number | boolean>;
  status?: "idle" | "queued" | "running" | "success" | "error";
};

export type WorkflowFile = {
  name: string;
  version: number;
  nodes: unknown[];
  edges: unknown[];
};
