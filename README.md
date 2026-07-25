# Chico Protocol — Build Like a Tech Agency, Not a Solo Developer

> **A complete tech agency inside Claude Code — 42 agents, 130 skills, one entry point: `/chico`**

[![npm version](https://img.shields.io/npm/v/chico-protocol.svg?style=flat-square)](https://www.npmjs.com/package/chico-protocol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-7C3AED?style=flat-square)](https://docs.anthropic.com/claude-code)
[![Node](https://img.shields.io/badge/Node-%3E=20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**Build like a tech agency, not a solo developer.**

Chico Protocol turns Claude Code into a fully-staffed product agency. Instead of one chat that has to "do everything," you get 42 named specialists — a Business Analyst, a UX Architect, an Auth Engineer, a Bug Hunter, a Brand Strategist, a Test Architect — orchestrated by a single conductor named **Chico**. You describe the work. Chico picks the right people, runs them in parallel when it makes sense, and synthesizes the result.

---

## Quick start

```bash
npx chico-protocol install
```

That's it. Run this inside any project directory. The installer drops the Chico system into `.claude/` and `_chico/`, sets up your config, and you're ready to type `/chico <your request>` in Claude Code.

For a full walkthrough, see [Getting Started](docs/getting-started.md).

---

## Why Chico Protocol

Most agent setups for Claude Code fall into two traps: either one giant prompt trying to be everything, or a pile of disconnected commands the user has to memorize. Chico Protocol takes the opposite stance — explicit specialization, explicit orchestration, explicit verification.

- **The Brief is Sacred.** Every feature requested gets delivered exactly as specified. No silent simplification, no "coming soon" stubs, no mock responses pretending to be real. The system enforces this with 10 Anti-Incompletion rules and 5 optional verification passes.
- **Single Entry Point.** You don't pick which agent to talk to. You type `/chico <whatever>` and the orchestrator qualifies your request, picks the 1-3 best specialists from 42 available, parallelizes independent sub-tasks, and synthesizes the answer. Specialists stay individually callable when you know exactly who you want.
- **Modular Agent Architecture.** Agents live as micro-file skills (`SKILL.md` + references) organized in 8 thematic modules. They have persistent personas, persistent memory per project, and a published address book (CSV manifests) so the orchestrator always knows who does what.
- **Verification on Demand.** Five verification passes — concept fidelity, build & imports, functional handlers, real browser runtime via Playwright, completude (zero TODO/lorem/placeholder) — can be chained or invoked individually. They loop until clean with no iteration limit.

---

## How it works in 30 seconds

```
                          ┌──────────────────────────────┐
   You type:              │   /chico build me a SaaS     │
   (natural language) ──▶ │   billing dashboard for...   │
                          └────────────┬─────────────────┘
                                       │
                                       ▼
                          ┌──────────────────────────────┐
                          │       CHICO (Conductor)      │
                          │  reads manifests, qualifies, │
                          │  picks strategy, delegates   │
                          └────────────┬─────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
        ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
        │   Mary++     │       │   Winston++  │       │    Atlas     │
        │  (analyst)   │  ───▶ │ (architect)  │  ───▶ │ (data layer) │
        └──────────────┘       └──────────────┘       └──────────────┘
                │                      │                      │
                └──────────────────────┼──────────────────────┘
                                       │  (parallel where possible,
                                       │   sequential where required)
                                       ▼
                          ┌──────────────────────────────┐
                          │     CHICO synthesizes        │
                          │  → short answer + state file │
                          │     written for next turn    │
                          └──────────────────────────────┘
```

Behind the scenes, Chico writes a state file (`_chico-output/chico-state.md`) on every turn so the next conversation resumes cleanly, and a discussion board when a mini-team collaborates on a complex task.

---

## The 8 modules

| Module | Code | What's inside |
|---|---|---|
| Core | `core` | Utility skills: brainstorming, editorial review, party mode, adversarial review, help |
| Chico Protocol | `cmm` | Product development pipeline: analysis, planning, solutioning, implementation |
| Creative Intelligence | `cis` | Innovation, creativity, storytelling, design thinking, presentations |
| Test Architecture | `tea` | Testing methodology, QA, verification passes, audits |
| Game Dev Studio | `gds` | Game development specialist workflows and agents |
| Chico Builder | `cmb` | Agent, module, and workflow creation framework (build your own) |
| Web Pipeline | `web` | Specialized web dev agents: brand, copy, data, auth, UI, devops, post-launch |
| Verification | `verify` | 5 individual verification passes + browser-verify Playwright infrastructure |

See [docs/modules.md](docs/modules.md) for the detailed breakdown of every module.

---

## The 42 agents

Chico Protocol ships with **42 named specialists**, each with a persistent persona, a clearly scoped role, and a discoverable skill ID.

**Memory-type agents** (persist learnings across sessions, per project): Mary++, John++, Sally++, Winston++, Amelia++, Murat++, Paige++, and the GDS team.

**Stateless agents** (single-shot expertise, no memory): the Web Pipeline specialists (Atlas, Sentinel, Pixel, etc.) and the Creative Intelligence coaches (Carson, Maya, Victor, etc.).

**Autonomous agents** (long-running investigations): Tracker for production bugs.

A few highlights:

- **Mary++** — Strategic Business Intelligence Lead (analyst + market + personas)
- **Winston++** — Full-Stack Architecture Lead
- **Amelia++** — Full-Stack Dev Lead & Orchestrator
- **Murat++** — Master QA & Verification Architect
- **Pixel** — Component Library Architect (Atomic Design, accessible, dark mode)
- **Sentinel** — Auth & Security Engineer (RBAC, JWT, OWASP)
- **Tracker** — Production Bug Investigator
- **Carson** — Elite Brainstorming Specialist (Crazy 8s, SCAMPER, HMW)

**[See the complete agent catalog → docs/agents.md](docs/agents.md)**

---

## Anti-Incompletion Rules (R0–R9)

These ten rules apply to every agent, every mode, every output. They are the single biggest reason Chico Protocol produces shippable work instead of demoware.

| Rule | Requirement |
|---|---|
| **R0** | The brief is sacred — no feature substitution, simplification, or "coming soon" |
| **R1** | Zero TODO, FIXME, placeholder, mock, lorem ipsum in delivered code |
| **R2** | Zero empty handlers — every `onClick`, `onSubmit`, `onChange` has real logic |
| **R3** | Zero broken imports — every import resolves to an existing file |
| **R4** | Zero dead links — no `href="#"`, no links to nonexistent pages |
| **R5** | Every code agent produces a MANIFEST listing all created files with line counts |
| **R6** | Test coverage ≥ 85% by layer |
| **R7** | Lighthouse ≥ 90 (all categories), WCAG 2.1 AA, mobile-first |
| **R8** | Every `process.env.VAR` documented in `.env.example` with description |
| **R9** | Unlimited correction iterations — continue fixing until perfection |

---

## Verification passes

Five focused passes, runnable individually or in sequence. Each loops until clean (Rule R9).

| Pass | Skill | What it verifies |
|---|---|---|
| 0 | `/chico-verify-concept` | Brief fidelity — every requested feature exists and matches the concept |
| 2 | `/chico-verify-production` | `npm run build` clean, all imports resolve, all assets present |
| 3 | `/chico-verify-functional` | Zero empty handlers, zero mock responses, zero dead links |
| 4 | `/chico-verify-browser` | Playwright on real Chromium — console errors, network failures, JS exceptions, screenshots |
| 5 | `/chico-verify-completude` | Grep sweep: zero TODO/FIXME/placeholder/mock/lorem, all env vars documented |

Pass 4 catches what static analysis can't: runtime errors only visible when the app actually runs in a browser. See [docs/verification.md](docs/verification.md) for the full methodology.

---

## Auto-resume after a usage limit

Long autonomous runs eventually hit the account's usage limit. Instead of the work stalling
until you notice, the auto-resume watcher waits out the limit and relaunches the session on its own.

```bash
# start it in the background for a long session (auto-detects the current session transcript)
node .claude/scripts/auto-resume.mjs            # Unix: append &   ·   Windows: Start-Process -WindowStyle Hidden
```

It watches the session transcript for a **genuine** limit event — the record Claude Code writes as
`type:"assistant"` with `isApiErrorMessage:true`, e.g. *"You've hit your session limit · resets 7:40pm
(Europe/Brussels)"* — parses the reset time (12h/24h + IANA timezone, DST-safe), waits until reset + a
safety delay (`--delay-min`, default 5), then runs `claude --resume` so in-flight agents pick their work
back up. It deliberately ignores messages that merely *quote* the phrase (user messages, task-notifications,
the assistant's own explanations), so it never fires on a false positive. Pure Node, zero dependencies,
cross-platform. See the script header for all flags (`--transcript`, `--claude-bin`, `--once`).

---

## Memory system

Chico Protocol has a two-tier memory model — both optional, both useful.

**Agent Sanctum** is the always-on layer: each Memory-type agent has a personal markdown file (`_chico/memory/<persona>.md`) where it records project-specific learnings — Alex's stylistic preferences, project conventions, historical decisions, known pitfalls. The agent reads its sanctum at the start of every session and updates it at the end of significant ones.

**Semantic RAG** is the opt-in layer: the `chico-rag` MCP server chunks and embeds every project artifact (PRDs, architecture docs, old state files) into a Qdrant vector store using the local `bge-large-en-v1.5` model. Agents call `chico_memory_search("question")` instead of re-reading 10 files. Requires a Qdrant instance (works great on a small VPS via SSH tunnel).

See [docs/memory-system.md](docs/memory-system.md) for setup and patterns.

---

## Requirements

- **[Claude Code](https://docs.anthropic.com/claude-code)** — the CLI or IDE extension
- **Node.js 20+** — required by the installer and by Playwright (used by verify-browser)
- **Git** (recommended) — to track changes the agents make
- **Python 3.11+** (optional) — only if you want to enable the semantic RAG MCP server
- **Qdrant** (optional) — only for the semantic RAG layer; not required for normal use

That's it. No SaaS account, no API key to register beyond what Claude Code already needs.

---

## Documentation

| Document | What you'll find |
|---|---|
| [Getting Started](docs/getting-started.md) | First-project walkthrough — install, first `/chico` call, where files land |
| [Architecture](docs/architecture.md) | How the orchestrator works internally, mini-team patterns, discussion board |
| [Agent catalog](docs/agents.md) | All 42 agents grouped by module, with when-to-invoke notes |
| [Module reference](docs/modules.md) | Detailed breakdown of every module, its agents, its skills, typical use cases |
| [Verification](docs/verification.md) | The 5 passes, what each one catches, the browser-verify Playwright harness |
| [Memory system](docs/memory-system.md) | Sanctum vs RAG, when to use which, how to enable the optional RAG |
| [Agency playbook](docs/playbook.md) | The Discover → Define → Design → Develop → Deliver → Run methodology |

---

## Contributing

Pull requests welcome. Adding a new agent, a new skill, or a new module is a structured operation handled by the built-in **Chico Builder** module (CMB). See [CONTRIBUTING.md](CONTRIBUTING.md) for the conventions: CSV manifests must be kept in sync, every agent gets a `SKILL.md` with a persona section, every skill is independently discoverable.

---

## License

MIT — see [LICENSE](LICENSE).
