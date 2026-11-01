import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MenuBar from "../components/updatedlayout/MenuBar";
import Toolbar from "../components/updatedlayout/Toolbar";
import Palette from "../components/updatedlayout/Palette";
import PropertiesPanel from "../components/updatedlayout/PropertiesPanel";
import WorkflowNode from "../components/updatedlayout/WorkflowNode";
import { getDefinition, NODE_DEFINITIONS } from "../nodeDefinitions";
import { api } from "../services/api";
import { WorkflowSocket } from "../services/workflowSocket";
import type { WorkflowSchema } from "../types/bioinformatics";
import { DataType, WorkflowNodeData } from "../types";
import "./workflow.css";

const nodeTypes = { workflow: WorkflowNode };

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: "reader-1",
    type: "workflow",
    position: { x: 120, y: 170 },
    data: {
      nodeType: "FASTA_READER",
      label: "FASTA Reader",
      category: "Data",
      description: "Reads DNA, RNA or protein sequences from FASTA.",
      inputs: [],
      outputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE" }],
      parameters: { file: "sequences.fasta" },
      status: "idle"
    }
  },
  {
    id: "mafft-1",
    type: "workflow",
    position: { x: 460, y: 170 },
    data: {
      nodeType: "MAFFT",
      label: "MAFFT",
      category: "Alignment",
      description: "Multiple sequence alignment using MAFFT.",
      inputs: [{ id: "sequence", name: "Sequence", dataType: "SEQUENCE", required: true }],
      outputs: [{ id: "alignment", name: "Alignment", dataType: "MSA" }],
      parameters: { algorithm: "auto", threads: 4, gapOpening: 1.53 },
      status: "idle"
    }
  },
  {
    id: "writer-1",
    type: "workflow",
    position: { x: 800, y: 170 },
    data: {
      nodeType: "MSA_WRITER",
      label: "MSA Writer",
      category: "Data",
      description: "Writes a multiple sequence alignment to disk.",
      inputs: [{ id: "alignment", name: "Alignment", dataType: "MSA", required: true }],
      outputs: [],
      parameters: { file: "alignment.fasta", format: "FASTA" },
      status: "idle"
    }
  }
];

const initialEdges: Edge[] = [
  
  { id: "e-reader-mafft", source: "reader-1", sourceHandle: "sequence", target: "mafft-1", targetHandle: "sequence", animated: true },
  { id: "e-mafft-writer", source: "mafft-1", sourceHandle: "alignment", target: "writer-1", targetHandle: "alignment", animated: true }
];

function compatible(source: DataType, target: DataType) {
  return source === target || source === "GENERIC" || target === "GENERIC";
}

export function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("mafft-1");
  const [message, setMessage] = useState("Ready");
  const [workflowName, setWorkflowName] = useState("Multiple Sequence Alignment");
  const [running, setRunning] = useState(false);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const workflowSocket = useRef<WorkflowSocket | null>(null);

  const selectedData = useMemo(
    () => nodes.find((n) => n.id === selectedId)?.data ?? null,
    [nodes, selectedId]
  );

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return;

    const sourcePort = sourceNode.data.outputs.find((p) => p.id === connection.sourceHandle);
    const targetPort = targetNode.data.inputs.find((p) => p.id === connection.targetHandle);
    if (!sourcePort || !targetPort) return;

    if (!compatible(sourcePort.dataType, targetPort.dataType)) {
      setMessage(`Invalid connection: ${sourcePort.dataType} → ${targetPort.dataType}`);
      return;
    }

    setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    setMessage(`Connected ${sourcePort.name} → ${targetPort.name}`);
  }, [nodes, setEdges]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/ugene-node");
    const definition = getDefinition(type);
    if (!definition) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const id = `${type.toLowerCase()}-${Date.now()}`;

    setNodes((nds) => nds.concat({
      id,
      type: "workflow",
      position,
      data: {
        nodeType: definition.type,
        label: definition.label,
        category: definition.category,
        description: definition.description,
        inputs: definition.inputs,
        outputs: definition.outputs,
        parameters: { ...definition.defaults },
        status: "idle"
      }
    }));
    setSelectedId(id);
    setMessage(`${definition.label} added`);
  }, [screenToFlowPosition, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const updateParameters = (parameters: Record<string, string | number | boolean>) => {
    if (!selectedId) return;
    setNodes((nds) => nds.map((n) =>
      n.id === selectedId ? { ...n, data: { ...n.data, parameters } } : n
    ));
  };

  const validate = () => {
    const errors: string[] = [];
    nodes.forEach((node) => {
      node.data.inputs.filter((p) => p.required).forEach((port) => {
        const connected = edges.some((e) =>
          e.target === node.id && e.targetHandle === port.id
        );
        if (!connected) errors.push(`${node.data.label}: ${port.name} is not connected`);
      });
    });
    if (errors.length) {
      setMessage(`Validation failed: ${errors.join("; ")}`);
      return false;
    }
    setMessage("Workflow is valid ✓");
    return true;
  };

  const run = async () => {
    if (!validate()) return;

    workflowSocket.current?.disconnect();
    workflowSocket.current = null;
    setRunning(true);
    setMessage("Submitting workflow...");

    const payload: WorkflowSchema = {
      nodes: nodes.map(({ id, data }) => ({
        id,
        type: data.nodeType,
        inputs: data.inputs.map(({ id: portId, name, dataType }) => ({
          id: portId,
          name,
          type: dataType,
        })),
        outputs: data.outputs.map(({ id: portId, name, dataType }) => ({
          id: portId,
          name,
          type: dataType,
        })),
      })),
      connections: edges.map((edge) => ({
        id: edge.id,
        sourceNode: edge.source,
        sourcePort: edge.sourceHandle ?? "",
        targetNode: edge.target,
        targetPort: edge.targetHandle ?? "",
      })),
    };

    try {
      const response = await api.transferWorkflowSchema(payload);
      const workflowId = response.taskId ?? response.workflowId ?? response.id;

      if (response.status === "completed") {
        setRunning(false);
        setMessage(response.message ?? "Workflow completed successfully ✓");
        return;
      }

      if (workflowId) {
        workflowSocket.current = new WorkflowSocket(workflowId, (event) => {
          setMessage(event.message ?? (typeof event.data === "string" ? event.data : event.type));

          const eventType = event.type.toLowerCase();
          if (
            eventType.includes("complete") ||
            eventType.includes("success") ||
            eventType.includes("error") ||
            eventType.includes("fail")
          ) {
            setRunning(false);
            workflowSocket.current?.disconnect();
            workflowSocket.current = null;
          }
        });
        workflowSocket.current.connect();
        setMessage(response.message ?? `Workflow ${workflowId} accepted by backend`);
      } else {
        setRunning(false);
        setMessage(response.message ?? "Workflow accepted by backend");
      }
    } catch (error) {
      setRunning(false);
      setMessage(error instanceof Error ? error.message : "Workflow submission failed");
    }
  };

  const serialize = () => ({
    name: workflowName,
    version: 1,
    nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
    edges
  });

  const save = () => {
    localStorage.setItem("ugene-workflow", JSON.stringify(serialize(), null, 2));
    setMessage("Workflow saved to browser storage");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Workflow JSON exported");
  };

  const load = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setWorkflowName(parsed.name ?? "Imported Workflow");
        setNodes(parsed.nodes ?? []);
        setEdges(parsed.edges ?? []);
        setSelectedId(null);
        setMessage("Workflow loaded");
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      } catch {
        setMessage("Could not load workflow JSON");
      }
    };
    reader.readAsText(file);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
    setMessage("Node deleted");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  useEffect(() => () => workflowSocket.current?.disconnect(), []);

  return (
    <div className="app-shell">
      <MenuBar />

      <div className="workflow-titlebar">
        <input
          className="workflow-name"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
        />
        <span className="workflow-version">Workflow v1</span>
        <span className={`run-indicator ${running ? "active" : ""}`}>
          {running ? "● Running" : "● Idle"}
        </span>
      </div>

      <Toolbar
        onRun={run}
        onValidate={validate}
        onSave={save}
        onLoad={load}
        onExport={exportJson}
        onDelete={deleteSelected}
      />

      <main className="workspace">
        <Palette />

        <section
          className="canvas-area"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode={null}
            connectionRadius={25}
            defaultEdgeOptions={{ animated: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => node.data?.status === "success" ? "#4caf50" : "#4779b8"}
            />
          </ReactFlow>
          <div className="canvas-hint">Drag tools from the left panel onto the canvas • Connect compatible ports</div>
        </section>

        <PropertiesPanel data={selectedData} onChange={updateParameters} />
      </main>

      <footer className="statusbar">
        <span>{message}</span>
        <span>Nodes: {nodes.length}</span>
        <span>Connections: {edges.length}</span>
        <span className="status-spacer" />
        <span>React + TypeScript</span>
      </footer>
    </div>
  );
}

export default Workflow;
