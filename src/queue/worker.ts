import { Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { chunkText } from '../ingestion/chunker';
import { MemoryVectorStore } from '../vectorstore/adapters/memoryStore';
import { OpenAIProvider } from '../embeddings/openaiProvider';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const store = new MemoryVectorStore();
const embedder = new OpenAIProvider(process.env.OPENAI_API_KEY || '', process.env.EMBEDDING_MODEL);

const worker = new Worker('ingestion', async job => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  const { text, docId } = job.data as { text: string; docId?: string };
  const actualDocId = docId || uuidv4();

  const chunks = chunkText(actualDocId, text);
  const embeddings = await embedder.embed(chunks.map(c => c.text));
  chunks.forEach((c, i) => (c.embedding = embeddings[i]));
  await store.upsert(chunks);

  return { docId: actualDocId, chunkCount: chunks.length };
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});