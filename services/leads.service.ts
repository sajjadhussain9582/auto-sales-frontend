import { apiRequest } from "@/lib/api-client"
import { isMockDataEnabled } from "@/lib/feature-flags"
import {
  PipelineStage,
  KanbanData,
  UpdateLeadStagePayload,
  KanbanLead,
} from "@/types/lead-flow"

// Mock data for fallback or when mock data is enabled
const MOCK_STAGES: PipelineStage[] = [
  { id: 1, key: "discovery", pipelinestage: "Discovery", order_index: 1 },
  { id: 2, key: "qualified", pipelinestage: "Qualified", order_index: 2 },
  {
    id: 3,
    key: "proposal_ready",
    pipelinestage: "Proposal Ready",
    order_index: 3,
  },
  { id: 4, key: "negotiation", pipelinestage: "Negotiation", order_index: 4 },
  { id: 5, key: "won", pipelinestage: "Won", order_index: 5 },
  { id: 6, key: "lost", pipelinestage: "Lost", order_index: 6 },
]

const MOCK_KANBAN_DATA: KanbanData = {
  discovery: [
    {
      uuid: "lead-1",
      email: "john@example.com",
      username: "John Doe",
      company: "Tech Solutions",
      stage: "discovery",
      status: "active",
      lead_score: 85,
      updated_at: new Date().toISOString(),
    },
  ],
  qualified: [
    {
      uuid: "lead-2",
      email: "jane@example.com",
      username: "Jane Smith",
      company: "Global Corp",
      stage: "qualified",
      status: "active",
      lead_score: 92,
      updated_at: new Date().toISOString(),
    },
  ],
  proposal_ready: [
    {
      uuid: "lead-3",
      email: "robert@example.com",
      username: "Robert Brown",
      company: "Startup Inc",
      stage: "proposal_ready",
      status: "active",
      lead_score: 78,
      updated_at: new Date().toISOString(),
    },
  ],
  negotiation: [
    {
      uuid: "lead-4",
      email: "alice@example.com",
      username: "Alice White",
      company: "Creative Studio",
      stage: "negotiation",
      status: "active",
      lead_score: 88,
      updated_at: new Date().toISOString(),
    },
  ],
  won: [],
  lost: [],
}

export const leadsService = {
  async listStages(): Promise<PipelineStage[]> {
    if (isMockDataEnabled()) {
      return [...MOCK_STAGES].sort((a, b) => a.order_index - b.order_index)
    }
    try {
      return await apiRequest<PipelineStage[]>("/pipeline-stages")
    } catch (error) {
      console.error("Failed to fetch pipeline stages", error)
      return [...MOCK_STAGES].sort((a, b) => a.order_index - b.order_index)
    }
  },

  async getKanban(): Promise<KanbanData> {
    if (isMockDataEnabled()) {
      return { ...MOCK_KANBAN_DATA }
    }
    try {
      return await apiRequest<KanbanData>("/contacts/kanban")
    } catch (error) {
      console.error("Failed to fetch kanban data", error)
      return { ...MOCK_KANBAN_DATA }
    }
  },

  async updateLeadStage(
    uuid: string,
    payload: UpdateLeadStagePayload
  ): Promise<KanbanLead> {
    if (isMockDataEnabled()) {
      console.log(`[MOCK] Updating lead ${uuid} to stage ${payload.stage}`)
      return {
        uuid,
        email: "mock@example.com",
        username: "Mock Lead",
        stage: payload.stage,
        status: "active",
        lead_score: 0,
        updated_at: new Date().toISOString(),
      } as KanbanLead
    }
    return await apiRequest<KanbanLead>(`/contacts/${uuid}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
}
