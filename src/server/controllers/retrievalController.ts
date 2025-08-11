import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();
import { store, embedder } from '../../config/vector';
import { logInfo, logError } from '../../config/logger';

export async function queryChunks(req: Request, res: Response) {
  try {
    const { query, topK = 5 } = req.body as { query: string; topK?: number };
    if (!query || typeof query !== 'string' || !query.trim()) {
      logError('QueryChunks: Missing or invalid query field', req.body);
      return res.status(400).json({ error: 'Missing or invalid query field' });
    }
    logInfo('QueryChunks: Query received', { query, topK });
    const [embedding] = await embedder.embed([query]);
    const results = await store.similaritySearch(embedding, topK);
    logInfo('Embedding generated for query', { query, embedding });
    logInfo('QueryChunks: Results found', { count: results.length });
    logInfo('QueryResults: ', {results: results});
    // Return chunk metadata (id, docId, text, title, sourceType, score, etc.)
    const formatted = results.map(({ chunk, score }) => ({
      id: chunk.id,
      docId: chunk.docId,
      text: chunk.text,
      title: chunk.metadata?.title,
      sourceType: chunk.metadata?.sourceType,
      score,
    }));
    logInfo('QueryChunks: Results returned', { count: formatted.length });
    res.json({ results: formatted });
  } catch (err: any) {
    logError('QueryChunks error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
