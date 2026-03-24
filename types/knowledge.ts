export type KnowledgeBaseRow = {
  id: string | number;
  question?: string;
  answer?: string;
  category?: string;
  has_embedding?: boolean;
};
