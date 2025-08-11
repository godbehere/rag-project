import { VectorStore, Chunk } from '../../types';

export class MemoryVectorStore implements VectorStore {
  private rows: { chunk: Chunk; embedding: number[] }[] = [];

  async upsert(chunks: Chunk[]): Promise<void> {
    for (const c of chunks) {
      if (!c.embedding) throw new Error('chunk missing embedding');
      const idx = this.rows.findIndex(r => r.chunk.id === c.id);
      if (idx >= 0) this.rows[idx] = { chunk: c, embedding: c.embedding };
      else this.rows.push({ chunk: c, embedding: c.embedding });
    }
  }

  async similaritySearch(queryEmbedding: number[], topK: number) {
    const scores = this.rows.map(r => ({
      chunk: r.chunk,
      score: cosineSimilarity(queryEmbedding, r.embedding),
    }));
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (na === 0 || nb === 0) return 0;
  return dot / (na * nb);
}