import { OpenAIProvider } from '../src/embeddings/openaiProvider';
describe('OpenAIProvider', () => {
  it('should return an embedding for a string', async () => {
    const embedder = new OpenAIProvider('fake-key');
    const [embedding] = await embedder.embed(['test']);
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
  });
});
