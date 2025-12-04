import { getToken, clearToken } from "./auth-storage";
import type {
  DesignProcess,
  DesignProcessDetails,
  ProcessStatusResponse,
  QuizQuestion,
  UserAnswer,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiError = {
  status: number;
  message: string;
  data?: unknown;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const error: ApiError = {
      status: res.status,
      message:
        (data as { message?: string })?.message ||
        `Request failed with status ${res.status}`,
      data,
    };
    throw error;
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProcesses: () => request<DesignProcess[]>("/api/processes"),
  createProcess: () =>
    request<DesignProcess>("/api/processes", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  getProcess: (id: number) => request<DesignProcess>(`/api/processes/${id}`),
  updateTitle: (id: number, title: string) =>
    request<DesignProcess>(`/api/processes/${id}/title`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  startGeneration: (id: number) =>
    request<void>(`/api/processes/${id}/start-generation`, { method: "POST" }),
  generateImage: (id: number) =>
    request<void>(`/api/processes/${id}/generate-image`, { method: "POST" }),
  deleteProcess: (id: number) =>
    request<void>(`/api/processes/${id}`, { method: "DELETE" }),
  getPrompt: (id: number) =>
    request<{ prompt: string }>(`/api/processes/${id}/prompt`),
  getStatus: (id: number) =>
    request<ProcessStatusResponse>(`/api/processes/${id}/status`),
  getProcessDetails: (id: number) =>
    request<DesignProcessDetails>(`/api/processes/${id}/details`),
  updateComment: (id: number, comment: string | null) =>
    request<DesignProcessDetails>(`/api/processes/${id}/comment`, {
      method: "PATCH",
      body: JSON.stringify({ comment }),
    }),
  getQuestions: () => request<QuizQuestion[]>("/api/quiz/questions"),
  submitAnswer: (processId: number, questionId: number, answerJson: unknown) =>
    request<UserAnswer>(`/api/quiz/processes/${processId}/answers`, {
      method: "POST",
      body: JSON.stringify({ questionId, answerJson }),
    }),
  getAnswers: (processId: number) =>
    request<UserAnswer[]>(`/api/quiz/processes/${processId}/answers`),
  getMe: () =>
    request<{ id: number; email: string; displayName?: string; display_name?: string; name?: string }>(
      "/api/auth/me",
    ),
};
