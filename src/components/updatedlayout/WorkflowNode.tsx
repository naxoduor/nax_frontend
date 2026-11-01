import { Handle, Position, NodeProps } from "@xyflow/react";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { WorkflowNodeData } from "../../types";

const statusIcon = (status?: WorkflowNodeData["status"]) => {
  if (status === "running") return <LoaderCircle size={13} className="spin" />;
  if (status === "success") return <CheckCircle2 size={13} />;
  if (status === "error") return <CircleAlert size={13} />;
  return null;
};

export default function WorkflowNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;

  return (
    <div className={`bio-node ${selected ? "selected" : ""} status-${d.status ?? "idle"}`}>
      <div className="node-title">
        <span className="node-category">{d.category}</span>
        <span className="node-status">{statusIcon(d.status)}</span>
      </div>
      <div className="node-name">{d.label}</div>

      <div className="node-body">
        <div className="ports-column">
          {d.inputs.map((p) => (
            <div className="port-row input-row" key={p.id}>
              <Handle
                type="target"
                position={Position.Left}
                id={p.id}
                className="port input-port"
              />
              <span>{p.name}</span>
              {p.required && <b>*</b>}
            </div>
          ))}
        </div>

        <div className="ports-column outputs">
          {d.outputs.map((p) => (
            <div className="port-row output-row" key={p.id}>
              <span>{p.name}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={p.id}
                className="port output-port"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
