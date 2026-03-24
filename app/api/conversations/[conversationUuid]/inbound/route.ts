import { getApiBaseUrl } from "@/lib/api-config";

type InboundProxyBody = {
  message?: unknown;
  channel?: unknown;
  metadata?: unknown;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ conversationUuid: string }> }
): Promise<Response> {
  const formSubmitApiKey = process.env.FORM_SUBMIT_API_KEY;
  const { conversationUuid } = await ctx.params;

  if (!conversationUuid?.trim()) {
    return Response.json({ detail: "conversationUuid is required" }, { status: 400 });
  }

  let body: InboundProxyBody;
  try {
    body = (await req.json()) as InboundProxyBody;
  } catch {
    return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return Response.json({ detail: "message is required" }, { status: 422 });
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
    `${getApiBaseUrl()}/conversations/${encodeURIComponent(conversationUuid)}/inbound`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: body.message.trim(),
        ...(typeof body.channel === "string" && body.channel.trim() ? { channel: body.channel } : {}),
        ...(typeof body.metadata === "object" && body.metadata !== null
          ? { metadata: body.metadata }
          : {}),
      }),
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
