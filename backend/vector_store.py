import os
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

class VectorStore:
    def __init__(self):
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(base_dir, "../chroma_db/")
            
            self.client = chromadb.PersistentClient(path=os.path.abspath(db_path))
            self.embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
            
            self.question_sql = self.client.get_or_create_collection(
                name="question_sql", embedding_function=self.embedding_fn
            )
            self.ddl = self.client.get_or_create_collection(
                name="ddl", embedding_function=self.embedding_fn
            )
            self.documentation = self.client.get_or_create_collection(
                name="documentation", embedding_function=self.embedding_fn
            )
            print("✅ VectorStore initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize VectorStore: {e}")
            raise e
        
    def reset_collection(self, name: str):
        try:
            self.client.delete_collection(name)
            print(f"✅ Deleted collection: {name}")
        except Exception:
            pass
            
        if name == "question_sql":
            self.question_sql = self.client.get_or_create_collection(name=name, embedding_function=self.embedding_fn)
        elif name == "ddl":
            self.ddl = self.client.get_or_create_collection(name=name, embedding_function=self.embedding_fn)
        elif name == "documentation":
            self.documentation = self.client.get_or_create_collection(name=name, embedding_function=self.embedding_fn)
        print(f"✅ Recreated collection: {name}")

    def add_question_sql(self, q: str, sql: str):
        self.question_sql.add(
            documents=[q],
            metadatas=[{"sql": sql}],
            ids=[str(abs(hash(q)))]
        )
        print(f"✅ Added Q->SQL: {q[:30]}...")

    def add_ddl(self, table: str, ddl: str):
        self.ddl.add(
            documents=[ddl],
            metadatas=[{"table": table}],
            ids=[table]
        )
        print(f"✅ Added DDL for table: {table}")

    def add_doc(self, text: str):
        self.documentation.add(
            documents=[text],
            metadatas=[{"type": "rule"}],
            ids=[str(abs(hash(text)))]
        )
        print(f"✅ Added Doc: {text[:30]}...")

    def get_similar_questions(self, q: str, n=3):
        return self.question_sql.query(query_texts=[q], n_results=n)

    def get_related_ddl(self, q: str, n=3):
        return self.ddl.query(query_texts=[q], n_results=n)

    def get_related_docs(self, q: str, n=2):
        return self.documentation.query(query_texts=[q], n_results=n)
