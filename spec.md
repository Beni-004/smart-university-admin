# spec.md

## Project Overview
Smart University Admin — upgrading the Chat tab's NL→SQL pipeline from a slow full-schema Ollama setup to a Vanna-style RAG architecture with Groq as primary LLM and Ollama as fallback.

## Problem Statement
Current `/api/query` endpoint dumps the full schema into every Ollama prompt — cold model load takes 30-50s, generation takes 10-15s. Fix: ChromaDB vector store pre-filters context to ~300 tokens before the LLM is called. Groq handles inference fast (1-3s). Ollama catches rate limit failures silently.

## What We Are NOT Changing
- demo_router.py, demo_queries.py — untouched
- database.py, cache.py, sql_validator.py — untouched
- frontend/ — untouched
- The Demo tab — already works perfectly

## Tech Stack
- ChromaDB (local vector store, persistent)
- sentence-transformers/all-MiniLM-L6-v2 (local embeddings, no API needed)
- Groq Python SDK (primary LLM — llama-3.3-70b-versatile)
- Ollama (fallback LLM — existing setup)
- FastAPI (existing — no changes to app structure)

## Folder Structure (changes only)
```
backend/
  vector_store.py      ← NEW: ChromaDB wrapper, 3 collections
  rag_context.py       ← NEW: retrieves context, builds prompt
  llm_router.py        ← NEW: Groq primary + Ollama fallback
  training_data.py     ← NEW: one-time seed script
  ollama_client.py     ← MODIFY: add keepalive ping
  main.py              ← MODIFY: swap ollama_client → llm_router
  config.py            ← MODIFY: add GROQ_API_KEY
  requirements.txt     ← MODIFY: add chromadb, sentence-transformers, groq
.env                   ← MODIFY: add GROQ_API_KEY=your_key
chroma_db/             ← NEW: auto-created by ChromaDB at runtime
```

## ChromaDB Collections
| Collection | Content | Embedded Field |
|---|---|---|
| `question_sql` | {question, sql} pairs | question text |
| `ddl` | per-table CREATE TABLE statements | full DDL text |
| `documentation` | business rules as plain text | rule text |

## RAG Context Build (rag_context.py)
1. Query `question_sql` → top 3 similar Q→SQL pairs
2. Query `ddl` → top 3 relevant table DDLs
3. Query `documentation` → top 2 relevant rules
4. Assemble prompt: system + examples + ddl + question
5. Return prompt string (target: under 400 tokens)

## LLM Router Logic (llm_router.py)
```
try:
    response = groq_client.chat(prompt)
    return response
except (RateLimitError, APIError, Timeout):
    log "Groq failed, routing to Ollama"
    return ollama_client.generate_sql(prompt)
```

## Training Data to Seed (training_data.py)
- DDL: all 8 tables from schema.sql
- Q→SQL: ~15 pairs sourced from review2_queries.sql
- Docs: GPA categories, attendance threshold (75%), placement package unit (LPA)
- Run once: `python training_data.py` — idempotent (clears + reseeds)

## Ollama Keepalive
- Background thread in ollama_client.py
- Pings `POST /api/generate` with empty prompt every 4 minutes
- Keeps model loaded in RAM, eliminates cold start

## API Contract (unchanged)
POST /api/query
  in:  { question: str }
  out: { sql, results, cached, execution_time }

## Definition of Done
- [ ] `python training_data.py` seeds ChromaDB with no errors
- [ ] POST /api/query returns SQL in under 5s via Groq
- [ ] If GROQ_API_KEY is invalid/rate-limited, falls back to Ollama silently
- [ ] Ollama stays warm — no 30s cold start after idle
- [ ] Demo tab unaffected
- [ ] All existing endpoints still pass