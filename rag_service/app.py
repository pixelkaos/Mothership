from __future__ import annotations

import os
from fastapi import FastAPI
from pydantic import BaseModel

from .config import get_settings
from .indexer import build_index
from .rag import RAGEngine


app = FastAPI(title="Mothership RAG Service", version="0.1.0")
cfg = get_settings()
engine = RAGEngine()


class QueryRequest(BaseModel):
    query: str
    k: int | None = 6
    filters: dict | None = None


class QARequest(BaseModel):
    question: str
    k: int | None = 6


@app.get("/health")
def health():
    return {
        "ok": True,
        "has_index": engine.has_index(),
        "collection": cfg["COLLECTION_NAME"],
        "persist_directory": cfg["PERSIST_DIR"],
        "embedding_model": cfg["EMBEDDING_MODEL"],
    }


@app.post("/index/build")
def index_build():
    stats = build_index()
    # Mark empty corpus/chunks explicitly for better UX
    docs = int(stats.get("documents", 0))
    chunks = int(stats.get("chunks", 0))
    empty = docs == 0 or chunks == 0
    message = (
        stats.get("note")
        or ("Index built successfully." if not empty else "No documents/chunks detected. Add .pdf/.md/.txt files under the corpus directory and re-run.")
    )
    return {"ok": True, "empty": empty, "message": message, **stats}


@app.post("/rag/query")
def rag_query(req: QueryRequest):
    if not engine.has_index():
        return {
            "ok": False,
            "message": "No index found. Build it first via POST /index/build and ensure the corpus directory contains content.",
        }
    data = engine.retrieve(req.query, k=(req.k or 6), filters=req.filters)
    if not data.get("snippets"):
        data["message"] = "No results for this query. Try rephrasing or adding more corpus sources."
    return {"ok": True, **data}


@app.post("/rag/qa")
def rag_qa(req: QARequest):
    if not engine.has_index():
        return {
            "ok": False,
            "message": "No index found. Build it first via POST /index/build and ensure the corpus directory contains content.",
        }
    data = engine.qa(req.question, k=(req.k or 6))
    if not data.get("answer"):
        data["message"] = "No answer produced. Try querying via /rag/query to inspect retrieved context."
    return {"ok": True, **data}


# For local run: uvicorn rag_service.app:app --reload --port 8790
