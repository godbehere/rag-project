import { chunkText } from '../src/ingestion/chunker';
import { Chunk } from '../src/types';

describe('chunkText', () => {
  it('should split text into chunks', () => {
    const docId = 'test-doc';
    const text = 'Sentence one. Sentence two. Sentence three. Sentence four.';
    const chunks: Chunk[] = chunkText(docId, text, 25, 2);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].docId).toBe(docId);
    expect(typeof chunks[0].text).toBe('string');
  });
});
