# agents.md

## Global Rules — Every Agent Must Follow

### Coding Rules
- Language: Python 3.10+
- Style: snake_case for all variables, functions, files
- Imports: stdlib → third-party → local, one blank line between groups
- Classes: one class per file, filename matches class name in snake_case
- Error handling: always catch specific exceptions first, broad Exception last
- Logging: use print() with emoji prefix (✅ ❌ ⚠️) — no logging module
- Never use async in new files unless explicitly required — all new files are sync
- Never modify: demo_router.py, demo_queries.py, database.py, cache.py, sql_validator.py
- Never touch frontend/ under any circumstances
- Never add new API routes — only modify the existing /api/query handler in main.py

### Folder Ownership
- Agent 1 owns: vector_store.py, training_data.py
- Agent 2 owns: rag_context.py, llm_router.py, ollama_client.py, main.py, config.py, requirements.txt, .env

### Verification Rules
- After creating any new .py file: import it in a test snippet and confirm no ImportError
- After T05: print collection counts to terminal as proof
- After T09: attach terminal output of a successful /api/query curl as proof
- After T11: attach terminal output showing fallback warning log as proof

### task.md Maintenance Rules (CRITICAL)
- Before starting: read task.md fully
- After completing each task: immediately update task.md
  - Change status 🔲 → ✅
  - Add one-line note in Note column
- If blocked: mark 🚫 and note the reason
- If in progress: mark 🔄
- Never mark ✅ without actually completing the task
- At end of session: update all in-progress tasks honestly
```

---
```
## Agent Deployment Plan

### 2A — How Many Agents
- Minimum: 1 (all tasks sequential)
- Maximum useful: 2 (T01-T05 and T06-T08 can overlap after T03)
- Recommended: 2 — Agent 1 builds the vector store and seeds data,
  Agent 2 builds the RAG context + LLM router in parallel after T03 done

### 2B — Agent Roster

---
Agent 1 — Vector Store Agent
- Mode: Fast
- Owns: vector_store.py, training_data.py
- Milestone: M1
- Tasks: T01, T03, T04, T05
- Depends on: nothing — starts immediately
---

---
Agent 2 — LLM Integration Agent
- Mode: Fast
- Owns: rag_context.py, llm_router.py, ollama_client.py, main.py, config.py, requirements.txt, .env
- Milestone: M2 + M3
- Tasks: T02, T06, T07, T08, T09, T10, T11, T12, T13, T14
- Depends on: Agent 1 completing T03 before starting T06
---

### 2D — Execution Order
START WITH:  Agent 1 — builds vector_store.py which Agent 2 depends on
SPAWN:       Agent 2 immediately for T02 (config) — independent of Agent 1
HOLD:        Agent 2 on T06 until Agent 1 completes T03 (vector_store.py exists)
THEN:        Agent 2 runs T06 → T07 → T08 → T09 in sequence
THEN:        Both agents run M3 tests independently

### 2E — Context Reset Instructions
When thread goes stale:
- Update all in-progress tasks in task.md (🔲 → 🔄 for incomplete, ✅ for done)
- Fresh thread prompt:
```
Read agents.md, spec.md, and task.md.
You are the [Vector Store / LLM Integration] agent.
You own [your files] ONLY.
Continue from where the last session left off.
Your incomplete tasks are marked 🔄 in task.md.
Start by confirming which tasks you are resuming.
```

### 2C — Copy-Paste Prompts

---
### 🤖 Agent 1 — Vector Store — Opening Prompt
```
Read agents.md, spec.md, and task.md before doing anything.

You are the Vector Store agent. You own vector_store.py and training_data.py ONLY.
Do not create, edit, or delete any other file.

Your tasks for this session:
- T01: Install chromadb, sentence-transformers, groq in requirements.txt
- T03: Create vector_store.py — ChromaDB wrapper with 3 collections
- T04: Create training_data.py — seed script with 8 DDLs, 15 Q→SQL pairs, 3 docs
- T05: Run training_data.py and verify collection counts in terminal

The project is Smart University Admin — a university NL→SQL system.
Schema has 8 tables: departments, hostels, students, courses, enrollments, attendance, grades, placements.
ChromaDB must persist to ../chroma_db/ relative to the backend/ folder.
Embedding model: sentence-transformers/all-MiniLM-L6-v2.

Start in Planning mode. Show your implementation plan as an artifact.
Wait for my approval before writing any code.

After each task: mark ✅ in task.md with a one-line note.
```
---

---
### 🤖 Agent 2 — LLM Integration — Opening Prompt
```
Read agents.md, spec.md, and task.md before doing anything.

You are the LLM Integration agent.
You own: rag_context.py, llm_router.py, ollama_client.py, main.py, config.py, requirements.txt, .env
Do not touch: demo_router.py, demo_queries.py, database.py, cache.py, sql_validator.py, frontend/

Your tasks for this session:
- T02: Add GROQ_API_KEY to config.py and .env.example
- T06: Create rag_context.py — builds focused RAG prompt from ChromaDB
- T07: Create llm_router.py — Groq primary, Ollama fallback on any error
- T08: Add keepalive ping to ollama_client.py
- T09: Swap /api/query in main.py to use llm_router instead of ollama_client
- T10-T14: Run all tests and verify

WAIT on T06 until vector_store.py exists (Agent 1 must complete T03 first).
Start T02 immediately — it has no dependency.

The Groq model is: llama-3.3-70b-versatile
Ollama fallback catches: RateLimitError, APIConnectionError, Exception (broad last)
Keepalive interval: 240 seconds, daemon thread

Start in Planning mode. Show your implementation plan as an artifact.
Wait for my approval before writing any code.

After each task: mark ✅ in task.md with a one-line note.
```
---