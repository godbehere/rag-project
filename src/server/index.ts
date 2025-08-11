import express from 'express';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import ingestionRoutes from './routes/ingestionRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export const ingestionQueue = new Queue('ingestion', { connection });

app.use(express.json());
app.use('/api', ingestionRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});