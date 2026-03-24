import { getApiBaseUrl } from "@/lib/api-config";

type SubmitProxyBody = {
  formId?: unknown;
  payload?: unknown;
};

export async function POST(req: Request): Promise<Response> {
  const formSubmitApiKey = process.env.FORM_SUBMIT_API_KEY;

  let body: SubmitProxyBody;
  try {
    body = (await req.json()) as SubmitProxyBody;
  } catch {
    return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const formIdRaw = body.formId;
  if (typeof formIdRaw !== "string" || !formIdRaw.trim()) {
    return Response.json({ detail: "formId is required" }, { status: 400 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (formSubmitApiKey) {
    headers["X-API-Key"] = formSubmitApiKey;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const upstream = await fetch(
    `${getApiBaseUrl()}/forms/${encodeURIComponent(formIdRaw)}/submit`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body.payload ?? {}),
      cache: "no-store",
    }
  );

  const text = await upstream.text();
  const contentType = upstream.headers.get("content-type") ?? "application/json";
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}
