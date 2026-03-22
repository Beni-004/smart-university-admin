"""Ollama local LLM HTTP client with keepalive."""
import requests
import json
import time
import threading
from config import config
from utils import clean_sql

class OllamaClient:
    def __init__(self):
        self.api_url = f"{config.OLLAMA_HOST}/api/generate"
        self.model = config.OLLAMA_MODEL
    
    def generate_sql(self, prompt: str) -> str:
        """Generate SQL from natural language question using a pre-built prompt"""


        try:
            # Call Ollama API
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for deterministic output
                        "top_p": 0.9
                    }
                },
                timeout=config.QUERY_TIMEOUT
            )

            response.raise_for_status()
            result = response.json()

            # Extract SQL from response
            sql = result.get("response", "").strip()

            # Clean up the SQL
            sql = clean_sql(sql)

            return sql

        except requests.exceptions.Timeout:
            raise Exception("Ollama request timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {str(e)}")

    def start_keepalive(self) -> None:
        """Start a background daemon thread to keep Ollama model loaded"""
        def _keepalive_loop():
            while True:
                try:
                    requests.post(
                        self.api_url,
                        json={
                            "model": self.model,
                            "prompt": "",
                            "stream": False
                        },
                        timeout=5
                    )
                except Exception as e:
                    print(f"⚠️ Keepalive failed: {e}")
                time.sleep(240)
        
        thread = threading.Thread(target=_keepalive_loop, daemon=True)
        thread.start()

    def test_connection(self) -> bool:
        """Test if Ollama is running"""
        try:
            response = requests.get(f"{config.OLLAMA_HOST}/api/tags")
            return response.status_code == 200
        except Exception:
            return False

# Global Ollama client
ollama_client = OllamaClient()
