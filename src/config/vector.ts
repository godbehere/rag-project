// Centralized singleton for vector store and embedder
import { QdrantVectorStore } from '../vectorstore/adapters/qdrantStore';
import { OpenAIProvider } from '../embeddings/openaiProvider';
import { config } from '.';

export const store = new QdrantVectorStore('chunks', 1536);
export const embedder = new OpenAIProvider(config.openaiApiKey, config.embeddingModel);
