import { Link2, Play, Plus, Trash2 } from "lucide-react";
import type { ConnectionSchema, NodeSchema, WorkflowSchema } from "../../types/bioinformatics";

interface WorkflowEditorProps {
  workflow: WorkflowSchema;
  onChange: (workflow: WorkflowSchema) => void;
  onTransfer: () => void;
}

const nodeTypes = ["SequenceReader", "AlignmentWorker", "ParserWorker"];

export function WorkflowEditor({ workflow, onChange, onTransfer }: WorkflowEditorProps) {
  const updateNode = (nodeId: string, patch: Partial<NodeSchema>) => {
    const nextId = patch.id ?? nodeId;
    onChange({
      ...workflow,
      nodes: workflow.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
      connections: workflow.connections.map((connection) => ({
        ...connection,
        sourceNode: connection.sourceNode === nodeId ? nextId : connection.sourceNode,
        targetNode: connection.targetNode === nodeId ? nextId : connection.targetNode,
      })),
    });
  };

  const addNode = () => {
    const id = `step${workflow.nodes.length + 1}`;
    onChange({
      ...workflow,
      nodes: [...workflow.nodes, { id, type: "BioconductorWorker", inputs: [], outputs: [] }],
    });
  };

  const removeNode = (nodeId: string) => {
    onChange({
      nodes: workflow.nodes.filter((node) => node.id !== nodeId),
      connections: workflow.connections.filter(
        (connection) => connection.sourceNode !== nodeId && connection.targetNode !== nodeId,
      ),
    });
  };

  const addConnection = () => {
    if (workflow.nodes.length < 2) return;
    const source = workflow.nodes[0];
    const target = workflow.nodes[1];
    const connection: ConnectionSchema = {
      id: `connection-${workflow.connections.length + 1}`,
      sourceNode: source.id,
      sourcePort: source.outputs[0]?.id ?? "output",
      targetNode: target.id,
      targetPort: target.inputs[0]?.id ?? "input",
    };
    onChange({ ...workflow, connections: [...workflow.connections, connection] });
  };

  const updateConnection = (index: number, patch: Partial<ConnectionSchema>) => {
    onChange({
      ...workflow,
      connections: workflow.connections.map((connection, itemIndex) =>
        itemIndex === index ? { ...connection, ...patch } : connection,
      ),
    });
  };

  return (
    <section className="workflow-editor" aria-label="Workflow editor">
      <div className="workflow-editor-header">
        <div>
          <div className="eyebrow">PIPELINE DESIGNER</div>
          <h1>Build a workflow</h1>
          <p>Compose sequence tools into a reproducible analysis pipeline.</p>
        </div>
        <div className="workflow-actions">
          <button className="workflow-button" onClick={addNode}><Plus size={15} /> Add step</button>
          <button className="workflow-button" onClick={addConnection}><Link2 size={15} /> Connect</button>
          <button className="workflow-button primary" onClick={onTransfer}><Play size={15} /> Transfer workflow</button>
        </div>
      </div>

      <div className="workflow-canvas">
        <div className="workflow-canvas-label">WORKFLOW CANVAS <span>{workflow.nodes.length} steps · {workflow.connections.length} links</span></div>
        <div className="workflow-node-grid">
          {workflow.nodes.map((node, index) => (
            <div className="workflow-node" key={node.id}>
              <div className="workflow-node-index">0{index + 1}</div>
              <div className="workflow-node-heading">
                <input value={node.id} aria-label={`Step ${index + 1} id`} onChange={(event) => updateNode(node.id, { id: event.target.value })} />
                <button className="icon-button" title="Remove step" onClick={() => removeNode(node.id)}><Trash2 size={14} /></button>
              </div>
              <select value={node.type} onChange={(event) => updateNode(node.id, { type: event.target.value })}>
                {nodeTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <div className="workflow-ports">
                <span>IN <strong>{node.inputs.length}</strong></span>
                <span>OUT <strong>{node.outputs.length}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="workflow-connections">
        <div className="workflow-section-heading"><span>Connections</span><span>Source → target</span></div>
        {workflow.connections.length === 0 && <div className="workflow-empty">Add two steps, then connect their ports.</div>}
        {workflow.connections.map((connection, index) => (
          <div className="workflow-connection" key={connection.id ?? index}>
            <select value={connection.sourceNode} onChange={(event) => updateConnection(index, { sourceNode: event.target.value })}>
              {workflow.nodes.map((node) => <option key={node.id}>{node.id}</option>)}
            </select>
            <span>→</span>
            <select value={connection.targetNode} onChange={(event) => updateConnection(index, { targetNode: event.target.value })}>
              {workflow.nodes.map((node) => <option key={node.id}>{node.id}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
