import sqlite3
import os
from config import config

class Database:
    def __init__(self):
        self.db_path = config.DATABASE_URL  # e.g. "university.db"
        self.connection = None  # Used by health check; set True after connect()

    def connect(self):
        """Test database connection"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.close()
            self.connection = True
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise

    def _get_connection(self):
        """Return a new SQLite connection with row factory"""
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def execute_query(self, sql):
        """Execute SQL query and return JSON-serialisable results"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(sql)

            if cursor.description:
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                return {
                    "columns": columns,
                    "rows": [dict(row) for row in rows],
                    "row_count": len(rows)
                }
            else:
                conn.commit()
                return {"message": "Query executed successfully"}

        except Exception as e:
            conn.rollback()
            print(f"❌ Query execution failed: {e}")
            raise
        finally:
            cursor.close()
            conn.close()

    def get_schema(self):
        """Get database schema for all tables (SQLite version)"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            )
            tables = [row[0] for row in cursor.fetchall()]

            result_rows = []
            for table_name in tables:
                cursor.execute(f"PRAGMA table_info({table_name})")
                col_rows = cursor.fetchall()
                # col_rows columns: (cid, name, type, notnull, dflt_value, pk)
                columns = [f"{col[1]} {col[2].lower()}" for col in col_rows]
                result_rows.append({"table_name": table_name, "columns": columns})

            return {
                "columns": ["table_name", "columns"],
                "rows": result_rows,
                "row_count": len(result_rows)
            }
        finally:
            conn.close()

    def close(self):
        """Nothing persistent to close"""
        self.connection = None
        print("Database connection closed")

# Global database instance
db = Database()
