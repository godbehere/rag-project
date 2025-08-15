export type DocSourceType = 'pdf' | 'doc' | 'docx' | 'txt' | 'pptx' | 'website';

export interface DocumentMeta {
  id: string; // uuid
  source?: string;
  sourceType: DocSourceType;
  sourceUrl?: string; // if website or original storage url
  uploadedAt: string; // ISO string
}

export interface Chunk {
  id: string; // uuid
  docId: string;
  text: string;
  embedding?: number[]; // optional until embedding applied
  tokens?: number;
  metadata?: Record<string, any>;
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  upsert(chunks: Chunk[]): Promise<void>;
  similaritySearch(queryEmbedding: number[], topK: number): Promise<{ chunk: Chunk; score: number }[]>;
  deleteByDocId?(docId: string): Promise<void>;
}