# Chico V3 Memory System

The Chico Protocol V3 ships with **two complementary memory mechanisms** that agents must know how to use. Read this document on every startup if you are a Memory-typed agent.

---

## 1. Semantic memory (RAG via the `chico-rag` MCP)

All project artifacts (PRD, architecture, code, reports, prior Chico states) are **chunked, embedded locally with `bge-large-en-v1.5`, and stored in a Qdrant instance**. The Qdrant instance can run locally (Docker on your machine) or remotely (your own VPS, optionally reached via SSH tunnel) — see `.claude/mcp-servers/chico-rag/README.md` for setup. You access them through the MCP tools exposed by the `chico-rag` server:

| Tool | Usage |
|---|---|
| `chico_memory_search(query, k=5)` | Natural-language search — **reflex before reading 10 files with Read** |
| `chico_memory_index(path)` | Index a file or a folder (usually automatic via hooks) |
| `chico_memory_get(point_id)` | Fetch a chunk by id |
| `chico_memory_list_collections()` | List collections (≈ projects) |
| `chico_memory_stats()` | Stats for a collection |
| `chico_memory_delete(path)` | Deindex a file |
| `chico_memory_info()` | Diagnostic (config, version) |

### When to use it

- **ALWAYS first** when searching: "What have we already done about auth?", "Where is the color palette documented?", "Which pattern do we use for forms?"
- **BEFORE** rereading a long file (CLAUDE.md, architecture.md, story.md) to answer a precise question — run a targeted `chico_memory_search` first.
- **AFTER** producing a significant new artifact: `chico_memory_index(path)` so it is retrievable next time.

### When NOT to use it

- Reading a short file in full (< 100 lines): `Read` is simpler.
- Configuration / manifest: these change often, read them directly.
- Code being modified right now: the RAG sees the indexed state, not the pending edits.

### Return conventions

`chico_memory_search` returns a list: `[{id, score, path, section, lines, text, tags}, ...]`. The `score` is a cosine in 0–1 (>0.6 = good relevance). The `text` is the full chunk (up to 500 tokens). If you need more surrounding context, do a targeted `Read` on `path:lines`.

---

## 2. Agent Sanctum — persistent personal memory

`Memory`-typed agents (Mary++, John++, Sally++, Winston++, Amelia++, Murat++, Paige++) each have a **personal memory file per project**:

```
<project-root>/_chico/memory/<persona>.md
```

E.g. `_chico/memory/amelia.md`, `_chico/memory/winston.md`.

This file accumulates, across sessions, what **you**, as a persistent agent on this project, have **learned**: the user's technical preferences, project conventions, gotchas encountered, non-obvious historical decisions.

### Format (template)

See `_TEMPLATE.md` in the same folder. Structure:

```markdown
# <Persona> — memory for <project-name>

**Last updated**: YYYY-MM-DD

## Technical preferences
- ...

## Project conventions
- ...

## Known gotchas
- ...

## Important historical decisions
- ...

## To watch in upcoming sessions
- ...
```

### Workflow

**On startup** of a session where you are invoked:
1. If `_chico/memory/<persona>.md` exists → **read it first** (even before the project manifests) and keep it in mind for the whole session.
2. If it does not exist → you start with a blank memory and learn during the session.

**During the session**: mentally note non-obvious learnings (things that are NOT in the code, the brief, or the docs).

**At the end of a significant session**:
1. Update `_chico/memory/<persona>.md` with the new learnings
2. Update the `Last updated` date
3. Do not exceed 200 lines — summarize / prune older entries as needed

### Good entry examples

- "The user prefers Pixel components to use `cva` for variants rather than plain clsx"
- "This codebase pins a vendored fork of `<library>` — avoid `npm update` without explicit review"
- "Decision 2026-04: we chose Postgres 16 over MongoDB for the billing schema — JSONB columns are sufficient and pricing is simpler"

### Bad examples (do NOT note)

- "The project uses Next.js" → trivial, already in package.json
- "Components live in src/components/" → trivial, already in the structure
- "Bug fixed in commit abc123" → belongs to git log, not here

### Privacy

These files live in the project repo (unless .gitignored). Never store: credentials, tokens, private IPs, real user data.

---

## How the two mechanisms fit together

| Question | Tool |
|---|---|
| "What do I know about this project (preferences/conventions)?" | Read `_chico/memory/<persona>.md` |
| "What artifacts have we already produced?" | `chico_memory_search` |
| "What did Chico decide on the previous turn?" | Read `_chico-output/chico-state.md` |
| "What are the user's global rules?" | Claude Code user memory (`~/.claude/CLAUDE.md`) |

The four systems are complementary. Using them well = **never** asking the user something we have already learned.
