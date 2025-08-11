import { EmbeddingProvider } from '../types';
import { config } from '../config';

export class OpenAIProvider implements EmbeddingProvider {
  apiKey: string;
  model: string;
  constructor(apiKey: string, model = 'text-embedding-3-small') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (config.useMockEmbeddings) {
      // Return random vectors for testing
      return texts.map(() => Array(1536).fill(0).map(() => Math.random()));
    }
    if (!this.apiKey) {
      throw new Error('OpenAI API key missing');
    }

    // Real OpenAI API call
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI embedding API error: ${response.status} ${err}`);
    }
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Unexpected OpenAI embedding API response');
    }
    // Each item in data.data has an 'embedding' array
    return data.data.map((item: any) => item.embedding);
  }
}