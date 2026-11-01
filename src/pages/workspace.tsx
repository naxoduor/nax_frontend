import { MainWindow } from "../components/layout/MainWindow";
import { OpenFileDialog } from "../components/dialogs/OpenFileDialog";
import { AlignDialog } from "../components/dialogs/AlignDialog";
import { AnalysisDialog } from "../components/dialogs/AnalysisDialog";
import { initialProjectState } from "../store/projectStore";
import { simulateAlignment, gcContent } from "../services/alignment";
import { api, isBackendConfigured } from "../services/api";
import type { WorkflowEvent } from "../services/workflowSocket";
import { workflow as initialWorkflow } from "../types/bioinformatics";
import type {
  AlignmentOptions,
  AnalysisOptions,
  DialogType,
  ProjectNode,
  SelectionRange,
  Sequence,
  WorkflowSchema,
} from "../types/bioinformatics";
import { useCallback, useMemo, useState } from "react";

function parseSequenceFile(content: string, fileName: string): Sequence[] {
  const isFastq = fileName.toLowerCase().endsWith(".fastq") ||
    fileName.toLowerCase().endsWith(".fq");

  if (isFastq) {
    const lines = content.split(/\r?\n/).filter(Boolean);
    const sequences: Sequence[] = [];

    for (let i = 0; i + 1 < lines.length; i += 4) {
      const header = lines[i]?.replace(/^@/, "").trim() || `seq${i / 4 + 1}`;
      const sequence = lines[i + 1]?.trim().toUpperCase() ?? "";

      if (sequence) {
        sequences.push({
          id: header.split(/\s+/)[0],
          description: header,
          sequence,
          type: "DNA",
        });
      }
    }

    return sequences;
  }

  const records: Sequence[] = [];
  let current: Sequence | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith(">")) {
      if (current) records.push(current);

      const header = line.slice(1).trim();
      const [id, ...description] = header.split(/\s+/);

      current = {
        id: id || `seq${records.length + 1}`,
        description: description.join(" ") || header,
        sequence: "",
        type: "DNA",
      };
    } else if (current) {
      current.sequence += line.replace(/\s+/g, "").toUpperCase();
    }
  }

  if (current) records.push(current);

  return records;
}

function getWorkflowFile(event: WorkflowEvent) {
  const data = event.data;
  const eventPayload = event as WorkflowEvent & Record<string, unknown>;
  const payload = data && typeof data === "object"
    ? data as Record<string, unknown>
    : {};
  const nestedFile = payload.file && typeof payload.file === "object"
    ? payload.file as Record<string, unknown>
    : {};
  const stringData = typeof data === "string" ? data.trim() : undefined;
  const messageFileName = event.message?.match(/[^\s/]+\.[a-z0-9]+$/i)?.[0];
  const fileName = [
    payload.fileName,
    payload.filename,
    nestedFile.fileName,
    nestedFile.filename,
    eventPayload.fileName,
    eventPayload.filename,
    eventPayload.fileName,
    messageFileName,
    stringData && !stringData.includes(">") && !stringData.includes("@") ? stringData : undefined]
    .find((value): value is string => typeof value === "string" && value.length > 0);
  const content = [payload.content, nestedFile.content, eventPayload.content]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    ?? (typeof data === "string" && (data.includes(">") || data.includes("@"))
      ? data
      : undefined);
  const downloadUrl = [
    payload.downloadUrl,
    payload.url,
    payload.fileUrl,
    nestedFile.downloadUrl,
    nestedFile.url,
    nestedFile.fileUrl,
    eventPayload.downloadUrl,
    eventPayload.url,
    eventPayload.fileUrl,
  ]
    .find((value): value is string => typeof value === "string" && value.length > 0);

  const urlFileName = downloadUrl?.split(/[/?#]/).filter(Boolean).pop();
  const resolvedFileName = fileName ?? urlFileName ?? (content ? "workflow-result.fasta" : undefined);

  return resolvedFileName ? {
    fileName: resolvedFileName,
    content,
    downloadUrl,
  } : null;
}

function getWorkflowMessage(event: WorkflowEvent) {
  if (event.message) return event.message;
  if (typeof event.data === "string") return event.data;
  if (event.data === undefined) return event.type;

  try {
    return JSON.stringify(event.data);
  } catch {
    return event.type;
  }
}

function getWorkflowTransferId(response: {
  taskId?: string;
  workflowId?: string;
  id?: string;
  task_id?: string;
  workflow_id?: string;
  data?: unknown;
  result?: unknown;
}) {
  const nested = [response.data, response.result].find(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object",
  );
  const nestedRecord = nested ?? {};
  const id = response.taskId
    ?? response.workflowId
    ?? response.id
    ?? response.task_id
    ?? response.workflow_id
    ?? nestedRecord.taskId
    ?? nestedRecord.workflowId
    ?? nestedRecord.id
    ?? nestedRecord.task_id
    ?? nestedRecord.workflow_id;

  return typeof id === "string" && id.length > 0 ? id : undefined;
}

export function Workspace({ onOpenWorkflowPage }: { onOpenWorkflowPage: () => void }) {
  const [state, setState] = useState(initialProjectState);
  const [workflowId, setWorkflowId] = useState<string>();
  const [workflowDraft, setWorkflowDraft] = useState<WorkflowSchema>(initialWorkflow);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    project: true,
    sequences: true,
    alignments: true,
  });

  const selectedSequences = useMemo(
    () =>
      state.sequences.filter((sequence) =>
        state.selectedSequenceIds.includes(sequence.id),
      ),
    [state.sequences, state.selectedSequenceIds],
  );

  const setStatus = useCallback(
    (message: string, kind: "ready" | "running" | "success" | "error" = "ready") => {
      setState((current) => ({
        ...current,
        status: { message, kind },
      }));
    },
    [],
  );

  const handleAction = useCallback(
    (message: string) => {
      setStatus(message, "success");
      window.setTimeout(() => setStatus("Ready", "ready"), 1800);
    },
    [setStatus],
  );

  const handleSelectSequence = (id: string) => {
    setState((current) => {
      const exists = current.selectedSequenceIds.includes(id);

      return {
        ...current,
        selectedSequenceIds: exists
          ? current.selectedSequenceIds.filter((item) => item !== id)
          : [...current.selectedSequenceIds, id],
      };
    });
  };

  const handleAlignment = async (options: AlignmentOptions) => {
    if (!selectedSequences.length) {
      handleAction("Select at least one sequence");
      return;
    }

    setState((current) => ({
      ...current,
      activeDialog: null,
      status: {
        message: `Running ${options.algorithm}...`,
        kind: "running",
      },
    }));

    let aligned: Sequence[];

    if (isBackendConfigured) {
      try {
        const response = await api.transferUgeneSchema({
          schemaVersion: "1.0",
          operation: "ALIGNMENT",
          sequences: selectedSequences,
          options,
        });

        if (response.status === "accepted") {
          setStatus(
            response.taskId
              ? `Alignment task ${response.taskId} accepted by backend`
              : "Alignment task accepted by backend",
            "success",
          );
          return;
        }

        if (!response.sequences?.length) {
          throw new Error("Backend returned no aligned sequences");
        }

        aligned = response.sequences;
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Backend alignment failed",
          "error",
        );
        return;
      }
    } else {
      aligned = await simulateAlignment(selectedSequences, options);
    }

    setState((current) => {
      const ids = new Set(aligned.map((sequence) => sequence.id));

      return {
        ...current,
        sequences: current.sequences.map((sequence) =>
          ids.has(sequence.id)
            ? aligned.find((item) => item.id === sequence.id) ?? sequence
            : sequence,
        ),
        status: {
          message: `${options.algorithm} alignment completed`,
          kind: "success",
        },
      };
    });

    window.setTimeout(() => setStatus("Ready", "ready"), 2200);
  };

  const handleAnalysis = (options: AnalysisOptions) => {
    if (!selectedSequences.length) {
      handleAction("Select at least one sequence");
      return;
    }

    let message = `${options.analysis} analysis completed`;

    if (options.analysis === "GC Content") {
      const average =
        selectedSequences.reduce(
          (sum, sequence) => sum + gcContent(sequence.sequence),
          0,
        ) / selectedSequences.length;

      message = `Average GC content: ${average.toFixed(2)}%`;
    }

    setState((current) => ({
      ...current,
      activeDialog: null,
      status: {
        message,
        kind: "success",
      },
    }));

    window.setTimeout(() => setStatus("Ready", "ready"), 2500);
  };

  const handleWorkflowTransfer = async () => {
    console.log("Transferring workflow to Java backend", workflowDraft);
    // if (!isBackendConfigured) {
    //   handleAction("Configure VITE_API_BASE_URL to transfer workflow");
    //   return;
    // }

    setStatus("Transferring workflow to Java backend...", "running");

    try {
      console.log("Sending workflowDraft to backend", workflowDraft);
      const response = await api.transferWorkflowSchema(workflowDraft);
      console.log("Workflow transfer response", response);
      const returnedWorkflowId = getWorkflowTransferId(response);
      if (returnedWorkflowId) setWorkflowId(returnedWorkflowId);
      const message = returnedWorkflowId
        ? `Workflow task ${returnedWorkflowId} accepted by backend`
        : response.message ?? "Workflow transferred to Java backend";

      setStatus(message, "success");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Workflow transfer failed",
        "error",
      );
    }
  };

  const handleFile = async (file: File) => {
    try {
      if (isBackendConfigured) {
        setStatus("Uploading file 0%...", "running");
        await api.uploadFile(file, (progress) => {
          setStatus(`Uploading file ${Math.round(progress)}%...`, "running");
        });
      }

      const content = await file.text();
      const sequences = parseSequenceFile(content, file.name);

      if (!sequences.length) {
        setStatus("No sequences found in file", "error");
        return;
      }

      setState((current) => ({
        ...current,
        sequences,
        selectedSequenceIds: [sequences[0].id],
        activeDialog: null,
        status: {
          message: `${sequences.length} sequence(s) loaded from ${file.name}`,
          kind: "success",
        },
      }));

      window.setTimeout(() => setStatus("Ready", "ready"), 2500);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "File import failed",
        "error",
      );
    }
  };

  const handleProjectNode = (node: ProjectNode) => {
    if (node.type === "alignment") {
      handleAction(`Opened ${node.label}`);
    } else if (node.type !== "folder") {
      handleAction(`Selected ${node.label}`);
    }
  };

  const handleWorkflowEvent = useCallback((event: WorkflowEvent) => {
    const file = getWorkflowFile(event);
    const node: ProjectNode = file
      ? {
          id: `workflow-file-${file.fileName}`,
          label: file.fileName,
          type: "sequence",
          sequenceContent: file.content,
          downloadUrl: file.downloadUrl,
          workflowFile: true,
        }
      : {
          id: `workflow-message-${event.timestamp}-${event.type}`,
          label: `${event.type}: ${getWorkflowMessage(event)}`,
          type: "alignment",
        };
    const targetFolderId = file ? "sequences" : "results";

    setExpanded((current) => ({
      ...current,
      [targetFolderId]: true,
    }));

    setState((current) => ({
      ...current,
      projectTree: current.projectTree.map((project) =>
        project.id !== "project"
          ? project
          : {
              ...project,
              children: project.children?.map((child) =>
                child.id !== targetFolderId
                  ? child
                  : {
                      ...child,
                      children: [
                        ...(child.children ?? []).filter((item) => item.id !== node.id),
                        node,
                      ],
                    },
              ),
            },
      ),
      status: {
        message: file
          ? `${file.fileName} returned by workflow`
          : `WebSocket message received: ${getWorkflowMessage(event)}`,
        kind: "success",
      },
    }));
  }, []);

  const handleSequenceFileNode = async (node: ProjectNode) => {
    if (node.type !== "sequence" || !node.workflowFile) {
      handleAction(`Selected ${node.label}`);
      return;
    }

    try {
      const content = node.sequenceContent
        ?? await api.downloadWorkflowFile(node.downloadUrl ?? node.label);
      const sequences = parseSequenceFile(content, node.label);
      if (!sequences.length) throw new Error(`No sequences found in ${node.label}`);

      const download = document.createElement("a");
      download.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
      download.download = node.label;
      document.body.appendChild(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(download.href), 0);

      setState((current) => ({
        ...current,
        sequences,
        selectedSequenceIds: [sequences[0].id],
        status: { message: `${node.label} loaded`, kind: "success" },
      }));
    } catch (error) {
      handleAction(error instanceof Error ? error.message : `Failed to load ${node.label}`);
    }
  };

  const handleWorkflowFileEventClick = (event: WorkflowEvent) => {
    const file = getWorkflowFile(event);
    if (!file) return;

    void handleSequenceFileNode({
      id: `workflow-file-${file.fileName}`,
      label: file.fileName,
      type: "sequence",
      sequenceContent: file.content,
      downloadUrl: file.downloadUrl,
      workflowFile: true,
    });
  };

  const handleImport = () => {
    setState((current) => ({ ...current, activeDialog: "open" }));
  };

  const setDialog = (dialog: DialogType) => {
    setState((current) => ({ ...current, activeDialog: dialog }));
  };

  return (
    <>
      <MainWindow
        darkMode={state.darkMode}
        sidebarOpen={sidebarOpen}
        inspectorOpen={inspectorOpen}
        sequences={state.sequences}
        projectTree={state.projectTree}
        expanded={expanded}
        selectedSequenceIds={state.selectedSequenceIds}
        selection={state.selection}
        zoom={state.zoom}
        showConsensus={state.showConsensus}
        showGrid={state.showGrid}
        activeTab="BRCA1_MSA.aln"
        status={state.status}
        workflowId={workflowId}
        workflow={workflowDraft}
        workflowOpen={workflowOpen}
        onOpenWorkflowPage={onOpenWorkflowPage}
        onToggleTheme={() =>
          setState((current) => ({
            ...current,
            darkMode: !current.darkMode,
          }))
        }
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
        onToggleInspector={() => setInspectorOpen((value) => !value)}
        onToggleExpanded={(id) =>
          setExpanded((current) => ({ ...current, [id]: !current[id] }))
        }
        onSelectProjectNode={(node) => {
          void handleSequenceFileNode(node);
          if (node.type !== "sequence") handleProjectNode(node);
        }}
        onSelectSequence={handleSelectSequence}
        onSelectionChange={(selection: SelectionRange) =>
          setState((current) => ({ ...current, selection }))
        }
        onZoomChange={(zoom) =>
          setState((current) => ({ ...current, zoom }))
        }
        onToggleConsensus={() =>
          setState((current) => ({
            ...current,
            showConsensus: !current.showConsensus,
          }))
        }
        onToggleGrid={() =>
          setState((current) => ({
            ...current,
            showGrid: !current.showGrid,
          }))
        }
        onOpenDialog={() => setDialog("open")}
        onImport={handleImport}
        onAlign={() => setDialog("align")}
        onAnalyze={() => setDialog("analysis")}
        onTransferWorkflow={handleWorkflowTransfer}
        onOpenWorkflow={() => setWorkflowOpen(true)}
        onWorkflowChange={setWorkflowDraft}
        onAction={handleAction}
        onOpenInspector={() => setInspectorOpen(true)}
        onWorkflowEvent={handleWorkflowEvent}
        onFileEventClick={handleWorkflowFileEventClick}
      />

      {state.activeDialog === "open" && (
        <OpenFileDialog
          onClose={() => setDialog(null)}
          onFile={handleFile}
        />
      )}

      {state.activeDialog === "align" && (
        <AlignDialog
          selectedCount={selectedSequences.length}
          onClose={() => setDialog(null)}
          onRun={handleAlignment}
        />
      )}

      {state.activeDialog === "analysis" && (
        <AnalysisDialog
          selectedCount={selectedSequences.length}
          onClose={() => setDialog(null)}
          onRun={handleAnalysis}
        />
      )}
    </>
  );
}
