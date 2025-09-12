import os


def get_settings() -> dict:
    """Read RAG configuration from environment with sensible defaults."""
    return {
        # Data & index
        "CORPUS_DIR": os.getenv("RAG_CORPUS_DIR", "./mothership_corpus"),
        "PERSIST_DIR": os.getenv("RAG_PERSIST_DIR", "./vector_store/chroma"),
        "COLLECTION_NAME": os.getenv("RAG_COLLECTION", "mothership_rules"),
        # Embeddings
        "EMBEDDING_MODEL": os.getenv("RAG_EMBEDDING_MODEL", "all-MiniLM-L6-v2"),
        # Chunking
        "CHUNK_SIZE": int(os.getenv("RAG_CHUNK_SIZE", "500")),
        "CHUNK_OVERLAP": int(os.getenv("RAG_CHUNK_OVERLAP", "50")),
        # Ollama for QA synthesis (optional)
        "OLLAMA_MODEL": os.getenv("RAG_OLLAMA_MODEL", "tohur/natsumura-storytelling-rp-llama-3.1"),
        "OLLAMA_BASE": os.getenv("RAG_OLLAMA_BASE", "http://localhost:11434"),
    }

