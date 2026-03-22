# task.md

## M1 — Foundation

| ID | Title | Description | Tag | Depends On | Status | Note |
|----|-------|-------------|-----|------------|--------|------|
| T01 | Install dependencies | Add chromadb, sentence-transformers, groq to requirements.txt and pip install | [backend] [devops] | — | ✅ | Installed via venv |
| T02 | Add GROQ_API_KEY to config | Add GROQ_API_KEY field to config.py reading from .env. Add placeholder to .env.example | [backend] | — | ✅ | Added keys to config.py and .env |
| T03 | Create vector_store.py | ChromaDB wrapper. Init persistent client at ../chroma_db/. Three collections: question_sql, ddl, documentation. Methods: add_question_sql(q,sql), add_ddl(table,ddl), add_doc(text), get_similar_questions(q,n=3), get_related_ddl(q,n=3), get_related_docs(q,n=2), reset_collection(name) | [backend] | T01 | ✅ | Verified existing vector_store.py is complete |
| T04 | Create training_data.py | Seed script. Clears all 3 collections then inserts: (a) 8 table DDLs from schema.sql hardcoded as strings, (b) 15 Q→SQL pairs from review2_queries.sql, (c) 3 business rule docs. Print confirmation per insert. Idempotent. | [backend] | T03 | ✅ | Verified existing training_data.py is complete |
| T05 | Run training_data.py and verify | Execute python training_data.py. Query each collection and confirm row counts: ddl=8, question_sql=15, documentation=3 | [backend] | T04 | ✅ | Ran script, confirmed ddl=8, question_sql=15, doc=3 |

## M2 — Core Features

| ID | Title | Description | Tag | Depends On | Status | Note |
|----|-------|-------------|-----|------------|--------|------|
| T06 | Create rag_context.py | RAGContext class. Method build_prompt(question) → str. Calls vector_store for similar questions, related DDL, related docs. Assembles prompt in this order: system instruction → DDL context → example Q→SQL pairs → business rules → "Question: {question}\nSQL:" | [backend] | T03 | ✅ | Created RAGContext class |
| T07 | Create llm_router.py | LLMRouter class. Method generate_sql(question) → str. Calls rag_context.build_prompt(question), then tries groq_client.chat.completions.create() with model=llama-3.3-70b-versatile. On RateLimitError / APIConnectionError / any Exception: logs warning and calls ollama_client.generate_sql(prompt) as fallback. Returns extracted SQL string. | [backend] | T02 T06 | ✅ | Created LLMRouter class |
| T08 | Add Ollama keepalive | In ollama_client.py add start_keepalive() function. Starts a daemon thread that POSTs to http://localhost:11434/api/generate with model name and empty prompt every 240 seconds. Call start_keepalive() in lifespan startup in main.py after Ollama connection test. | [backend] | — | ✅ | Implemented thread and lifespan call |
| T09 | Swap LLM in main.py | In main.py /api/query endpoint: replace ollama_client.generate_sql() and schema_optimizer.get_relevant_tables() calls with llm_router.generate_sql(question). Import llm_router at top. Do NOT touch any other endpoint or file. | [backend] | T07 T08 | ✅ | Swapped LLM to llm_router in main.py |

## M3 — Polish + Testing

| ID | Title | Description | Tag | Depends On | Status | Note |
|----|-------|-------------|-----|------------|--------|------|
| T10 | Test Groq happy path | POST /api/query with "how many students per department?" — confirm SQL returned in under 5s, results non-empty, cached=false | [test] | T09 | 🔲 | |
| T11 | Test Ollama fallback | Temporarily set GROQ_API_KEY=invalid in .env, restart server, POST /api/query — confirm fallback log appears and Ollama returns result | [test] | T09 | 🔲 | |
| T12 | Test keepalive | After 5 min idle, POST /api/query — confirm response under 10s (no cold start) | [test] | T08 | 🔲 | |
| T13 | Test Demo tab unaffected | Click all 10 categories in DBMS Demo tab — confirm all return results, no errors | [test] | T09 | 🔲 | |
| T14 | Restore valid GROQ_API_KEY | After T11 testing, restore real key in .env, restart, verify Groq is primary again | [devops] | T11 | 🔲 | |