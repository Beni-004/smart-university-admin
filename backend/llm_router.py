"""LLM routing: Groq primary, Ollama fallback."""
from groq import Groq
import groq
from rag_context import RAGContext
from ollama_client import ollama_client
from config import config
from utils import clean_sql

class LLMRouter:
    def __init__(self):
        self.rag = RAGContext()
        self.groq_client = Groq(api_key=config.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"
        
    def generate_sql(self, question: str) -> str:
        prompt = self.rag.build_prompt(question)

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
            print("✅ Groq generated SQL successfully.")
            return sql

        except groq.RateLimitError as e:
            print(f"⚠️ Groq RateLimitError, routing to Ollama: {e}")
            return ollama_client.generate_sql(prompt)
        except groq.APIConnectionError as e:
            print(f"⚠️ Groq APIConnectionError, routing to Ollama: {e}")
            return ollama_client.generate_sql(prompt)
        except Exception as e:
            print(f"⚠️ Groq exception, routing to Ollama: {e}")
            return ollama_client.generate_sql(prompt)

llm_router = LLMRouter()
