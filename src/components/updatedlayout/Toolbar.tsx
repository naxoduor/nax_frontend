import { Play, Save, FolderOpen, Upload, Download, Trash2, Undo2, Redo2, CheckCircle2 } from "lucide-react";

type Props = {
  onRun: () => void;
  onValidate: () => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onDelete: () => void;
};

export default function Toolbar({ onRun, onValidate, onSave, onLoad, onExport, onDelete }: Props) {
  return (
    <div className="toolbar">
      <button className="toolbar-btn primary" onClick={onRun}><Play size={15} /> Run</button>
      <button className="toolbar-btn" onClick={onValidate}><CheckCircle2 size={15} /> Validate</button>
      <span className="toolbar-separator" />
      <button className="toolbar-btn" onClick={onSave}><Save size={15} /> Save</button>
      <label className="toolbar-btn">
        <FolderOpen size={15} /> Open
        <input hidden type="file" accept=".json" onChange={onLoad} />
      </label>
      <button className="toolbar-btn" onClick={onExport}><Download size={15} /> Export JSON</button>
      <span className="toolbar-separator" />
      <button className="toolbar-btn" title="Undo"><Undo2 size={15} /></button>
      <button className="toolbar-btn" title="Redo"><Redo2 size={15} /></button>
      <button className="toolbar-btn danger" title="Delete selected" onClick={onDelete}><Trash2 size={15} /></button>
    </div>
  );
}
