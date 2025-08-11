# Project TODO List

## Completed
- PDF, DOC/DOCX, TXT parsers implemented
- Website parser implemented (static HTML)
- Basic ingestion pipeline (chunking, embedding, vector store)

## Backlog
- PPTX parser (deferred)

## In Progress
- Retrieval API (query endpoint)
- Refactor to use shared vector store/embedder
- MVP focus: get ingestion, embedding, retrieval working end-to-end
- Config + Env Management (centralize config, validate env vars)

## Pending
- Ingestion Controller Enhancements
  - Support file uploads with multer (improve error handling, cleanup)
  - Support ingesting multiple URLs robustly
  - Detect input type (file or URL) and parse accordingly before enqueueing
- Retrieval API
  - Return top relevant chunks with metadata
  - Add authentication/rate limiting (optional)
- Tests
  - End-to-end tests for ingestion and retrieval
- Logging & Error Handling
  - Add structured logging (winston/pino)
  - Improve error handling throughout pipeline
- Manual End-to-End Testing
  - Ingest a document or website and query for relevant content
- Persistence
  - Replace in-memory vector store with persistent DB (optional)
