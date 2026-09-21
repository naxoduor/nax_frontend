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

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_BASE_URL = "http://localhost:8080/api"; // Hardcoded for local development
export const isBackendConfigured = Boolean(import.meta.env.VITE_API_BASE_URL);
const CHUNK_SIZE = 5 * 1024 * 1024;

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

  transferUgeneSchema: async (payload: UgeneSchemaTransferRequest) => {
    console.log("send payload to backeend", payload)
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<UgeneSchemaTransferResponse>;
  },

  transferWorkflowSchema: async (payload: WorkflowSchema) => {
    console.log("send payload to backeend", payload)
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
  },
    // request<WorkflowTransferResponse>("/ugene/schema/transfer", {
    //   method: "POST",
    //   body: JSON.stringify(payload),
    // }),

  uploadFile: async (file: File, onProgress: (progress: number) => void) => {
    const createResponse = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        chunkSize: CHUNK_SIZE,
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Upload initialization failed: ${createResponse.status}`);
    }

    const upload = (await createResponse.json()) as { uploadId?: string };
    if (!upload.uploadId) {
      throw new Error("Upload initialization did not return an upload ID");
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber += 1) {
      const start = chunkNumber * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const response = await fetch(
        `${API_BASE_URL}/uploads/${encodeURIComponent(upload.uploadId)}/chunks/${chunkNumber}`,
        {
          method: "POST",
          body: file.slice(start, end),
        },
      );

      if (!response.ok) {
        throw new Error(`Upload chunk failed: ${response.status}`);
      }

      onProgress(((chunkNumber + 1) / totalChunks) * 100);
    }

    return upload.uploadId;
  },
};