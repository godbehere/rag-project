import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string, fallback?: string): string {
	const value = process.env[name] ?? fallback;
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const config = {
	redisUrl: requireEnv('REDIS_URL', 'redis://localhost:6379'),
	qdrantUrl: requireEnv('QDRANT_URL', 'http://localhost:6333'),
	openaiApiKey: requireEnv('OPENAI_API_KEY'),
	generationModel: process.env.GENERATION_MODEL || 'gpt-3.5-turbo',
	embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
	queueNames: {
		ingestion: process.env.QUEUE_INGESTION || 'ingestion',
		doc: process.env.QUEUE_DOC || 'ingest-doc',
		chunk: process.env.QUEUE_CHUNK || 'ingest-chunk',
	},
	port: parseInt(process.env.PORT || '3000', 10),
	concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
	useMockEmbeddings: process.env.USE_MOCK_EMBEDDINGS === 'true',
};
