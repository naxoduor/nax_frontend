    import { useEffect, useMemo, useState } from "react";
import "./MsaViewer.css";

type AlignedSequence = {
  id: string;
  name: string;
  residues: string;
};

type MsaResponse = {
  alignmentName: string;
  sequenceCount: number;
  alignmentLength: number;
  sequences: AlignedSequence[];
};

type Props = {
  file: string;
};

const residueColors: Record<string, string> = {
  A: "#80c995",
  T: "#ef8b8b",
  U: "#ef8b8b",
  G: "#e6c45a",
  C: "#78a9e8",
  "-": "#e5e7eb",
  N: "#d1d5db",
};

export default function MsaViewerTwo({ file }: Props) {
  const [alignment, setAlignment] = useState<MsaResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlignment() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ file });
        setAlignment
         ({
  alignmentName: "aaa",
  sequenceCount: 5,
  alignmentLength: 5,
  sequences: [
        {
          id: "seq1",
          name: "Homo sapiens BRCA1",
          residues:
            "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
        },
        {
          id: "seq2",
          name: "Mus musculus BRCA1",
          residues:
            "ATGCGTACGATCGG-TAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGG-TAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
        },
        {
          id: "seq3",
          name: "Danio rerio BRCA1",
          residues:
            "ATGCGT-CGATCGGCTAGCTAG-TAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAG-TAGGCTAACCGGTACGATCGATCGATCGGCTA",
        },
        {
          id: "seq4",
          name: "Gallus gallus BRCA1",
          residues:
            "ATGCGTACGATCGGCTAG-TAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
        },
        {
          id: "seq5",
          name: "Xenopus tropicalis BRCA1",
          residues:
            "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGAT-GATCGGATCGAATCGGCTAGCTAGGCTAACGGTACGATCGATCGATCGGCTA",
        },
        {
          id: "seq6",
          name: "Danio rerio homolog",
          residues:
            "ATGCGTACGATCGGCTAGCTAGCTAGGCTAACCGGTACGATCGATCGGATCGAATCGGCTAGCTAGGCTAACCGGTACGATCGATCGATCGGCTA",
        },
      ]
});


        const response = await fetch(
          `http://localhost:8080/api/msa?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Could not load alignment (${response.status})`);
        }

        // const data: MsaResponse = await response.json();
        
        // setAlignment(data);

        setSelectedIds([]);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Failed to load alignment"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAlignment();
    console.log("Print aligggggnment")
    console.log(alignment)
    return () => controller.abort();
  }, [file]);

  const selectedSequences = useMemo(
    () =>
      alignment?.sequences.filter((sequence) =>
        selectedIds.includes(sequence.id)
      ) ?? [],
    [alignment, selectedIds]
  );

  function toggleSequence(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  }

  if (loading) return <div className="msa-message">Loading alignment…</div>;
  // if (error) return <div className="msa-error">{error}</div>;
  if (!alignment) return null;

  const positions = Array.from(
    { length: alignment.alignmentLength },
    (_, index) => index + 1
  );

  return (
    <section className="msa-viewer">
      <header className="msa-toolbar">
        <div>
          <h2>{alignment.alignmentName}</h2>
          <span>
            {alignment.sequenceCount} sequences ·{" "}
            {alignment.alignmentLength} columns
          </span>
        </div>

        <div className="msa-selection">
          {selectedIds.length} selected
          <button onClick={() => setSelectedIds([])}>
            Clear selection
          </button>
        </div>
      </header>

      <div className="msa-scroll">
        <div className="msa-grid">
          <div className="msa-header msa-name-header">Sequence</div>

          <div className="msa-header msa-ruler">
            {positions.map((position) => (
              <span className="msa-position" key={position}>
                {position % 10 === 0 ? position : ""}
              </span>
            ))}
          </div>

          {alignment.sequences.map((sequence) => (
            <div className="msa-row" key={sequence.id}>
              <button
                className={`msa-name ${
                  selectedIds.includes(sequence.id) ? "selected" : ""
                }`}
                onClick={() => toggleSequence(sequence.id)}
                title={sequence.name}
              >
                {sequence.name}
              </button>

              <div className="msa-residues">
                {Array.from(sequence.residues).map((residue, index) => (
                  <span
                    key={`${sequence.id}-${index}`}
                    className="msa-cell"
                    style={{
                      backgroundColor:
                        residueColors[residue] ?? "#f3f4f6",
                    }}
                    title={`${sequence.name}, position ${index + 1}: ${residue}`}
                  >
                    {residue}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="msa-footer">
        <span>
          Selected sequences:{" "}
          {selectedSequences.map((sequence) => sequence.name).join(", ") ||
            "None"}
        </span>
      </footer>
    </section>
  );
}