# Smart University Administrator

A full‑stack **Smart University Admin** system that lets you ask questions about a university database in plain English, then:

1) Uses **Groq API or Ollama (SQLCoder)** to generate a **PostgreSQL `SELECT` query**
2) Validates the SQL for safety (blocks destructive queries / injection patterns)
3) Executes the query on **PostgreSQL**
4) Displays the generated SQL + results in a simple **web UI**
5) Caches repeated questions for faster responses

---

## Features

- **Natural language → SQL** using Groq API or Ollama (`sqlcoder` model)
- **Flexible LLM configuration**: Works with Groq API, Ollama, or both
- **Smart routing**: Groq primary with Ollama fallback (if both configured)
- **Safe querying only**: validator restricts to `SELECT` and blocks dangerous keywords/patterns
- **Schema-aware prompting** (loads DB schema and selects relevant tables)
- **FastAPI backend** with clean API endpoints
- **Modern React frontend** with TypeScript, Vite, and Tailwind CSS to chat, view SQL, and render results table
- **Query caching** (LRU-style) for repeated questions
- **Fake data generator** for quick demos

---

## Tech Stack

**Backend**
- Python 3.10+
- FastAPI
- Uvicorn
- PostgreSQL (psycopg2)
- python-dotenv
- Requests

**LLM / SQL Generation**
- Groq API (cloud-based, fast)
- Ollama (local inference)
- Model: `sqlcoder` (example: `sqlcoder:15b` or `sqlcoder:7b`)
- At least one LLM service required

**Frontend**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Spline 3D integration
- Motion (animations)

---

## Repository Structure

- `backend/` — FastAPI app + DB access + schema optimizer + SQL validation + LLM routing
- `frontend/` — Modern React frontend with TypeScript, Vite, and Tailwind CSS
- `database/` — SQL schema + fake data generator
- `ollama/` — prompt/system instructions for SQL generation
- `INSTALLATION.md` — detailed installation guide for Windows and Linux

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **At least ONE of the following LLM services:**
  - **Groq API** (cloud-based, fast, requires API key from [console.groq.com](https://console.groq.com))
  - **Ollama** (local, private, requires installation + model download)
  - Both (recommended for best reliability)

---

## Quick Start

### 1) Clone the repo
```bash
git clone https://github.com/perfectking321/smart-university-admin.git
cd smart-university-admin
```

### 2) Set up PostgreSQL database
Create a database (example name: `university_db`) and apply the schema:

```bash
# inside psql:
CREATE DATABASE university_db;
\c university_db
\i /path/to/your/repo/database/schema.sql
```

### 3) (Optional) Generate fake data
```bash
cd database
# Edit DATABASE_URL inside generate_fake_data.py to match your password/host
python generate_fake_data.py
```

### 3) Choose your LLM service (at least one required)

**Option A: Use Groq API (Fast, Cloud-based)**
- Get a free API key from [console.groq.com](https://console.groq.com)
- No local installation needed
- Fast responses

**Option B: Use Ollama (Local, Private)**
```bash
# Install Ollama first, then pull the model:
ollama pull sqlcoder:15b
# or a smaller one if needed:
# ollama pull sqlcoder:7b
```

**Option C: Use Both (Recommended)**
- Set up both Groq API and Ollama
- System will use Groq as primary, Ollama as fallback

### 4) Configure backend environment
Create `backend/.env`:

**If using Groq API only:**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
GROQ_API_KEY=gsk_your_api_key_here
```

**If using Ollama only:**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=sqlcoder:15b
```

**If using both (recommended):**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/university_db
GROQ_API_KEY=gsk_your_api_key_here
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=sqlcoder:15b
```

### 5) Install backend dependencies + run API
```bash
cd backend
python -m venv venv

# Activate:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

Backend should be available at:
- `http://localhost:8000`

Health check:
- `http://localhost:8000/api/health`

### 6) Set up and run the frontend
Create `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Install dependencies and start the development server:
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:
- `http://localhost:3000`

---

## How It Works (High Level)

1. Frontend sends `{ question }` to `POST /api/query`
2. Backend loads relevant schema info for the question
3. **Groq API** or **Ollama** generates SQL from prompt + schema
4. SQL is validated (only safe `SELECT` allowed)
5. SQL executes on PostgreSQL
6. Response returns:
   - generated SQL
   - rows/columns
   - execution time
   - whether cached

---

## API Endpoints

- `POST /api/query`  
  Body:
  ```json
  { "question": "What is the average GPA by department?" }
  ```

- `GET /api/health` — service status
- `GET /api/tables` — list tables detected from schema
- `GET /api/cache/stats` — cache size info
- `DELETE /api/cache/clear` — clears cache

---

## Example Questions

- “Show all students in Computer Science department”
- “What is the average GPA by department?”
- “List students with attendance below 75%”
- “Show placement statistics for each department”
- “Top 10 students by GPA with their department names”

---

## Security Notes

- This project is designed for **read-only analytics**.
- The SQL validator blocks destructive statements (e.g., `DROP`, `DELETE`, `UPDATE`, etc.) and common injection patterns.
- If you want production readiness, add:
  - authentication/authorization
  - request rate limiting
  - strict CORS config (don’t use `*`)
  - structured logging + monitoring
  - safer DB credentials handling / secrets manager

---

## Troubleshooting

### “Neither Groq API nor Ollama is available”
You need at least one LLM service:
- Add `GROQ_API_KEY` to `backend/.env` and get API key from [console.groq.com](https://console.groq.com)
- OR install Ollama and pull the SQLCoder model

### Backend says “Ollama not available”
If you're using Ollama, make sure it's running:
```bash
ollama serve
ollama list
```

### Groq API errors
If you're using Groq API:
- Verify your `GROQ_API_KEY` is correct in `backend/.env`
- Check your API key status at [console.groq.com](https://console.groq.com)
- If you hit rate limits, system will automatically use Ollama (if configured)

### Database connection fails
Check:
- PostgreSQL is running
- `DATABASE_URL` is correct in `backend/.env`
- schema was applied to the target database

### Frontend can’t reach backend
- Confirm backend is running on `http://localhost:8000`
- Try:
```bash
curl http://localhost:8000/api/health
```

---

## License

No license file is currently detected in the repository. Add a `LICENSE` file if you want to declare usage terms.

---

## Acknowledgements

- Groq for fast cloud-based LLM inference
- Ollama for local model serving
- SQLCoder model for text-to-SQL generation
