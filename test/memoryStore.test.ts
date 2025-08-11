import { MemoryVectorStore } from '../src/vectorstore/adapters/memoryStore';
import { Chunk } from '../src/types';
describe('MemoryVectorStore', () => {
  it('should upsert and search for similar chunks', async () => {
    const store = new MemoryVectorStore();
    const chunk: Chunk = { id: '1', docId: 'd1', text: 'test', embedding: [1, 0, 0] };
    await store.upsert([chunk]);
    const results = await store.similaritySearch([1, 0, 0], 1);
    expect(results.length).toBe(1);
    expect(results[0].chunk.id).toBe('1');
  });
});
