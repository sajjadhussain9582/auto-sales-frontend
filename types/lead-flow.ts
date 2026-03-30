export interface PipelineStage {
  id: number
  key: string
  pipelinestage: string
  order_index: number
  ai_instructions?: string
}

export interface KanbanLead {
  uuid: string
  email: string
  username: string
  company?: string
  stage: string
  status: string
  lead_score: number
  updated_at: string
}

export type KanbanData = Record<string, KanbanLead[]>

export interface UpdateLeadStagePayload {
  stage: string
}
