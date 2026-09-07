import type {
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
};
