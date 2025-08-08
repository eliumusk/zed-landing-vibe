import { apiFetch } from "./http";

export type UploadResponse = {
  task_id: string;
  filename: string;
  message: string;
};

export type ProcessParams = {
  enable_multimodal?: boolean;
  keep_temp?: boolean;
};

export type StatusResponse = {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  current_step?: string;
  progress?: number; // 0..1
  created_at?: string;
};

export async function uploadVideo(file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<UploadResponse>("/api/upload", {
    method: "POST",
    body: form,
  });
}

export async function startProcess(taskId: string, params: ProcessParams = {}) {
  return apiFetch(`/api/process/${encodeURIComponent(taskId)}`, {
    method: "POST",
    body: JSON.stringify({ enable_multimodal: true, keep_temp: false, ...params }),
  });
}

export async function getStatus(taskId: string) {
  return apiFetch<StatusResponse>(`/api/status/${encodeURIComponent(taskId)}`);
}

export async function getResults(taskId: string) {
  return apiFetch<any>(`/api/results/${encodeURIComponent(taskId)}`);
}

export function getExportMarkdownUrl(taskId: string) {
  // Return full URL for direct download
  const base = (typeof window !== 'undefined' ? (window.localStorage.getItem('apiBaseUrl') || 'http://localhost:8000') : 'http://localhost:8000').replace(/\/$/, "");
  return `${base}/api/export/${encodeURIComponent(taskId)}/markdown`;
}
