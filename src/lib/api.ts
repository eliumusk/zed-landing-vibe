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
  progress_percent?: number;
  created_at?: string;
  updated_at?: string;
  error_message?: string;
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

export async function getAsr(taskId: string) {
  return apiFetch<{ task_id: string; data: any }>(`/api/results/${encodeURIComponent(taskId)}/asr`);
}

export async function getSummary(taskId: string) {
  return apiFetch<{ task_id: string; data: any }>(`/api/results/${encodeURIComponent(taskId)}/summary`);
}

export async function getResults(taskId: string) {
  return apiFetch<any>(`/api/results/${encodeURIComponent(taskId)}`);
}

export async function getMarkdownContent(taskId: string) {
  return apiFetch<string>(`/api/notes/${encodeURIComponent(taskId)}`);
}

export async function saveMarkdownContent(taskId: string, content: string) {
  return apiFetch(`/api/notes/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

export function getExportMarkdownUrl(taskId: string) {
  const base=(typeof window!=='undefined'?(window.localStorage.getItem('apiBaseUrl')||'/'):'/').replace(/\/$/,"");
  return `${base}/api/export/${encodeURIComponent(taskId)}/markdown`;
}
export function getExportPdfUrl(taskId: string) {
  const base=(typeof window!=='undefined'?(window.localStorage.getItem('apiBaseUrl')||'/'):'/').replace(/\/$/,"");
  return `${base}/api/export/${encodeURIComponent(taskId)}/pdf`;
}

// New endpoints for online video download & preview
export type DownloadStartResponse = {
  task_id: string;
  platform?: string;
  title?: string;
  message?: string;
  estimated_duration?: number;
};

export type DownloadStatusResponse = {
  task_id: string;
  status: "downloading" | "processing" | "completed" | "failed";
  platform?: string;
  title?: string;
  error_message?: string | null;
};

export async function previewVideo(url: string) {
  return apiFetch<{ platform?: string; title?: string; duration?: number; thumbnail?: string; uploader?: string; view_count?: number }>(
    "/api/preview-video",
    {
      method: "POST",
      body: JSON.stringify({ url }),
    }
  );
}

export async function downloadFromUrl(params: { url: string; quality?: "low" | "medium" | "high"; platform?: string }) {
  return apiFetch<DownloadStartResponse>("/api/download-url", {
    method: "POST",
    body: JSON.stringify({ quality: "medium", ...params }),
  });
}

export async function getDownloadStatus(taskId: string) {
  return apiFetch<DownloadStatusResponse>(`/api/download-status/${encodeURIComponent(taskId)}`);
}

// 流式摘要API
export function getStreamSummaryUrl(taskId: string){
  const base=(typeof window!=='undefined'?(window.localStorage.getItem('apiBaseUrl')||'/'):'/').replace(/\/$/,"");
  return `${base}/api/stream-summary/${encodeURIComponent(taskId)}`;
}

//流式agent
export async function streamAgent(
  taskId: string,
  msg: string,
  onDelta: (t: string) => void,
  onDone?: () => void,
  onSources?: (sources: string[]) => void
) {
  const base = (typeof window !== 'undefined' ? (localStorage.getItem('apiBaseUrl') || '/') : '/').replace(/\/$/, "");
  const res = await fetch(`${base}/api/agent/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ task_id: taskId, message: msg })
  });

  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || ""; // 保留最后一个可能不完整的行

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const jsonStr = line.slice(5).trim();
      try {
        const obj = JSON.parse(jsonStr);
        if (obj?.content) {
          onDelta(obj.content);
        } else if (obj?.sources && onSources) {
          onSources(obj.sources);
        } else if (obj?.done) {
          // 完成标记
        } else if (obj?.error) {
          console.error("Stream error:", obj.error);
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  }

  onDone && onDone();
}

// SSE状态流
export function createStatusStream(taskId: string, onStatus: (status: StatusResponse) => void, onComplete?: () => void, onError?: () => void) {
  const base = (typeof window !== 'undefined' ? (localStorage.getItem('apiBaseUrl') || '/') : '/').replace(/\/$/, "");
  const eventSource = new EventSource(`${base}/api/status/stream/${encodeURIComponent(taskId)}`);

  let isCompleted = false;

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // 处理错误消息
      if (data.error) {
        console.error("SSE error:", data.error);
        eventSource.close();
        onError?.();
        return;
      }

      // 处理完成标记
      if (data.done) {
        eventSource.close();
        if (!isCompleted) onComplete?.();
        return;
      }

      // 处理状态更新
      const status = data as StatusResponse;
      onStatus(status);

      if (status.status === "completed" || status.status === "failed") {
        isCompleted = true;
        setTimeout(() => {
          eventSource.close();
          onComplete?.();
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to parse SSE data:", error);
    }
  };

  eventSource.onerror = (error) => {
    console.warn("SSE connection error:", error);
    eventSource.close();
    onError?.();
  };

  // 5分钟后自动关闭连接
  setTimeout(() => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
      onError?.();
    }
  }, 300000);

  return eventSource;
}