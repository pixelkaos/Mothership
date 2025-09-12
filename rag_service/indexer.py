from __future__ import annotations

import os
from typing import List

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from .config import get_settings


def _collect_documents(corpus_dir: str):
    docs = []
    for root, _, files in os.walk(corpus_dir):
        for fname in files:
            path = os.path.join(root, fname)
            try:
                if fname.lower().endswith(".pdf"):
                    loader = PyPDFLoader(path)
                    loaded = loader.load()
                elif fname.lower().endswith((".md", ".txt")):
                    loader = TextLoader(path, encoding="utf-8")
                    loaded = loader.load()
                else:
                    continue
                # Enrich metadata
                for d in loaded:
                    meta = d.metadata or {}
                    meta.setdefault("source_document", os.path.basename(path))
                    if "page" in meta:
                        meta.setdefault("source_page", meta["page"])  # copy to stable key
                    d.metadata = meta
                docs.extend(loaded)
            except Exception:
                # Skip problematic files but continue
                continue
    return docs


def build_index() -> dict:
    """Build or rebuild the Chroma index from the local corpus.

    Returns minimal stats about the operation.
    """
    cfg = get_settings()
    corpus = cfg["CORPUS_DIR"]
    persist = cfg["PERSIST_DIR"]
    collection = cfg["COLLECTION_NAME"]
    emb_name = cfg["EMBEDDING_MODEL"]

    os.makedirs(persist, exist_ok=True)

    raw_docs = _collect_documents(corpus)
    if not raw_docs:
        # No documents to index; return graceful stats instead of erroring
        return {
            "documents": 0,
            "chunks": 0,
            "persist_directory": persist,
            "collection": collection,
            "embedding_model": emb_name,
            "note": f"No documents found under {corpus}. Add .pdf/.md/.txt files and re-run.",
        }
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=cfg["CHUNK_SIZE"],
        chunk_overlap=cfg["CHUNK_OVERLAP"],
        add_start_index=True,
    )
    chunks = splitter.split_documents(raw_docs)
    # Filter out empty chunks to avoid embedding errors
    chunks = [d for d in chunks if d.page_content and d.page_content.strip()]
    if not chunks:
        return {
            "documents": len(raw_docs),
            "chunks": 0,
            "persist_directory": persist,
            "collection": collection,
            "embedding_model": emb_name,
            "note": "All chunks were empty after cleaning. Check corpus extraction/cleaning.",
        }

    embeddings = HuggingFaceEmbeddings(model_name=emb_name)

    # Persist collection
    vs = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=collection,
        persist_directory=persist,
    )
    vs.persist()

    return {
        "documents": len(raw_docs),
        "chunks": len(chunks),
        "persist_directory": persist,
        "collection": collection,
        "embedding_model": emb_name,
    }
