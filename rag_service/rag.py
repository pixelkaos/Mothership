from __future__ import annotations

import os
from typing import Any, Dict, List, Tuple

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama

from .config import get_settings


RAG_PROMPT_TEMPLATE = """
CONTEXT:
{context}

QUESTION:
{question}

Using only the provided context, answer the question. If the context does not contain the answer,
say that it is not available in the provided documents. Keep answers concise and cite sources as [n] if applicable.
"""


class RAGEngine:
    def __init__(self) -> None:
        self.cfg = get_settings()
        self._embeddings = None
        self._store = None

    @property
    def embeddings(self):
        if self._embeddings is None:
            self._embeddings = HuggingFaceEmbeddings(
                model_name=self.cfg["EMBEDDING_MODEL"]
            )
        return self._embeddings

    @property
    def store(self):
        if self._store is None:
            self._store = Chroma(
                collection_name=self.cfg["COLLECTION_NAME"],
                persist_directory=self.cfg["PERSIST_DIR"],
                embedding_function=self.embeddings,
            )
        return self._store

    def has_index(self) -> bool:
        # Heuristic: persisted dir exists and has files
        p = self.cfg["PERSIST_DIR"]
        return os.path.isdir(p) and any(True for _ in os.scandir(p))

    def retrieve(self, query: str, k: int = 6, filters: Dict[str, Any] | None = None):
        # Try to return scores if supported
        try:
            results = self.store.similarity_search_with_score(query, k=k, filter=filters)
            snippets = []
            for i, (doc, score) in enumerate(results):
                meta = doc.metadata or {}
                snippets.append(
                    {
                        "rank": i + 1,
                        "text": doc.page_content,
                        "score": float(score) if score is not None else None,
                        "meta": meta,
                    }
                )
        except Exception:
            docs = self.store.similarity_search(query, k=k, filter=filters)
            snippets = []
            for i, doc in enumerate(docs):
                snippets.append(
                    {
                        "rank": i + 1,
                        "text": doc.page_content,
                        "score": None,
                        "meta": doc.metadata or {},
                    }
                )

        cites = []
        for s in snippets:
            file = s["meta"].get("source_document") or s["meta"].get("source")
            page = s["meta"].get("source_page") or s["meta"].get("page")
            cites.append(f"[{s['rank']}] {file}{(' p.' + str(page)) if page is not None else ''}")

        return {"snippets": snippets, "cites": ", ".join(cites)}

    def qa(self, question: str, k: int = 6):
        """Simple RetrievalQA chain using Ollama."""
        llm = Ollama(model=self.cfg["OLLAMA_MODEL"], base_url=self.cfg["OLLAMA_BASE"])
        retriever = self.store.as_retriever(search_kwargs={"k": k})
        prompt = PromptTemplate(template=RAG_PROMPT_TEMPLATE, input_variables=["context", "question"])
        chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True,
        )
        res = chain.invoke(question)
        # Format cites
        cites = []
        for i, doc in enumerate(res.get("source_documents", []), start=1):
            meta = doc.metadata or {}
            file = meta.get("source_document") or meta.get("source")
            page = meta.get("source_page") or meta.get("page")
            cites.append(f"[{i}] {file}{(' p.' + str(page)) if page is not None else ''}")
        return {"answer": res.get("result", ""), "cites": ", ".join(cites)}
