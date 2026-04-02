export type KnowledgeBaseRow = {
  id: string | number;
  uuid: string;
  question?: string;
  answer?: string;
  category?: string;
  has_embedding?: boolean;
  source_type?: "faq" | "document";
  source_name?: string | null;
  storage_path?: string | null;
  chunk_index?: number | null;
};
