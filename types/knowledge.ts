export interface KnowledgeBaseRow {
  id: number;
  uuid: string;
  question: string;
  answer: string;
  category: string | null;
  source_type: string;
  source_name: string | null;
  storage_path: string | null;
  chunk_index: number | null;
  has_embedding: boolean;
}

export interface KnowledgeBaseListResponse {
  total: number;
  skip: number;
  limit: number;
  items: KnowledgeBaseRow[];
}
