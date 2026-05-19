# Memory system

Chico Protocol has two complementary memory mechanisms. Both are optional, both layer cleanly with the existing Claude Code state model. Use either, neither, or both depending on project scale.

| Layer | What it stores | Where it lives | When to use |
|---|---|---|---|
| **Agent Sanctum** | Per-persona project learnings (preferences, conventions, decisions) | `_chico/memory/<persona>.md` | Always on for Memory-type agents |
| **Semantic RAG** | Vector-indexed project artifacts (PRDs, code, reports) | Qdrant via `chico-rag` MCP | Opt-in, larger projects |

Plus, of course, the standard Claude Code mechanisms:

- **`chico-state.md`** — orchestrator's per-session working memory (always on)
- **`~/.claude/CLAUDE.md`** — your global Claude Code preferences (always on)

These four layers together mean **agents almost never have to ask you something they could have known**.

---

## Layer 1 — Agent Sanctum

### The idea

The CMM Memory agents (Mary++, John++, Sally++, Winston++, Amelia++, Murat++, Paige++) plus the GDS Memory agents (Cloud Dragonborn, Samus Shepard, Link Freeman, Indie, Paige (GDS)) each have a **personal markdown file per project**. This file is where they accumulate everything they've learned about *this specific project* across sessions.

```
<project-root>/_chico/memory/
├── _TEMPLATE.md       ← starter template
├── amelia.md          ← Amelia++'s sanctum for this project
├── winston.md         ← Winston++'s sanctum
├── mary.md
├── john.md
├── sally.md
├── paige.md
├── murat.md
└── ...
```

### What goes in a sanctum

Good entries:

- "Alex prefers `cva` over raw `clsx` for component variants"
- "This project uses a forked noVNC — avoid `npm update` without review"
- "April 2026 decision: no Vercel on this project, everything through Coolify"
- "When the Stripe webhook lands, route through the queue table first — direct processing caused deadlocks last sprint"

Bad entries (don't store these):

- "This project uses Next.js" — trivial, already in `package.json`
- "Components live in `src/components/`" — trivial, already in the file structure
- "Fixed bug in commit abc123" — belongs in git log, not here
- API keys, tokens, IPs, real user data — never, ever

The rule: **non-obvious facts that would help a future session**.

### File structure

The template at `_chico/memory/_TEMPLATE.md`:

```markdown
# <Persona> — memory for <project-name>

**Last updated**: YYYY-MM-DD

## Technical preferences
- ...

## Project conventions
- ...

## Known pitfalls
- ...

## Important historical decisions
- ...

## Watch for in future sessions
- ...
```

Cap at 200 lines per file. When it gets longer, the agent prunes older entries during its next session.

### Workflow

**At the start of a session** where a Memory agent is invoked:

1. The agent checks if `_chico/memory/<persona>.md` exists
2. If yes — it reads the file **first**, before anything else (even the manifests)
3. If no — it starts with a blank slate, and may create the file from the template

**During the session**, the agent notes non-obvious learnings mentally.

**At the end of a significant session**, the agent appends new learnings, updates the timestamp, and prunes if needed.

### Git tracking

Sanctum files live in your repo by default. They're useful for new team members who suddenly have access to "what the agent learned" without needing to interview anyone.

Don't sanctum-track confidential data — these files are versioned like any other file. If a sanctum needs to contain sensitive context (e.g. internal vendor names), gitignore it on a per-file basis.

---

## Layer 2 — Semantic RAG

### The idea

For larger projects, your `_chico-output/` accumulates dozens or hundreds of artifacts — PRDs, architecture docs, design system specs, sprint notes, code review reports, old `chico-state` files. Reading them all on every turn is wasteful. Re-asking the user what was decided three weeks ago is worse.

The **Semantic RAG** layer solves this by chunking and embedding all project artifacts into a Qdrant vector store. Agents call `chico_memory_search("natural language question")` and get back the 5-10 most relevant chunks across the entire project history.

### Architecture

```
┌──────────────────┐         ┌─────────────────────────┐
│  Claude Code     │         │  VPS or local Docker    │
│  (your machine)  │         │                         │
│                  │         │  Qdrant (127.0.0.1:6333)│
│  chico-rag MCP   │◄────────┤   - bind localhost only │
│  (Python)        │  SSH    │   - API key protected   │
│                  │ tunnel  │                         │
│  bge-large-en    │         │                         │
│  (~1.3 GB local) │         │                         │
└──────────────────┘         └─────────────────────────┘
```

Components:

- **Embeddings.** `BAAI/bge-large-en-v1.5` — runs locally, 1024-dim vectors, no API cost. ~1.3 GB downloaded on first use.
- **Vector store.** Qdrant 1.12+ — open source, runs in Docker or as a binary. Bind to `127.0.0.1` for safety.
- **Transport.** SSH tunnel — no DNS, no public port, no certificate to manage.
- **MCP server.** Python, lives at `.claude/mcp-servers/chico-rag/`.

### Tools exposed to agents

| Tool | Purpose |
|---|---|
| `chico_memory_search(query, k=5)` | Natural-language semantic search — top K chunks |
| `chico_memory_index(path)` | Index a file or directory |
| `chico_memory_get(point_id)` | Retrieve a chunk by ID |
| `chico_memory_list_collections()` | List collections (≈ projects) |
| `chico_memory_stats()` | Stats on a collection |
| `chico_memory_delete(path)` | Un-index a file |
| `chico_memory_forget(collection)` | Drop a whole collection (with confirmation) |
| `chico_memory_info()` | Diagnostics: version, config |

### Setup

```bash
# 1. Run Qdrant somewhere (local Docker shown — VPS works too)
docker run -d --name qdrant -p 127.0.0.1:6333:6333 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant:v1.12.0

# 2. Install the MCP server
cd .claude/mcp-servers/chico-rag
python -m venv .venv
source .venv/bin/activate     # or .venv\Scripts\activate on Windows
pip install -e .

# 3. Configure
cp .env.example .env
# Edit .env — set QDRANT_API_KEY and (if using SSH tunnel) SSH_KEY_PATH

# 4. First run downloads bge-large-en-v1.5 (~1.3 GB)
python -m chico_rag info

# 5. Register the MCP server in Claude Code
# (the installer can do this for you with --enable-rag)
```

Detailed setup, including the SSH tunnel pattern for hosting Qdrant on a VPS, is in `.claude/mcp-servers/chico-rag/README.md` after install.

### Collection naming

Each project gets its own collection: `chico-<project-slug>`. The slug auto-derives from the CWD where the MCP server is launched, or you can override it via `COLLECTION_NAME` in `.env`.

This means: one Qdrant instance can host many projects without cross-contamination.

### Indexing strategy

You have three options:

1. **Manual.** Agents call `chico_memory_index(path)` after producing a significant artifact.
2. **Bulk seed.** Run `chico_memory_index(_chico-output)` once to seed everything historical.
3. **Auto via hooks (future).** Phase 2 of the RAG layer will add a post-write hook that auto-indexes any new file in `_chico-output/`.

### When to use RAG vs Sanctum vs Read

| Question | Best tool |
|---|---|
| "What's Alex's preference for X?" | Sanctum (`_chico/memory/<persona>.md`) |
| "What did we decide three sessions ago?" | `chico_memory_search("...")` |
| "What does this short config file say?" | Just `Read` it |
| "Where is the auth pattern documented?" | `chico_memory_search("auth pattern")` |
| "What's in `chico-state.md` right now?" | `Read` it |

The RAG is for "what did we produce" / "where was this discussed" / "what artifact mentions X". The Sanctum is for "what have I personally learned about working on this project". They don't overlap — they layer.

### Limits and roadmap

Current (v0.1):

- Dense retrieval only (cosine similarity over `bge-large-en-v1.5`)
- Manual indexing (or seed once)
- One collection per project

Planned:

- Auto-indexing hooks (write → re-index)
- Hybrid retrieval (BM25 + dense)
- Cross-collection search for monorepos
- Sanctum sync (agents can write sanctum entries that flow into the RAG too)

---

## Articulation — using both layers together

A Memory agent's full activation sequence on a session start:

1. **Read its sanctum** — `_chico/memory/<persona>.md` (Layer 1)
2. **Read `chico-state.md`** — the orchestrator's working memory
3. **For specific questions about the project history** — call `chico_memory_search` (Layer 2)
4. **Fall back to direct `Read`** only when neither layer can answer

If the agent skips Layer 1 or 2 and starts asking you questions you've already answered, it's a bug — file an issue.

---

## Privacy and security

- Sanctum files are markdown — versioned with your repo by default
- The RAG runs **entirely locally** by default — embedding model on your machine, vector store on `127.0.0.1`
- If you host Qdrant on a remote VPS, use an SSH tunnel — never expose Qdrant to the public internet
- The `chico-rag` MCP requires an API key generated at install time
- No data ever leaves your control — there is no telemetry, no remote logging, no SaaS dependency in the memory layer

---

## When you don't need the RAG

If your project is small (<20 artifacts in `_chico-output/`), the RAG is overkill. The Sanctum + direct `Read` of relevant files works fine.

If your project is large (>50 artifacts, multiple sprints, many decisions), the RAG starts paying off — it converts a 20-Read context-eating session into a 1-search-1-Read pattern.

The threshold is fuzzy. Install it when you find yourself thinking "where did we discuss this again?" more than once a session.
