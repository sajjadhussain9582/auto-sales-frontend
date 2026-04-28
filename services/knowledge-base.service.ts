import { apiRequest } from "@/lib/api-client";
import type { KnowledgeBaseRow, KnowledgeBaseListResponse } from "@/types/knowledge";

export const knowledgeBaseService = {
  async list(skip: number = 0, limit: number = 5): Promise<KnowledgeBaseListResponse> {
    return apiRequest(`/knowledge-base/?skip=${skip}&limit=${limit}`);
  },

  async upload(file: File, category?: string): Promise<{ ok: boolean; source_name: string; chunks_created: number }> {
    const formData = new FormData();
    formData.append("file", file);
    if (category) {
      formData.append("category", category);
    }
    return apiRequest("/knowledge-base/upload", {
      method: "POST",
      body: formData,
    });
  },

  async paste(content: string, sourceName: string, category?: string): Promise<{ ok: boolean }> {
    return apiRequest("/knowledge-base/paste", {
      method: "POST",
      body: JSON.stringify({
        content,
        source_name: sourceName,
        category: category ?? "general",
      }),
    });
  },

  async deleteEntry(uuid: string): Promise<{ ok: boolean }> {
    return apiRequest(`/knowledge-base/${uuid}`, {
      method: "DELETE",
    });
  },

  async deleteSource(sourceName: string): Promise<{ ok: boolean; deleted_count?: number }> {
    return apiRequest(`/knowledge-base/source/${encodeURIComponent(sourceName)}`, {
      method: "DELETE",
    });
  },

  async updateEntry(id: string | number, data: Partial<KnowledgeBaseRow>): Promise<KnowledgeBaseRow> {
    return apiRequest(`/knowledge-base/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
