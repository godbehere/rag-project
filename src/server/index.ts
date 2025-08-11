import express from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

import ingestionRoutes from './routes/ingestionRoutes';
import retrievalRoutes from './routes/retrievalRoutes';
import vectorstoreRoutes from './routes/vectorstoreRoutes';

import { config } from '../config';

const app = express();
const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
export const ingestionQueue = new Queue(config.queueNames.doc, { connection });


app.use(express.json());

app.use('/api', ingestionRoutes);
app.use('/api', retrievalRoutes);
app.use('/api/vectorstore', vectorstoreRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});