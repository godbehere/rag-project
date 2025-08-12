# API Examples

This document provides examples for manual end-to-end testing of the main API endpoints in this RAG project. Use these `curl` commands to interact with the backend for ingestion, retrieval, and administration.

---

## 1. Ingest Plain Text

**Endpoint:**  
`POST /api/ingest/text`  
**Content-Type:** `application/json`

**Request Example:**
```
curl -X POST http://localhost:3000/api/ingest/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a test document for ingestion.",
    "title": "Test Doc",
    "sourceType": "txt"
  }'
```

**Response Example:**
```json
{
  "status": "queued",
  "docId": "<generated-uuid>"
}
```

---

## 2. Ingest Files and/or URLs

**Endpoint:**  
`POST /api/ingest/files`  
**Content-Type:** `multipart/form-data`

- Field `files`: one or more files (PDF, DOCX, TXT)
- Field `urls`: JSON array of URLs as a string (e.g., '["https://example.com"]')

**File Upload Example:**
```
curl -X POST http://localhost:3000/api/ingest/files \
  -F "files=@/path/to/your/file.pdf"
```

**URL Ingestion Example:**
```
curl -X POST http://localhost:3000/api/ingest/files \
  -H "Content-Type: application/json"
  -d '{"urls":[
        "https://en.wikipedia.org/wiki/Space_exploration",
        "https://en.wikipedia.org/wiki/Apollo_program"
      ]}'
```

**Response Example:**
```json
{
  "message": "Ingestion jobs queued",
  "count": 2,
  "errors": []
}
```

---

## 3. Query for Retrieval

**Endpoint:**  
`POST /api/query`  
**Content-Type:** `application/json`

**Request Example:**
```
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about space exploration on the Moon and Mars",
    "topK": 15,
    "generate": true
  }'
```

**Response Example (with generate=false):**
```json
{
  "results": [
    {
      "id": "chunk-uuid",
      "docId": "doc-uuid",
      "title": "Test Doc",
      "sourceType": "txt",
      "score": 0.92
    }
    // ...more results
  ]
}
```

**Response Example (with generate=true):**
```json
{
  "answer": "OpenAI is an AI research and deployment company...",
  "citations": [
    {
      "id": "chunk-uuid",
      "docId": "doc-uuid",
      "title": "Test Doc",
      "sourceType": "txt",
      "score": 0.92
    }
    // ...more results
  ]
}
```

---

## 4. Clear Vector Store (Admin)

**Endpoint:**  
`POST /api/vectorstore/clear`  
**Content-Type:** `application/json`

**Request Example:**
```
curl -X POST http://localhost:3000/api/vectorstore/clear
```

**Response Example:**
```json
{
  "status": "ok",
  "message": "Vector store cleared."
}
```

---

Refer to this document for quick manual testing of the API endpoints. For more details, see the README or source code.
