import { useEffect, useState } from "react";

type Sequence = {
  id: string;
  name: string;
  residues: string;
};

type MsaEvent =
  | { type: "started"; file: string }
  | { type: "sequence"; id: string; name: string; residues: string }
  | {
      type: "complete";
      sequenceCount: number;
      alignmentLength: number;
    }
  | { type: "error"; message: string };

type Props = {
  file: string;
};

export default function MsaViewer({ file }: Props) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [status, setStatus] = useState("Connecting…");
  const [alignmentLength, setAlignmentLength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function streamAlignment() {
      setSequences([]);
      setSequences([
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
      ]);
      setAlignmentLength(0);
      setError(null);
      setStatus("Loading alignment…");

      try {
        const params = new URLSearchParams({ file });
        const response = await fetch(
          `http://localhost:8080/api/msa/stream?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Streaming response is not supported");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            const event = JSON.parse(line) as MsaEvent;
            handleEvent(event);
          }
        }

        // Process a final unterminated line, if present.
        buffer += decoder.decode();
        if (buffer.trim()) {
          handleEvent(JSON.parse(buffer) as MsaEvent);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Streaming failed"
          );
          setStatus("Failed");
        }
      }
    }

    function handleEvent(event: MsaEvent) {
      switch (event.type) {
        case "started":
          setStatus(`Reading ${event.file}`);
          break;

        case "sequence":
          setSequences((current) => [...current, event]);
          break;

        case "complete":
          setAlignmentLength(event.alignmentLength);
          setStatus(
            `Complete: ${event.sequenceCount} sequences`
          );
          break;

        case "error":
          setError(event.message);
          setStatus("Failed");
          break;
      }
    }

    streamAlignment();

    return () => controller.abort();
  }, [file]);

  return (
    <section>
      <h2>Multiple Sequence Alignment</h2>
      <p>{status}</p>
      {error && <p role="alert">{error}</p>}
      <p>
        Loaded: {sequences.length} sequences
        {alignmentLength > 0 && ` · ${alignmentLength} columns`}
      </p>

      <div style={{ overflow: "auto", maxHeight: 600 }}>
        {sequences.map((sequence) => (
          <div
            key={sequence.id}
            style={{
              display: "flex",
              fontFamily: "monospace",
              whiteSpace: "pre",
              minHeight: 24,
            }}
          >
            <strong
              style={{
                position: "sticky",
                left: 0,
                width: 180,
                minWidth: 180,
                overflow: "hidden",
                background: "white",
              }}
            >
              {sequence.name}
            </strong>
            <span>{sequence.residues}</span>
          </div>
        ))}
      </div>
    </section>
  );
}