"""PostgreSQL connection pool wrapper."""
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from config import config


class Database:
    def __init__(self):
        self.pool = None

    def connect(self) -> None:
        """Establish database connection pool"""
        try:
            self.pool = pool.ThreadedConnectionPool(
                config.DB_POOL_MIN,
                config.DB_POOL_MAX,
                config.DATABASE_URL,
                cursor_factory=RealDictCursor
            )
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise

    def execute_query(self, sql: str) -> dict:
        """Execute SQL query and return results"""
        if not self.pool:
            self.connect()

        conn = None
        cursor = None
        try:
            conn = self.pool.getconn()
            cursor = conn.cursor()
            cursor.execute(sql)

            # Check if query returns data
            if cursor.description:
                results = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                return {
                    "columns": columns,
                    "rows": results,
                    "row_count": len(results)
                }
            else:
                conn.commit()
                return {"message": "Query executed successfully"}

        except Exception as e:
            if conn:
                conn.rollback()
            print(f"❌ Query execution failed: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                self.pool.putconn(conn)

    def get_schema(self) -> dict:
        """Get database schema for all tables"""
        query = """
        SELECT
            t.table_name,
            array_agg(c.column_name || ' ' || c.data_type) as columns
        FROM information_schema.tables t
        JOIN information_schema.columns c
            ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        GROUP BY t.table_name
        ORDER BY t.table_name;
        """
        return self.execute_query(query)

    def close(self) -> None:
        """Close all database connections in pool"""
        if self.pool:
            self.pool.closeall()
            print("Database connection pool closed")


# Global database instance
db = Database()
