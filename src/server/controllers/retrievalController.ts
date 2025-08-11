import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();
import { store, embedder } from '../../config/vector';
import { logInfo, logError } from '../../config/logger';
import { generateWithOpenAI } from '../../llm/openai';

export async function queryChunks(req: Request, res: Response) {
  try {
    const { query, topK = 5, generate = false, apiKey } = req.body as { query: string; topK?: number; generate?: boolean; apiKey?: string };
    if (!query || typeof query !== 'string' || !query.trim()) {
      logError('QueryChunks: Missing or invalid query field', req.body);
      return res.status(400).json({ error: 'Missing or invalid query field' });
    }
    logInfo('QueryChunks: Query received', { query, topK, generate });
    const [embedding] = await embedder.embed([query]);
    const results = await store.similaritySearch(embedding, topK);
    logInfo('QueryChunks: Results found', { count: results.length });
    // Format for citations
    const citations = results.map(({ chunk, score }) => ({
      id: chunk.id,
      docId: chunk.docId,
      title: chunk.metadata?.title,
      sourceType: chunk.metadata?.sourceType,
      score,
    }));
    if (!generate) {
      res.json({ results: citations });
      return;
    }
    // Build context for LLM
    const context = results.map(({ chunk }) => chunk.text).join('\n---\n');
    const prompt = `Answer the following question using only the provided context.\nContext:\n${context}\nQuestion: ${query}`;
    logInfo('RAG: Sending prompt to OpenAI', { prompt });
    const answer = await generateWithOpenAI(prompt, apiKey);
    res.json({ answer, citations });
  } catch (err: any) {
    logError('QueryChunks error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
