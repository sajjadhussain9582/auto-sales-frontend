import { apiRequest } from "@/lib/api-client";
import type { KnowledgeBaseRow } from "@/types/knowledge";

export const knowledgeBaseService = {
  async list(): Promise<KnowledgeBaseRow[]> {
    const data = await apiRequest<unknown>("/knowledge-base");
    if (!Array.isArray(data)) return [];
    return data as KnowledgeBaseRow[];
  },
};
