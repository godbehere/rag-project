import { EmbeddingProvider } from '../types';

export class OpenAIProvider implements EmbeddingProvider {
  apiKey: string;
  model: string;
  constructor(apiKey: string, model = 'text-embedding-3-small') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key missing');
    }
    // In production: call the OpenAI API to get embeddings.
    // Here: return random vectors for testing.
    return texts.map(() => Array(1536).fill(0).map(() => Math.random()));
  }
}