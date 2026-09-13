import { MainWindow } from "../components/layout/MainWindow";
import { OpenFileDialog } from "../components/dialogs/OpenFileDialog";
import { AlignDialog } from "../components/dialogs/AlignDialog";
import { AnalysisDialog } from "../components/dialogs/AnalysisDialog";
import { initialProjectState } from "../store/projectStore";
import { simulateAlignment, gcContent } from "../services/alignment";
import { api, isBackendConfigured } from "../services/api";
import { workflow } from "../types/bioinformatics";
import type {
  AlignmentOptions,
  AnalysisOptions,
  DialogType,
  ProjectNode,
  SelectionRange,
  Sequence,
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

export function Workspace() {
  const [state, setState] = useState(initialProjectState);
  const [workflowId, setWorkflowId] = useState<string>();
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
    if (!isBackendConfigured) {
      handleAction("Configure VITE_API_BASE_URL to transfer workflow");
      return;
    }

    setStatus("Transferring workflow to Java backend...", "running");

    try {
      const response = await api.transferWorkflowSchema(workflow);
      if (response.taskId) setWorkflowId(response.taskId);
      const message = response.taskId
        ? `Workflow task ${response.taskId} accepted by backend`
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
        onSelectProjectNode={handleProjectNode}
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
        onAction={handleAction}
        onOpenInspector={() => setInspectorOpen(true)}
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
