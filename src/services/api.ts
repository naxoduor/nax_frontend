import type {
  AlignmentOptions,
  AnalysisOptions,
  ProjectNode,
  Sequence,
  UgeneSchemaTransferRequest,
  UgeneSchemaTransferResponse,
  WorkflowSchema,
  WorkflowTransferResponse,
} from "../types/bioinformatics"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
export const isBackendConfigured = Boolean(import.meta.env.VITE_API_BASE_URL);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<ProjectNode[]>("/projects"),

  getSequence: (id: string) =>
    request<Sequence>(`/sequences/${encodeURIComponent(id)}`),

  getAlignment: (id: string) =>
    request<Sequence[]>(`/alignments/${encodeURIComponent(id)}`),

  createAlignment: (sequenceIds: string[], options: AlignmentOptions) =>
    request<{ taskId: string }>("/alignments", {
      method: "POST",
      body: JSON.stringify({ sequenceIds, options }),
    }),

  getTask: (taskId: string) =>
    request<{ id: string; status: string; progress: number }>(
      `/tasks/${encodeURIComponent(taskId)}`,
    ),

  runAnalysis: (sequenceIds: string[], options: AnalysisOptions) =>
    request<{ taskId: string }>("/analysis", {
      method: "POST",
      body: JSON.stringify({ sequenceIds, options }),
    }),

  transferUgeneSchema: (payload: UgeneSchemaTransferRequest) =>
    request<UgeneSchemaTransferResponse>("/ugene/schema/transfer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  transferWorkflowSchema: (payload: WorkflowSchema) =>
    request<WorkflowTransferResponse>("/ugene/schema/transfer", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json() as Promise<ProjectNode>;
  },
};