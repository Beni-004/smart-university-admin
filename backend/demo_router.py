"""
demo_router.py — FastAPI router for Review 2 DBMS Demo tab.

Endpoints:
  GET /demo/categories  — returns all 10 category metadata
  GET /demo/{category}  — executes queries and returns results
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import db
from demo_queries import DEMO_QUERIES


class QueryResult(BaseModel):
    title: str
    question: str
    sql: str
    columns: list[str]
    rows: list[list[str]]
    row_count: int
    error: Optional[str] = None


class CategoryResponse(BaseModel):
    category: str
    label: str
    section: str
    queries: list[QueryResult]


router = APIRouter(tags=["demo"])


@router.get("/demo/categories")
async def get_categories():
    """Return metadata for all 10 demo categories."""
    categories = []
    for cat_id, cat_data in DEMO_QUERIES.items():
        categories.append({
            "id": cat_id,
            "label": cat_data["label"],
            "section": cat_data["section"],
        })
    return {"categories": categories}


@router.get("/demo/{category}", response_model=CategoryResponse)
async def get_category_results(category: str):
    """Execute all queries in a category and return results."""
    if category not in DEMO_QUERIES:
        raise HTTPException(status_code=400, detail=f"Unknown category: {category}")

    cat_data = DEMO_QUERIES[category]
    results = []

    for q in cat_data["queries"]:
        try:
            result = db.execute_query(q["sql"])
            columns = result.get("columns", [])
            raw_rows = result.get("rows", [])
            row_count = result.get("row_count", 0)

            # Convert RealDictRow dicts → list-of-lists with stringified values
            rows = [
                [str(row[col]) if row[col] is not None else "" for col in columns]
                for row in raw_rows
            ]

            results.append({
                "title": q["title"],
                "question": q["question"],
                "sql": q["sql"],
                "columns": columns,
                "rows": rows,
                "row_count": row_count,
            })
        except Exception as e:
            # Include the error but don't crash the whole category
            results.append({
                "title": q["title"],
                "question": q["question"],
                "sql": q["sql"],
                "columns": [],
                "rows": [],
                "row_count": 0,
                "error": str(e),
            })

    return {
        "category": category,
        "label": cat_data["label"],
        "section": cat_data["section"],
        "queries": results,
    }
