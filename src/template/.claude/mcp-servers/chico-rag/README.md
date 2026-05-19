# Chico RAG MCP

MCP server that gives Chico agents a persistent **semantic memory**: project artifacts are chunked, embedded with a local model (`bge-large-en-v1.5`), stored in **Qdrant**, and queryable in natural language.

This MCP is **optional**. Chico works fully without it — the RAG is an opt-in enhancement that pays off when a project grows large enough that you stop wanting to re-read every file every session.

## Two deployment shapes

You can run the Qdrant vector store either locally or remotely. Pick the one that fits your setup.

### Shape A — local Qdrant (zero infrastructure)

```
┌──────────────────────────────┐
│  Claude Code (local machine) │
│                              │
│  chico-rag MCP (Python)      │◄──── Qdrant running locally
│  bge-large-en (~1.3 GB)      │      (Docker on 127.0.0.1:6333)
└──────────────────────────────┘
```

Recommended for solo / small projects. Set `SSH_TUNNEL_ENABLED=false` in `.env`.

### Shape B — remote Qdrant on your own VPS

```
┌──────────────────┐         ┌─────────────────────────┐
│  Claude Code     │         │  Your VPS               │
│  (local)         │         │                         │
│                  │         │  Qdrant (127.0.0.1:6333)│
│  chico-rag MCP   │◄────────┤   - bind localhost only │
│  (Python)        │  SSH    │   - API key protected   │
│                  │ tunnel  │                         │
│  bge-large-en    │         │                         │
└──────────────────┘         └─────────────────────────┘
```

Recommended if you already operate a VPS and want a single Qdrant shared across machines. Set `SSH_TUNNEL_ENABLED=true` and fill the SSH fields in `.env`.

- **Embeddings**: `BAAI/bge-large-en-v1.5` (local, free, 1024 dims)
- **Vector store**: Qdrant 1.12+ (binds to `127.0.0.1` either way — never expose Qdrant directly to the internet)
- **Transport**: SSH tunnel for the remote shape, direct TCP for the local shape

## Local installation

```bash
cd .claude/mcp-servers/chico-rag
python -m venv .venv
# Linux / macOS:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\activate
pip install -e .
cp .env.example .env
# Edit .env according to your chosen shape (A or B above)
```

The first launch downloads bge-large (~1.3 GB) automatically.

## Exposed MCP tools

| Tool | Role |
|---|---|
| `chico_memory_index` | Index a file or a folder |
| `chico_memory_search` | Top-K semantic search |
| `chico_memory_get` | Fetch a chunk by id |
| `chico_memory_list_collections` | List collections |
| `chico_memory_stats` | Stats for a collection |
| `chico_memory_delete` | Delete chunks for a file |
| `chico_memory_forget` | Delete an entire collection (with confirmation) |
| `chico_memory_info` | Diagnostic: version, config |

## Collection naming convention

`chico-<project-slug>` — auto-detected from the project folder name (the CWD at launch). Override with `COLLECTION_NAME` in `.env`.

## Security

- Qdrant listens only on `127.0.0.1:6333` — never bind it to a public interface.
- Remote shape: the SSH tunnel is encrypted and key-authenticated; no port is exposed publicly.
- Mandatory API key (generate one when you set up Qdrant; rotate periodically).
- The `.env` file is git-ignored — never commit it.

## V0.1 limitations

- No auto-indexing hooks yet (planned)
- No Agent Sanctum auto-sync yet (planned)
- Dense search only (sparse / hybrid retrieval planned)
