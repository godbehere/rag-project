import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorStore, Chunk } from '../../types';

export class QdrantVectorStore implements VectorStore {
  private client: QdrantClient;
  private collectionName: string;
  private vectorSize: number;

  constructor(collectionName = 'chunks', vectorSize = 1536) {
    this.client = new QdrantClient({ url: 'http://localhost:6333' });
    this.collectionName = collectionName;
    this.vectorSize = vectorSize;
  }

  async ensureCollection() {
    const collections = await this.client.getCollections();
    if (!collections.collections.some((c) => c.name === this.collectionName)) {
      await this.client.createCollection(this.collectionName, {
        vectors: { size: this.vectorSize, distance: 'Cosine' },
      });
    }
  }

  async upsert(chunks: Chunk[]): Promise<void> {
    await this.ensureCollection();
    await this.client.upsert(this.collectionName, {
      points: chunks.map((chunk) => ({
        id: chunk.id,
        vector: chunk.embedding!,
        payload: {
          docId: chunk.docId,
          text: chunk.text,
          title: chunk.metadata?.title,
          sourceType: chunk.metadata?.sourceType,
        },
      })),
    });
  }

  async similaritySearch(queryEmbedding: number[], topK: number) {
    await this.ensureCollection();
    const result = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit: topK,
      with_payload: true,
    });
    return result.map((r) => ({
      chunk: {
        id: r.id.toString(),
        docId: r.payload?.docId as string,
        text: r.payload?.text as string,
        embedding: queryEmbedding,
        metadata: {
          title: r.payload?.title as string,
          sourceType: r.payload?.sourceType as string,
        },
      },
      score: r.score,
    }));
  }
}
