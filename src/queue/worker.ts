import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { chunkText } from '../ingestion/chunker';
import { store, embedder } from '../config/vector';
import { Chunk } from '../types';
import { config } from '../config';
import { logDebug, logInfo, logError } from '../config/logger';

const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

console.log('Unified worker process started, waiting for jobs...');
console.log(`Use mock embeddings: ${config.useMockEmbeddings}`);

// Single worker for all ingestion jobs (text, file, etc.)
const ingestionWorker = new Worker(
  config.queueNames.doc,
  async (job) => {
    console.log(`[Worker] Processing job ${job.id}`);
    const { docId, text, source, sourceType } = job.data as {
      docId: string;
      text: string;
      source?: string;
      sourceType?: string;
    };

    // Chunk the text
    const chunks = chunkText(docId, text);
    console.log(`[Worker] Chunked doc ${docId} into ${chunks.length} chunks.`);
    
    // Embed and upsert each chunk
    for (const chunk of chunks) {
      const [embedding] = await embedder.embed([chunk.text]);
      const chunkWithMeta: Chunk = {
        ...chunk,
        embedding,
        metadata: { source, sourceType },
      };
      await store.upsert([chunkWithMeta]);
      logDebug('[DEBUG] Embedded chunk', { chunkWithMeta });
      logInfo('[Worker]: Embedded and upserted chunk', { chunkId: chunk.id, docId, source, sourceType });
    }

    return { docId, chunkCount: chunks.length };
  },
  { connection, concurrency: config.concurrency },
);

ingestionWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

ingestionWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
