# How It Works — AI GM with Chroma RAG + Vite + Ollama

This document explains the current AI Game Master (GM) architecture, how the RAG service and Vite dev proxy interact, how the Modelfile is used by Ollama, and how the local knowledge base (`mothership_corpus/`) flows into chat responses.

## Overview

- Local LLM via Ollama (`mothership-gm` model built from the repo `Modelfile`).
- Python FastAPI RAG service using ChromaDB for retrieval.
- Vite dev server proxies:
  - `/ollama` → `http://localhost:11434` (Ollama API; with path rewrite)
  - `/rag` → `http://localhost:8790` (RAG FastAPI)
- React client implements a GM Chat panel that:
  - Pulls context via RAG
  - Calls Ollama `/api/chat` for streaming chat
  - Parses and fulfills TOOL calls (dice/check/lookup)

## Components and Key Files

- Modelfile (Ollama persona + template): `Modelfile`
- RAG service (Python):
  - Requirements: `rag_service/requirements.txt`
  - Config: `rag_service/config.py`
  - Index builder: `rag_service/indexer.py`
  - Retrieval + QA: `rag_service/rag.py`
  - FastAPI app: `rag_service/app.py`
  - Helper script: `scripts/rag_service_commands.sh`
- Frontend (React/TypeScript):
  - GM Chat hook: `src/hooks/useGameMaster.ts`
  - GM Chat panel: `src/components/FloatingGMChat.tsx`
  - Panels registry: `src/context/PanelsContext.tsx`
  - Header (Tools menu entry): `src/components/Header.tsx`
  - Vite dev proxy: `vite.config.ts`

## Data Flow

1) User opens “GM Chat” panel and submits a prompt.
2) Client calls `/rag/query` to retrieve top‑K snippets with citations from Chroma.
3) Client composes a system message with CONTEXT and CITATIONS, then calls `/ollama/api/chat` (streaming) with model `mothership-gm`.
4) Model streams assistant content. If it needs a dice roll/lookup/check, it emits a single line: `TOOL: { ... }`.
5) Client detects `TOOL:` and fulfills it locally:
   - rollDice → `src/utils/dice.ts`
   - requestCheck → opens Dice Roller via `useInteraction()` and waits for user input
   - lookup → performs a targeted `/rag/query` (or uses in‑app tables later)
6) Client continues the chat by sending `TOOL RESULT: { ... }` and renders the model’s follow‑up.

## Knowledge Base (KB)

- Path: `mothership_corpus/` (local, not shipped to the client build)
- Content: cleaned `.md`/`.txt` extracts and structured tables (`.json`/`.csv`).
- Index: persisted Chroma collection under `vector_store/chroma/`.
- Chunking: default 500 chars with 50 char overlap; metadata enriched with `source_document` and `source_page` when available.

## RAG Service Endpoints

- `GET /health`: readiness info (index present, collection path, embedding model)
- `POST /index/build`: builds or rebuilds the Chroma index from `mothership_corpus/`
- `POST /rag/query`: JSON `{ query: string, k?: number, filters?: object }` → `{ snippets, cites }`
- `POST /rag/qa`: optional RetrievalQA (uses Ollama via LangChain) → `{ answer, cites }`

## Vite Proxies (dev)

- File: `vite.config.ts`
- `/ollama` → `http://localhost:11434` with `rewrite: (path) => path.replace(/^\/ollama/, '')`
- `/rag` → `http://localhost:8790`

This lets the client call `/ollama/api/chat` and `/rag/query` without CORS issues during development.

## Modelfile and Model

- File: `Modelfile`
- Base: `FROM tohur/natsumura-storytelling-rp-llama-3.1`
- Template: Llama 3.1 chat format with role headers and `<|eot_id|>` turn delimiter.
- SYSTEM persona:
  - Mothership “Warden”
  - TOOL protocol (never roll dice; emit `TOOL: { ... }` and wait for `TOOL RESULT:`)
  - Context citations `[n]` when CONTEXT present
- Parameters: temperature/top_p/repeat_penalty/num_ctx/num_predict + `stop "<|eot_id|>"`
- Build model: `ollama create mothership-gm -f Modelfile`
- Run test: `printf 'Reply with exactly: OK\n' | ollama run mothership-gm`

## Frontend GM Chat (Hook + Panel)

- Hook: `src/hooks/useGameMaster.ts`
  - Calls `/rag/query` to get `context` and `cites`
  - Builds system message, then calls `/ollama/api/chat` (streaming; with non‑stream fallback)
  - Detects `TOOL:` JSON lines in streamed content
  - Fulfills tools: `rollDice`, `requestCheck`, `lookup`
- Panel: `src/components/FloatingGMChat.tsx`
  - Shows message history, streaming indicator, and a form for entering results for requested checks
  - Registered as a dockable panel `gm-chat` via `src/context/PanelsContext.tsx`
  - Tools menu entry in `src/components/Header.tsx`

## Scripts (Helper)

- File: `scripts/rag_service_commands.sh`
- Usage examples (repo root):
  - `scripts/rag_service_commands.sh venv` — create/upgrade `.venv`
  - `scripts/rag_service_commands.sh install` — install RAG deps
  - `scripts/rag_service_commands.sh add-sample` — create a tiny sample file in `mothership_corpus/`
  - `scripts/rag_service_commands.sh run` — start FastAPI on port 8790
  - `scripts/rag_service_commands.sh build-index` — POST `/index/build`
  - `scripts/rag_service_commands.sh health` — GET `/health`

## Configuration

- `.env` (copy from `.env.example`):
  - `VITE_OLLAMA_MODEL=mothership-gm`
  - Optional: `VITE_OLLAMA_BASE_URL` (dev proxy makes this unnecessary)
- RAG service env (optional):
  - `RAG_CORPUS_DIR` (default `./mothership_corpus`)
  - `RAG_PERSIST_DIR` (default `./vector_store/chroma`)
  - `RAG_COLLECTION` (default `mothership_rules`)
  - `RAG_EMBEDDING_MODEL` (default `all-MiniLM-L6-v2`)
  - `RAG_OLLAMA_MODEL` and `RAG_OLLAMA_BASE` (for `/rag/qa`)

## Troubleshooting

- `/index/build` returns 405
  - You used GET; it must be POST.
- 404 on `/rag/rag/query`
  - Correct path is `/rag/query`.
- No chat output
  - Ensure `ollama serve` is running; ensure Vite dev server has restarted after proxy changes; the hook now shows an error if the request fails.
- LangChain deprecation warnings
  - Service uses `langchain-huggingface` and `langchain-chroma`; reinstall deps and restart service.
- Vite warning “glob option as deprecated”
  - Fixed in `src/components/character-creator/PortraitPicker.tsx` using `query: '?url', import: 'default'`.

## Legal Notes

- The KB is user‑provided and local. Do not ship or commit proprietary rulebook text.
- The RAG service persists vectors locally and only exposes retrieval in development.

## Future Enhancements

- Table‑specific tools: `panicEffect`, `woundEffect`, `tableRoll("trinkets")`.
- Server‑mediated tool orchestration (optional) and session memory.
- Phase II SFT (QLoRA) for tone/procedure; swap tuned model into the same RAG path.

