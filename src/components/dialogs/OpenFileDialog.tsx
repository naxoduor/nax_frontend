 import { Upload, X } from "lucide-react";
import { useRef } from "react";
interface OpenFileDialogProps {
  onClose: () => void;
  onFile: (file: File) => void;
}

export function OpenFileDialog({ onClose, onFile }: OpenFileDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <strong>Open Sequence File</strong>
            <span>Import FASTA, FASTQ, or alignment files</span>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div
          className="dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) onFile(file);
          }}
        >
          <Upload size={28} />
          <strong>Drop a sequence file here</strong>
          <span>or click to browse your computer</span>
          <small>Supported: .fa .fasta .fas .fna .fastq .fq .aln</small>
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".fa,.fasta,.fas,.fna,.fastq,.fq,.aln,.txt"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
          }}
        />

        <div className="dialog-footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
        </div>
      </div>
    </div>
  );
}
