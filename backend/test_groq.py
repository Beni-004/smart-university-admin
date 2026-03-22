import sys
import os
sys.path.insert(0, os.path.abspath(".."))
from fastapi.testclient import TestClient
from backend.main import app
import time
import sys

client = TestClient(app)

def test_groq():
    print("Sending request to /api/query...")
    start = time.time()
    response = client.post("/api/query", json={"question": "how many students per department?"})
    elapsed = time.time() - start
    
    print(f"Status: {response.status_code}")
    print(f"Time: {elapsed:.2f}s")
    
    if response.status_code != 200:
        print("Error:", response.text)
        sys.exit(1)
        
    data = response.json()
    print("SQL:", data.get("sql"))
    print("Results length:", len(data.get("results", {}).get("rows", [])) if isinstance(data.get("results"), dict) else data.get("results"))
    print("Cached:", data.get("cached"))
    
    # Assertions
    assert elapsed < 5.0, "Execution took more than 5 seconds"
    assert data.get("cached") is False, "Result was cached"
    assert data.get("sql"), "No SQL returned"
    
    print("✅ T10 Groq happy path passed.")

if __name__ == "__main__":
    # Remove cache interference
    from backend.cache import cache
    cache.clear()
    test_groq()
