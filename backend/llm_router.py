"""LLM routing: Smart routing between Groq and Ollama based on availability."""
from groq import Groq
import groq
from rag_context import RAGContext
from ollama_client import ollama_client
from config import config
from utils import clean_sql

class LLMRouter:
    def __init__(self):
        self.rag = RAGContext()
        self.groq_client = None
        self.groq_available = False
        self.ollama_available = False
        self.model = "llama-3.3-70b-versatile"

        # Check if Groq API key is available
        if config.GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=config.GROQ_API_KEY)
                self.groq_available = True
                print("✅ Groq client initialized successfully")
            except Exception as e:
                print(f"⚠️ Failed to initialize Groq client: {e}")
                self.groq_available = False
        else:
            print("ℹ️ No GROQ_API_KEY found - Groq disabled")

        # Check if Ollama is available
        self.ollama_available = ollama_client.test_connection()
        if self.ollama_available:
            print("✅ Ollama is available")
        else:
            print("ℹ️ Ollama not available")

        # Validate at least one service is available
        if not self.groq_available and not self.ollama_available:
            raise Exception("❌ Neither Groq API nor Ollama is available. Please configure at least one service.")

    def generate_sql(self, question: str) -> str:
        prompt = self.rag.build_prompt(question)

        # Strategy 1: Try Groq first if available
        if self.groq_available:
            try:
                response = self.groq_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                sql = response.choices[0].message.content.strip()
                sql = clean_sql(sql)
                print("✅ Groq generated SQL successfully")
                return sql

            except (groq.RateLimitError, groq.APIConnectionError) as e:
                print(f"⚠️ Groq error ({type(e).__name__}), trying Ollama fallback...")
                if self.ollama_available:
                    return ollama_client.generate_sql(prompt)
                else:
                    raise Exception(f"Groq failed and Ollama not available: {str(e)}")
            except Exception as e:
                print(f"⚠️ Groq exception ({str(e)}), trying Ollama fallback...")
                if self.ollama_available:
                    return ollama_client.generate_sql(prompt)
                else:
                    raise Exception(f"Groq failed and Ollama not available: {str(e)}")

        # Strategy 2: Use Ollama if Groq not available
        elif self.ollama_available:
            print("ℹ️ Using Ollama (Groq not configured)")
            return ollama_client.generate_sql(prompt)

        # Should never reach here due to __init__ validation
        else:
            raise Exception("No LLM service available")

llm_router = LLMRouter()
