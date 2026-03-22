# Frontend Integration Guide

## Overview

The new React frontend (`frontend-v2/`) has been integrated with your FastAPI backend. This guide explains the integration architecture and how to run both in development and production.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  DEVELOPMENT MODE                    │
├─────────────────────────────────────────────────────┤
│  Frontend (Vite Dev Server)     Backend (FastAPI)  │
│  http://localhost:3000    ←→    http://localhost:8000│
│  - Hot reload                    - Auto reload      │
│  - API proxy via fetch           - CORS enabled     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  PRODUCTION MODE                     │
├─────────────────────────────────────────────────────┤
│           FastAPI (http://localhost:8000)           │
│  ┌──────────────────────────────────────────────┐  │
│  │  Static Files (React build)   /              │  │
│  │  API Endpoints                /api/*         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## What Changed

### Frontend (`frontend-v2/`)

1. **Removed Gemini API**: Replaced Google AI Studio's Gemini integration with direct FastAPI calls
2. **New API Service** (`src/services/apiService.ts`): Handles all backend communication
3. **DemoPanel Component** (`src/components/DemoPanel.tsx`): Fetches real demo data from `/api/demo/*`
4. **Environment Configuration**: Uses `VITE_API_BASE_URL` for flexible deployment
5. **Cleaned Dependencies**: Removed `@google/genai`, `express`, `dotenv`

### Backend (`backend/`)

1. **Static File Serving**: FastAPI now serves React build in production (auto-detects `frontend-v2/dist/`)
2. **CORS Enabled**: Allows cross-origin requests for development mode

## Running the Application

### Development Mode (Recommended)

Run frontend and backend separately for hot-reload:

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
# Backend runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend-v2
npm install  # First time only
npm run dev
# Frontend runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

### Production Mode

Build the React app and serve it from FastAPI:

```bash
# 1. Build frontend
cd frontend-v2
npm install  # First time only
npm run build

# 2. Start backend (will automatically serve frontend)
cd ../backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open `http://localhost:8000` in your browser (frontend and backend on same port).

## API Endpoints Used by Frontend

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/query` | POST | Submit natural language query |
| `/api/demo/categories` | GET | Fetch demo categories |
| `/api/demo/{category}` | GET | Fetch category queries & results |
| `/api/cache/stats` | GET | Get cache statistics |
| `/api/cache/clear` | DELETE | Clear query cache |

## Environment Variables

### Frontend (`frontend-v2/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (`.env` at project root)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/university
GROQ_API_KEY=gsk_...
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=sqlcoder:15b
```

## Troubleshooting

### CORS Issues in Development
- Make sure backend CORS is configured (already done in `main.py`)
- Check that `VITE_API_BASE_URL` in `.env.local` matches your backend URL

### API Connection Failures
- Ensure backend is running: `http://localhost:8000/api/health`
- Check browser console for error messages
- Verify `.env.local` has correct `VITE_API_BASE_URL`

### Production Build Not Found
- Run `npm run build` in `frontend-v2/` first
- Verify `frontend-v2/dist/` directory exists
- Restart FastAPI server to detect the build

## Next Steps

After verifying the integration works:
1. The old vanilla JS frontend in `frontend/` can be archived or removed
2. Configure production hosting (e.g., Docker, cloud deployment)
3. Consider adding authentication and rate limiting
