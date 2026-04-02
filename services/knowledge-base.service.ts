import { apiRequest } from "@/lib/api-client";
import type { KnowledgeBaseRow } from "@/types/knowledge";

export const knowledgeBaseService = {
  async list(): Promise<KnowledgeBaseRow[]> {
    const data = await apiRequest<unknown>("/knowledge-base/");
    if (!Array.isArray(data)) return [];
    return data as KnowledgeBaseRow[];
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

  async deleteEntry(id: string | number): Promise<{ ok: boolean }> {
    return apiRequest(`/knowledge-base/${id}`, {
      method: "DELETE",
    });
  },

  async deleteSource(sourceName: string): Promise<{ ok: boolean }> {
    // Assuming DELETE /knowledge-base/source/{sourceName} exists or we delete all items with that source
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
