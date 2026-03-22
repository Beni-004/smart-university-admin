from vector_store import VectorStore

class RAGContext:
    def __init__(self):
        try:
            self.vector_store = VectorStore()
            print("✅ RAGContext initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize RAGContext: {e}")
            raise e

    def build_prompt(self, question: str) -> str:
        try:
            similar_q = self.vector_store.get_similar_questions(question, n=3)
            related_ddl = self.vector_store.get_related_ddl(question, n=3)
            related_docs = self.vector_store.get_related_docs(question, n=2)
            
            system_instruction = (
                "You are an AI assistant that converts natural language into SQL for the Smart University system.\n"
                "Output ONLY the SQL query. Do not include markdown formatting or explanations."
            )
            
            ddl_context = "### Database Schema\n"
            if related_ddl and "documents" in related_ddl and related_ddl["documents"]:
                for ddl in related_ddl["documents"][0]:
                    ddl_context += f"{ddl}\n\n"
                    
            examples_context = "### Example Queries\n"
            if similar_q and "documents" in similar_q and similar_q["documents"] and "metadatas" in similar_q:
                # Chromadb returns dicts of lists of lists.
                docs = similar_q["documents"][0]
                metas = similar_q["metadatas"][0]
                for i in range(len(docs)):
                    sql = metas[i].get("sql", "")
                    examples_context += f"Q: {docs[i]}\nA: {sql}\n\n"
                    
            rules_context = "### Business Rules\n"
            if related_docs and "documents" in related_docs and related_docs["documents"]:
                for doc in related_docs["documents"][0]:
                    rules_context += f"- {doc}\n"
                    
            prompt = f"{system_instruction}\n\n{ddl_context}\n{examples_context}\n{rules_context}\nQuestion: {question}\nSQL:"
            print(f"✅ RAG Context built successfully for question: {question[:30]}...")
            return prompt
        except Exception as e:
            print(f"❌ Failed to build RAG context: {e}")
            raise e
