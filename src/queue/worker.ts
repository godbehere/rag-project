import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { chunkText } from '../ingestion/chunker';
import { store, embedder } from '../config/vector';
import { Chunk } from '../types';
import { config } from '../config';

const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

const ingestionQueue = new Queue(config.queueNames.ingestion, { connection });

// Worker to chunk documents and enqueue chunks
const docWorker = new Worker(
  config.queueNames.doc,
  async (job) => {
    console.log(`Chunking doc job ${job.id}`);

    const { docId, text, title, sourceType } = job.data as {
      docId: string;
      text: string;
      title?: string;
      sourceType?: string;
    };

    const chunks = chunkText(docId, text);

    for (const chunk of chunks) {
      await ingestionQueue.add(config.queueNames.chunk, {
        ...chunk,
        title,
        sourceType,
      });
    }

    return { docId, chunkCount: chunks.length };
  },
  { connection, concurrency: config.concurrency },
);

console.log('Worker process started, waiting for jobs...');

docWorker.on('completed', (job) => {
  console.log(`Doc job ${job.id} completed`);
});

docWorker.on('failed', (job, err) => {
  console.error(`Doc job ${job?.id} failed:`, err);
});

// Worker to embed chunks and upsert to vector store
const chunkWorker = new Worker(
  config.queueNames.chunk,
  async (job) => {
    console.log(`Embedding chunk job ${job.id}`);

    const chunk = job.data as Chunk;

    const [embedding] = await embedder.embed([chunk.text]);

    chunk.embedding = embedding;
    await store.upsert([chunk]);

    return { chunkId: chunk.id, docId: chunk.docId };
  },
  { connection, concurrency: config.concurrency },
);

chunkWorker.on('completed', (job) => {
  console.log(`Chunk job ${job.id} completed`);
});

chunkWorker.on('failed', (job, err) => {
  console.error(`Chunk job ${job?.id} failed:`, err);
});
