# `_chico/memory/` folder

Contains:

- **`MEMORY-SYSTEM.md`** — full documentation of the Chico V3 memory system (RAG + Agent Sanctum). Canonical reference for agents.
- **`_TEMPLATE.md`** — template to copy as `<persona>.md` to bootstrap an agent's memory on this project.
- **`<persona>.md`** (to be created across sessions) — memory specific to each Memory-typed agent: Mary++, John++, Sally++, Winston++, Amelia++, Murat++, Paige++.

These files are **persistent per project**, to be distinguished from RAG chunks (which live in a Qdrant instance — either local or remote — managed by the `chico-rag` MCP).
