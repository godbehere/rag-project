
# RAG Project

A Retrieval-Augmented Generation (RAG) backend for document ingestion, semantic search, and LLM-powered question answering.

## Features
- Ingest and chunk documents (PDF, DOCX, TXT, web pages)
- Store and search embeddings using Qdrant
- Queue-based processing with BullMQ and Redis
- REST API for ingestion and retrieval
- Local development and Docker Compose support

## Requirements
- Node.js 20+
- npm
- Redis & Qdrant instances (docker option will handle this)
- Docker (optional, for containerized setup)
- OpenAI API key (for embedding and generation)

## Quick Start (Local)
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Create `.env` and set your variables, especially `OPENAI_API_KEY`.
3. **Start Qdrant and Redis (if not using Docker):**
   - Qdrant: https://qdrant.tech/documentation/
   - Redis: https://redis.io/docs/getting-started/
4. **Run the API server:**
   ```bash
   npm run dev
   ```
5. **Run the worker (in a separate terminal):**
   ```bash
   npm run worker
   ```

## Quick Start (Docker Compose)
1. **Copy `.env.example` to `.env` and set your variables.**
2. **Start all services:**
   ```bash
   docker compose up --build
   ```
   - The API will be available at `http://localhost:3000`

## Environment Variables
- `OPENAI_API_KEY` (required): Your OpenAI API key for embeddings and completions.
- `REDIS_URL`: Redis connection string (default: `redis://localhost:6379` or `redis://redis:6379` in Docker).
- `QDRANT_URL`: Qdrant connection string (default: `http://localhost:6333` or `http://qdrant:6333` in Docker).
- `USE_MOCK_EMBEDDINGS`: Set to `true` to use random/mock embeddings for local development or CI. Set to `false` (default) to use real OpenAI embeddings. When using real embeddings, you must provide a valid `OPENAI_API_KEY`.

## API Usage
- Ingest documents via `/api/ingest` (see code for details)
- Query with `/api/query`

## CLI Usage

After installing via npm you can run the following commands:

- Start the API server:
   ```bash
   rag-cli start:server
   ```
- Start the worker:
   ```bash
   rag-cli start:worker
   ```
- Start all services with Docker Compose:
   ```bash
   rag-cli up
   ```
- Ingest plain text:
   ```bash
   rag-cli ingest:text --text "Your text here"
   # or via stdin
   rag-cli ingest:text
   ```
- Ingest files:
   ```bash
   rag-cli ingest:file --file path/to/file1 --file path/to/file2
   ```
- Ingest URLs:
   ```bash
   rag-cli ingest:url --url https://example.com --url https://another.com
   ```
- Query the vector store:
   ```bash
   rag-cli query --query "What is RAG?"
   # or interactively
   rag-cli query
   ```
- Clear the vector store:
   ```bash
   rag-cli clear-vectorstore
   ```
- Run interactive config setup:
   ```bash
   rag-cli init
   ```

If you would like to use the cli during development start by building the project (`npm run build`), then you can use the CLI but you must add `npx` before the command (`npx rag-cli up`)

## Contributing
- Fork, branch, and submit PRs.
- Use issues for bugs and feature requests.

## License
MIT
