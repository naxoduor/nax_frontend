import { NodeDefinition } from "./types";

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: "FASTA_READER", label: "FASTA Reader", category: "Data",
    description: "Reads DNA, RNA or protein sequences from FASTA.",
    inputs: [], outputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE" }],
    defaults: { file: "sequences.fasta" }
  },
  {
    type: "FASTQ_READER", label: "FASTQ Reader", category: "Data",
    description: "Reads sequencing reads from FASTQ.",
    inputs: [], outputs: [{ id: "reads", name: "Reads", dataType: "FASTQ" }],
    defaults: { file: "reads.fastq" }
  },
  {
    type: "MSA_WRITER", label: "MSA Writer", category: "Data",
    description: "Writes a multiple sequence alignment to disk.",
    inputs: [{ id: "alignment", name: "Alignment", dataType: "MSA", required: true }],
    outputs: [],
    defaults: { file: "alignment.fasta", format: "FASTA" }
  },
  {
    type: "MAFFT", label: "MAFFT", category: "Alignment",
    description: "Multiple sequence alignment using MAFFT.",
    inputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true }],
    outputs: [{ id: "alignment", name: "Alignment", dataType: "MSA" }],
    defaults: { algorithm: "auto", threads: 4, gapOpening: 1.53 }
  },
  {
    type: "CLUSTALW", label: "ClustalW", category: "Alignment",
    description: "Progressive multiple sequence alignment with ClustalW.",
    inputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true }],
    outputs: [{ id: "alignment", name: "Alignment", dataType: "MSA" }],
    defaults: { threads: 2, outputFormat: "FASTA" }
  },
  {
    type: "CLUSTALO", label: "Clustal Omega", category: "Alignment",
    description: "Fast multiple sequence alignment with Clustal Omega.",
    inputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true }],
    outputs: [{ id: "alignment", name: "Alignment", dataType: "MSA" }],
    defaults: { iterations: 1, threads: 4 }
  },
  {
    type: "KALIGN", label: "Kalign", category: "Alignment",
    description: "Fast multiple sequence alignment.",
    inputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true }],
    outputs: [{ id: "alignment", name: "Alignment", dataType: "MSA" }],
    defaults: { threads: 4 }
  },
  {
    type: "BWA", label: "BWA-MEM", category: "NGS",
    description: "Maps sequencing reads against a reference genome.",
    inputs: [
      { id: "reference", name: "Reference", dataType: "DNA", required: true },
      { id: "reads", name: "Reads", dataType: "FASTQ", required: true }
    ],
    outputs: [{ id: "alignment", name: "BAM", dataType: "BAM" }],
    defaults: { threads: 8, preset: "mem" }
  },
  {
    type: "HMMER", label: "HMMER", category: "Analysis",
    description: "Searches sequences against HMM profiles.",
    inputs: [
      { id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true },
      { id: "hmm", name: "HMM Profile", dataType: "HMM", required: true }
    ],
    outputs: [{ id: "hits", name: "Hits", dataType: "GENERIC" }],
    defaults: { evalue: 0.001, threads: 4 }
  },
  {
    type: "KRAKEN2", label: "Kraken2", category: "Analysis",
    description: "Classifies sequencing reads using a taxonomic database.",
    inputs: [{ id: "reads", name: "Reads", dataType: "FASTQ", required: true }],
    outputs: [{ id: "taxonomy", name: "Taxonomy", dataType: "TAXONOMY" }],
    defaults: { database: "kraken-db", confidence: 0 }
  },
  {
    type: "FILTER", label: "Filter", category: "Utility",
    description: "Filters sequence records according to a rule.",
    inputs: [{ id: "input", name: "Input", dataType: "GENERIC", required: true }],
    outputs: [{ id: "output", name: "Output", dataType: "GENERIC" }],
    defaults: { expression: "length > 100" }
  },
  {
    type: "MERGE", label: "Merge", category: "Utility",
    description: "Combines multiple compatible streams.",
    inputs: [
      { id: "inputA", name: "Input A", dataType: "GENERIC", required: true },
      { id: "inputB", name: "Input B", dataType: "GENERIC", required: true }
    ],
    outputs: [{ id: "output", name: "Output", dataType: "GENERIC" }],
    defaults: {}
  }
];

export const getDefinition = (type: string) =>
  NODE_DEFINITIONS.find((d) => d.type === type);
