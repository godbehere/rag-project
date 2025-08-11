# Project TODO List

## Completed
- PDF, DOC/DOCX, TXT parsers implemented
- Website parser implemented (static HTML)
- Basic ingestion pipeline (chunking, embedding, vector store)
- Persistent vector store integration (Qdrant)

## Backlog
- PPTX parser (deferred)
- Vector Store Multi-Tenancy/Session Management
  - Add support for per-user and per-session vector isolation (payload filtering or per-collection)
  - Require userId/sessionId in API and filter upserts/searches accordingly
  - Add cleanup/expiration logic for old sessions (optional)

- Retrieval API (query endpoint)
- MVP focus: get ingestion, embedding, retrieval working end-to-end
- Config + Env Management (centralize config, validate env vars)
- Vector Store Multi-Tenancy/Session Management
  - Add support for per-user and per-session vector isolation (payload filtering or per-collection)
  - Require userId/sessionId in API and filter upserts/searches accordingly
  - Add cleanup/expiration logic for old sessions (optional)
- Vector Store Admin Endpoints
  - Add authentication/protection to /api/vectorstore/clear and other admin endpoints
## Pending
- Ingestion Controller Enhancements
  - Support file uploads with multer (improve error handling, cleanup)
  - Support ingesting multiple URLs robustly
- Retrieval API
  - Add authentication/rate limiting (optional)
- Tests
  - End-to-end tests for ingestion and retrieval
- Logging & Error Handling
  - Add structured logging (winston/pino)
  - Improve error handling throughout pipeline
- Prompt Engineering
- LLM Provider Extensibility
- Rate Limiting & User API Keys
- Citations
- Manual End-to-End Testing
  - Ingest a document or website and query for relevant content
- Worker Module Improvements
  - Consider splitting workers for different job types (e.g., file vs. text, chunking vs. embedding) for scaling and specialization
  - Add more robust error handling, logging, and monitoring to worker module
  - Support for job retries and dead-letter queues
