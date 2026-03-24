/** API base including `/api/v1` — set `NEXT_PUBLIC_API_URL` in `.env` */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
  return raw.replace(/\/$/, "");
}

export function getDefaultFormId(): string {
  return process.env.NEXT_PUBLIC_FORM_ID ?? "1";
}
