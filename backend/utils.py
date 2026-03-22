"""Shared utility functions."""


def clean_sql(raw: str) -> str:
    """Strip markdown fences, collapse whitespace, remove trailing semicolon."""
    sql = raw.strip()
    sql = sql.replace("```sql", "").replace("```", "")
    sql = " ".join(sql.split())
    return sql.rstrip(";")
