#!/usr/bin/env bash

# Mothership RAG service helper commands
# Usage examples (from repo root):
#   chmod +x scripts/rag_service_commands.sh
#   scripts/rag_service_commands.sh venv
#   scripts/rag_service_commands.sh install
#   scripts/rag_service_commands.sh add-sample
#   scripts/rag_service_commands.sh run
#   scripts/rag_service_commands.sh build-index
#   scripts/rag_service_commands.sh health

set -euo pipefail

REPO_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT_DIR"

VENV_DIR=".venv"
PY="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"
UVICORN="$VENV_DIR/bin/uvicorn"

# Service config (override via env)
PORT="${PORT:-8790}"
BASE="${BASE:-http://localhost:$PORT}"

function need() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }
}

cmd_venv() {
  need python3
  if [[ -d "$VENV_DIR" ]]; then
    echo "[info] Virtualenv already exists: $VENV_DIR"
  else
    echo "[info] Creating virtualenv in $VENV_DIR"
    python3 -m venv "$VENV_DIR"
  fi
  echo "[info] Upgrading pip"
  "$PY" -m pip install --upgrade pip
}

cmd_install() {
  if [[ ! -x "$PIP" ]]; then
    echo "[error] $PIP not found. Run: $0 venv" >&2
    exit 1
  fi
  echo "[info] Installing Python dependencies"
  "$PIP" install -r rag_service/requirements.txt
}

cmd_add_sample() {
  local corpus_dir="${RAG_CORPUS_DIR:-mothership_corpus}"
  mkdir -p "$corpus_dir"
  local sample="$corpus_dir/test_rules.txt"
  if [[ -f "$sample" ]]; then
    echo "[info] Sample already exists: $sample"
  else
    printf 'Panic Check: Roll 1d20 (Panic Die) versus current Stress.\n' > "$sample"
    echo "[ok] Wrote sample file: $sample"
  fi
}

cmd_run() {
  if [[ ! -x "$UVICORN" ]]; then
    echo "[error] $UVICORN not found. Run: $0 venv && $0 install" >&2
    exit 1
  fi
  echo "[info] Starting FastAPI on port $PORT"
  exec "$UVICORN" rag_service.app:app --reload --port "$PORT"
}

cmd_build_index() {
  need curl
  echo "[info] Building index via POST $BASE/index/build"
  curl -sS -X POST "$BASE/index/build" | sed 's/^/[resp] /'
}

cmd_health() {
  need curl
  echo "[info] GET $BASE/health"
  curl -sS "$BASE/health" | sed 's/^/[resp] /'
}

cmd_help() {
  cat <<EOF
Usage: $0 <command>

Commands:
  venv          Create/upgrade the virtualenv (.venv)
  install       Install Python dependencies into .venv
  add-sample    Create a tiny example file in mothership_corpus/
  run           Start the RAG FastAPI service on port $PORT
  build-index   POST to /index/build (requires service running)
  health        GET /health
  help          Show this help

Env overrides:
  PORT          Service port (default: 8790)
  BASE          Base URL for service (default: http://localhost:
$PORT)
  RAG_CORPUS_DIR  Path to corpus directory (default: mothership_corpus)
EOF
}

case "${1:-help}" in
  venv) cmd_venv ;;
  install) cmd_install ;;
  add-sample) cmd_add_sample ;;
  run) cmd_run ;;
  build-index) cmd_build_index ;;
  health) cmd_health ;;
  help|*) cmd_help ;;
esac

