import { getApiBaseUrl } from "@/lib/api-config";
import { STORAGE_KEYS } from "@/utils/storage-keys";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.sessionToken);
}

export function setSessionToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.sessionToken, token);
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.sessionToken);
}

function buildUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

type ApiRequestOptions = RequestInit & {
  /** When true, do not send Bearer (e.g. not used for public routes via this client) */
  skipAuth?: boolean;
  /** When false, 401 will clear session and redirect to login */
  redirectOn401?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuth, redirectOn401 = true, ...init } = options;
  const headers = new Headers(init.headers);
  const token = getSessionToken();
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path), { ...init, headers });

  const text = await res.text();
  let data: unknown = text;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (res.status === 401 && redirectOn401 && !skipAuth) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    throw new ApiError(401, "Session expired. Please sign in again.", data);
  }

  if (!res.ok) {
    const msg = formatApiErrorMessage(data, res.statusText);
    throw new ApiError(res.status, msg, data);
  }

  return data as T;
}

function formatApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      return d
        .map((x) => (typeof x === "object" && x !== null && "msg" in x ? String((x as { msg: string }).msg) : String(x)))
        .join(", ");
    }
  }
  return fallback || "Request failed";
}
