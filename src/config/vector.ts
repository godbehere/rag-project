// Centralized singleton for vector store and embedder
import { MemoryVectorStore } from '../vectorstore/adapters/memoryStore';
import { OpenAIProvider } from '../embeddings/openaiProvider';
import { config } from '.';

export const store = new MemoryVectorStore();
export const embedder = new OpenAIProvider(config.openaiApiKey, config.embeddingModel);
