import { useEffect, useState } from "react";
import { WorkflowNodeData } from "../../types";

type Props = {
  data: WorkflowNodeData | null;
  onChange: (parameters: Record<string, string | number | boolean>) => void;
};

export default function PropertiesPanel({ data, onChange }: Props) {
  const [params, setParams] = useState(data?.parameters ?? {});

  useEffect(() => setParams(data?.parameters ?? {}), [data?.nodeType]);

  if (!data) {
    return (
      <aside className="properties panel">
        <div className="panel-heading">PROPERTIES</div>
        <div className="empty-properties">Select a node to configure it.</div>
      </aside>
    );
  }

  const update = (key: string, value: string | number | boolean) => {
    const next = { ...params, [key]: value };
    setParams(next);
    onChange(next);
  };

  return (
    <aside className="properties panel">
      <div className="panel-heading">PROPERTIES</div>
      <div className="property-header">
        <div className="property-type">{data.category}</div>
        <h2>{data.label}</h2>
        <p>{data.description}</p>
      </div>

      <div className="property-section">
        <h3>Parameters</h3>
        {Object.keys(params).length === 0 && <div className="muted">No parameters.</div>}
        {Object.entries(params).map(([key, value]) => (
          <label className="field" key={key}>
            <span>{key.replace(/[A-Z]/g, (m) => ` ${m}`).replace(/^./, (m) => m.toUpperCase())}</span>
            {typeof value === "boolean" ? (
              <input type="checkbox" checked={value} onChange={(e) => update(key, e.target.checked)} />
            ) : typeof value === "number" ? (
              <input type="number" value={value} onChange={(e) => update(key, Number(e.target.value))} />
            ) : (
              <input value={String(value)} onChange={(e) => update(key, e.target.value)} />
            )}
          </label>
        ))}
      </div>

      <div className="property-section">
        <h3>Inputs</h3>
        {data.inputs.map((p) => (
          <div className="io-row" key={p.id}>
            <span className="io-dot input-dot" />
            <span>{p.name}</span>
            <code>{p.dataType}</code>
          </div>
        ))}
      </div>

      <div className="property-section">
        <h3>Outputs</h3>
        {data.outputs.map((p) => (
          <div className="io-row" key={p.id}>
            <span className="io-dot output-dot" />
            <span>{p.name}</span>
            <code>{p.dataType}</code>
          </div>
        ))}
      </div>
    </aside>
  );
}
