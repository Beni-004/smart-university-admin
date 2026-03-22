from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import time

from database import db
from cache import cache
from schema_optimizer import optimizer
from sql_validator import validator
from ollama_client import ollama_client
from llm_router import llm_router
from demo_router import router as demo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    print("🚀 Starting Smart University Admin API...")
    
    # Test database connection
    try:
        db.connect()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise
    
    # Test Ollama connection
    if not ollama_client.test_connection():
        print("❌ Ollama is not running. Start Ollama first!")
        raise Exception("Ollama not available")
    else:
        print("✅ Ollama connected successfully")
        ollama_client.start_keepalive()
    
    # Load database schema
    optimizer.load_schema()
    print("✅ Database schema loaded")
    
    print("✅ API ready at http://localhost:8000")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Smart University Admin API...")

# Initialize FastAPI app with lifespan
app = FastAPI(title="Smart University Admin API", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo_router, prefix="/api")

# Request model
class QueryRequest(BaseModel):
    question: str

# Response model
class QueryResponse(BaseModel):
    sql: str
    results: dict
    cached: bool
    execution_time: float

@app.post("/api/query", response_model=QueryResponse)
async def query_database(request: QueryRequest):
    """Main endpoint: Convert natural language to SQL and execute"""
    start_time = time.time()
    
    try:
        question = request.question.strip()
        
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        # Check cache
        cached_result = cache.get(question)
        if cached_result:
            cached_result["execution_time"] = time.time() - start_time
            return cached_result
        
        # Generate SQL using llm_router
        sql = llm_router.generate_sql(question)
        
        # Validate SQL
        is_safe, message = validator.is_safe_query(sql)
        if not is_safe:
            raise HTTPException(status_code=400, detail=f"Unsafe query: {message}")
        
        # Execute SQL
        results = db.execute_query(sql)
        
        # Prepare response
        response = {
            "sql": sql,
            "results": results,
            "cached": False,
            "execution_time": time.time() - start_time
        }
        
        # Cache the result
        cache.set(question, sql, results)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cache/stats")
async def cache_stats():
    """Get cache statistics"""
    return {
        "cache_size": cache.size(),
        "max_size": cache.max_size
    }

@app.delete("/api/cache/clear")
async def clear_cache():
    """Clear all cached queries"""
    cache.clear()
    return {"message": "Cache cleared successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected" if db.connection else "disconnected",
        "ollama": "connected" if ollama_client.test_connection() else "disconnected"
    }

@app.get("/api/tables")
async def get_tables():
    """Get list of all database tables"""
    optimizer.load_schema()
    return {
        "tables": list(optimizer.full_schema.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
