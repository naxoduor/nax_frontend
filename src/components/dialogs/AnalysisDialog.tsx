import { X } from "lucide-react";
import type { AnalysisOptions } from "../../types/bioinformatics";
import { useState } from "react";

interface AnalysisDialogProps {
  selectedCount: number;
  onClose: () => void;
  onRun: (options: AnalysisOptions) => void;
}

export function AnalysisDialog({
  selectedCount,
  onClose,
  onRun,
}: AnalysisDialogProps) {
  const [analysis, setAnalysis] =
    useState<AnalysisOptions["analysis"]>("Consensus");

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="dialog small" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <strong>Sequence Analysis</strong>
            <span>{selectedCount} selected sequence(s)</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="form">
          <label>
            Analysis
            <select
              value={analysis}
              onChange={(event) =>
                setAnalysis(event.target.value as AnalysisOptions["analysis"])
              }
            >
              <option>Consensus</option>
              <option>Conservation</option>
              <option>Translation</option>
              <option>GC Content</option>
            </select>
          </label>
        </div>

        <div className="dialog-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => onRun({ analysis })}
          >
            Run analysis
          </button>
        </div>
      </div>
    </div>
  );
}
