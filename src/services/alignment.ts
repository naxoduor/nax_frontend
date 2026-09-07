import type { AlignmentOptions, Sequence } from "../types/bioinformatics";
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
}
