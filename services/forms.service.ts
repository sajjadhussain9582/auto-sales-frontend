import { getSessionToken } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/api-config";
import type { FormSubmitPayload, FormSubmitResponse } from "@/types/form";

function formatSubmitError(data: unknown, status: number, fallback: string): string {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  if (status === 404) return "Form not found. Check NEXT_PUBLIC_FORM_ID.";
  return fallback;
}

/**
 * Staff intake: creates contact + conversation + AI reply.
 * Sends Bearer when logged in (optional on backend).
 */
export async function submitIntakeForm(
  formId: string,
  payload: FormSubmitPayload
): Promise<FormSubmitResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}/forms/${encodeURIComponent(formId)}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    throw new Error(formatSubmitError(data, res.status, res.statusText));
  }

  return data as FormSubmitResponse;
}
