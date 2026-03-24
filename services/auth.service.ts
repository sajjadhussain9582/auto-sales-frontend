import { getApiBaseUrl } from "@/lib/api-config";
import type { LoginResponse, RegisterPayload } from "@/types/auth";

async function readErrorResponse(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((e: { msg?: string }) => e?.msg ?? "")
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    /* use status */
  }
  if (res.status === 409) return "This email is already registered.";
  if (res.status === 401) return "Invalid email or password.";
  if (res.status === 400) return text || "Invalid request.";
  if (res.status === 422) return "Validation error. Check your input.";
  return text || res.statusText || "Request failed";
}

export const authService = {
  async register(payload: RegisterPayload): Promise<unknown> {
    const res = await fetch(`${getApiBaseUrl()}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await readErrorResponse(res));
    if (res.status === 204 || !res.headers.get("content-length")) return {};
    return res.json();
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const base = getApiBaseUrl();
    let res = await fetch(`${base}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 415 || res.status === 405) {
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", password);
      res = await fetch(`${base}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
    }

    if (!res.ok) throw new Error(await readErrorResponse(res));
    return (await res.json()) as LoginResponse;
  },
};
