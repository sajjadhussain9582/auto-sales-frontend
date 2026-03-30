import { getSessionToken } from "@/lib/api-client"
import { getApiBaseUrl } from "@/lib/api-config"
import { Integration } from "@/types/integration"

async function readErrorResponse(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const data = JSON.parse(text) as { detail?: any }
    if (typeof data.detail === "string") return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((e: any) => e?.msg ?? "")
        .filter(Boolean)
        .join(", ")
    }
  } catch {
    /* fallback to status text */
  }
  return text || res.statusText || `Request failed (${res.status})`
}

function getHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const token = getSessionToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export const integrationsService = {
  async list(): Promise<Integration[]> {
    const res = await fetch(`${getApiBaseUrl()}/integrations`, {
      headers: getHeaders(),
    })
    if (!res.ok) throw new Error(await readErrorResponse(res))
    return res.json()
  },

  async connectHubspot(): Promise<void> {
    const url = "http://localhost:8000/api/v1/integrations/hubspot/authorize"
    if (url) {
      window.location.href = url
    }
  },

  async configureEmail(payload: any): Promise<any> {
    const res = await fetch(`${getApiBaseUrl()}/integrations/email/configure`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await readErrorResponse(res))
    return res.json()
  },

  async configureCalendly(payload: any): Promise<any> {
    return fetch(`${getApiBaseUrl()}/integrations/calendly/configure`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await readErrorResponse(res))
      return res.json()
    })
  },

  async getCalendlyEventTypes(): Promise<any> {
    const res = await fetch(
      `${getApiBaseUrl()}/integrations/calendly/event-types`,
      {
        headers: getHeaders(),
      }
    )
    if (!res.ok) throw new Error(await readErrorResponse(res))
    return res.json()
  },

  async disconnect(provider: string): Promise<any> {
    const res = await fetch(
      `${getApiBaseUrl()}/integrations/${encodeURIComponent(provider)}/disconnect`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    )
    if (!res.ok) throw new Error(await readErrorResponse(res))
    return res.json()
  },

  async syncContactToHubspot(contactUuid: string): Promise<any> {
    const res = await fetch(
      `${getApiBaseUrl()}/integrations/hubspot/sync/${encodeURIComponent(contactUuid)}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    )
    if (!res.ok) throw new Error(await readErrorResponse(res))
    return res.json()
  },
}
