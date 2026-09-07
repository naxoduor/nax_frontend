 import { useState } from "react";
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
}
