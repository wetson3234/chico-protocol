# Architecture

This document describes how Chico Protocol is organized internally and how the orchestrator decides what to do. If you want the user-facing tour, start with [Getting Started](getting-started.md) instead.

---

## The three pillars

Everything in Chico Protocol derives from three design commitments:

### 1. The Brief is Sacred

A request from the user is a contract, not a suggestion. The framework refuses to silently substitute features, simplify scope, or insert "coming soon" placeholders. This is enforced in two ways:

- **Anti-Incompletion Rules (R0–R9)** — written into every agent's awareness section. R0 explicitly forbids feature substitution. R1 forbids placeholders. R5 forces agents to produce a manifest of every file they touched. R9 says correction loops have no iteration limit — keep fixing until clean.
- **Verification passes** — five optional passes that re-read the work and check it against the brief, the build, the actual browser runtime, and a final grep sweep for forbidden patterns.

### 2. Modular Agent Architecture

Each agent is a self-contained skill: a `SKILL.md` file with YAML frontmatter, an identity section, a communication style, principles, and capabilities. They live in `.claude/skills/` and are organized into 8 thematic modules. The orchestrator discovers them via three CSV manifests — the address book.

This means: adding a new specialist is a structured operation, not a free-form change. The Chico Builder module (CMB) automates the boilerplate.

### 3. Verification on Demand

Verification is not part of the development loop — it's a separate, on-demand operation. Users invoke `/chico-verify-concept`, `/chico-verify-production`, `/chico-verify-functional`, `/chico-verify-browser`, or `/chico-verify-completude` when they want to check work. Each pass loops until clean. Pass 4 runs Playwright against real Chromium, catching runtime errors that static analysis cannot.

---

## The installed tree

```
project-root/
├── .claude/                       ← system files Claude Code reads
│   ├── CLAUDE.md                  ← project-level instructions
│   ├── settings.json              ← permissions, MCP server registrations
│   ├── skills/                    ← every agent + every workflow
│   │   ├── chico/                 ← the orchestrator skill itself
│   │   ├── chico-agent-*/         ← 7 fused CMM agents (Mary++, John++, Sally++, Winston++, Amelia++, Murat++, Paige++)
│   │   ├── chico-web-*/           ← 20 web pipeline specialists
│   │   ├── chico-cis-*/           ← 6 creative intelligence coaches
│   │   ├── chico-gds-*/           ← 5 game dev specialists
│   │   ├── chico-verify-*/        ← 5 verification passes
│   │   └── ...                    ← workflow skills (create-prd, dev-story, code-review, etc.)
│   ├── scripts/
│   │   └── browser-verify.mjs     ← Playwright runtime harness
│   ├── hooks/
│   │   └── pre-bash.sh            ← safety + logging hook for shell commands
│   └── mcp-servers/
│       └── chico-rag/             ← optional semantic memory MCP
│
├── _chico/                        ← Chico configuration + knowledge
│   ├── _config/
│   │   ├── manifest.yaml          ← installation record
│   │   ├── agent-manifest.csv     ← address book for the 42 agents
│   │   ├── skill-manifest.csv     ← address book for the 130 skills
│   │   └── chico-help.csv         ← contextual help mapping
│   ├── core/cmm/cis/tea/gds/cmb/web/verify/   ← per-module config.yaml
│   ├── memory/                    ← per-persona memory files (sanctums)
│   ├── templates/                 ← output templates (architecture, business, product, deploy, sprint)
│   └── agency-playbook.md         ← phase × sub-step × agent × method matrix
│
└── _chico-output/                 ← everything agents produce
    ├── chico-state.md             ← orchestrator's session state
    ├── planning-artifacts/        ← PRDs, personas, brand, UX, architecture
    ├── implementation-artifacts/  ← stories, sprint plans, code review reports
    ├── reports/                   ← verification reports + screenshots
    ├── testing-artifacts/         ← test plans, traceability matrices
    └── discussions/               ← mini-team discussion boards
```

The split is intentional. `.claude/` and `_chico/` ship with the system and are read-only in normal use. `_chico-output/` is the project's deliverable surface — versioned or not, depending on your team's preference.

---

## How the orchestrator works

The Chico orchestrator is itself a skill — `.claude/skills/chico/SKILL.md`. When the user types `/chico <something>`, Claude Code loads this skill and runs its activation logic. The skill walks through a 7-step loop:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. READ MANIFESTS                                              │
│     - agent-manifest.csv    (42 agents)                         │
│     - skill-manifest.csv    (130 skills)                        │
│     - chico-help.csv        (contextual map)                    │
│     All three loaded in parallel.                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. READ STATE                                                  │
│     - _chico-output/chico-state.md (if exists)                  │
│     This is the orchestrator's working memory between turns.    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. CLASSIFY REQUEST                                            │
│     debug / modif / from-scratch / advice /                     │
│     research / creative / review / meta                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. PICK STRATEGY                                               │
│     - Single agent     → direct delegation                      │
│     - Independent      → N agents in parallel (one turn)        │
│     - Pipelined        → sequential                             │
│     - Fan-out/fan-in   → A solo, then B+C+D parallel, then sync │
│     - No good fit      → ad hoc general-purpose agent           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. DELEGATE                                                    │
│     For each agent, build a prompt with:                        │
│     - persona declaration                                       │
│     - context (request + state summary)                         │
│     - precise task with success criteria                        │
│     - expected return format                                    │
│     - constraints (language, no questions, R0-R9 compliance)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. SYNTHESIZE                                                  │
│     Compress sub-agent returns into:                            │
│     - 1 line: what happened, who did what                       │
│     - bullets: facts, files changed, key numbers                │
│     - 1 line: next step proposal OR question if ambiguous       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. UPDATE STATE                                                │
│     Append a new turn block to chico-state.md.                  │
│     Record: agents activated, results, decisions, next step.    │
└─────────────────────────────────────────────────────────────────┘
```

Key behavioral rules baked into the orchestrator:

- **Always try an existing agent first.** Only spawn an ad hoc `general-purpose` agent when no named agent fits within 30% of the need.
- **Parallelize by default.** If sub-tasks are genuinely independent, fire N agents in a single tool-use block — don't serialize "just to be safe."
- **Ask only when ambiguity is radical.** For minor choices, the orchestrator decides. Only escalate to the user when the choice is between two fundamentally different paths.
- **Maintain the thread.** Every turn writes to `chico-state.md`. The next turn reads it before doing anything else.
- **Synthesize, don't regurgitate.** Sub-agent outputs may be 2000 words; the user sees 5 lines.

---

## Mini-team patterns

For complex sub-steps (multi-angle architecture, bug investigation, ideation, audits), Chico builds a **mini-team** — multiple agents collaborating on the same task via a shared markdown discussion board. Three patterns are used.

### Pattern 1 — Pair Work

One agent works on a task, hits a question that needs another agent's expertise, gets help, continues.

```
┌──────────┐         ┌──────────┐
│ Tracker  │  asks   │  Carson  │
│ (bug     │ ──────▶ │ (brain-  │
│  hunter) │         │  storm)  │
│          │ ◀────── │          │
│          │ returns │          │
└──────────┘         └──────────┘
     │
     │ continues investigation with 5 new hypotheses
     ▼
   ROOT CAUSE
```

**Example.** Tracker is investigating a login redirect bug. It hits a wall and asks Carson to brainstorm 5 hypotheses via SCAMPER. Carson writes 5 lines into the discussion board. Tracker reads them, picks the most likely, codes a fix with a regression test.

### Pattern 2 — Sequential Handoff

Each agent enriches the previous agent's work. The output of A is the input of B is the input of C.

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ Mary++   │ ───▶ │ John++   │ ───▶ │ Sally++  │
│ produces │      │ produces │      │ produces │
│ personas │      │ vision   │      │ journey  │
└──────────┘      └──────────┘      └──────────┘
                       (each step uses prior outputs)
```

**Example.** Mary++ produces `personas.md`. John++ reads it and produces `vision.md` (Product Vision Board). Sally++ reads both and produces `customer-journey.md`. Each step has access to its predecessors' artifacts.

### Pattern 3 — Parallel Synthesis

Independent sub-tasks attack the same problem from different angles. Chico runs them in parallel and synthesizes.

```
                ┌──────────┐
                │  Chico   │
                │ (briefs) │
                └────┬─────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │ Carson │   │   Dr.  │   │ Victor │
   │ (Crazy │   │ Quinn  │   │ (Blue  │
   │   8s)  │   │ (TRIZ) │   │ Ocean) │
   └────┬───┘   └────┬───┘   └────┬───┘
        │            │            │
        └────────────┼────────────┘
                     ▼
                ┌──────────┐
                │  Chico   │
                │ (synth)  │
                └──────────┘
```

**Example for ideation.** Chico asks Carson to brainstorm via Crazy 8s, Dr. Quinn to apply TRIZ, Victor to look for Blue Ocean angles — all in parallel in a single turn. Three retours arrive together. Chico synthesizes the 3 strongest directions for the user.

---

## The discussion board

Agents in a mini-team don't talk to each other directly — Claude Code's sub-agent model is hub-and-spoke through the orchestrator. Communication happens through a **shared markdown file** at:

```
_chico-output/discussions/<task-id>.md
```

The task ID is generated by Chico (e.g. `bug-login-redirect-2026-05-19-1`). Format:

```markdown
# Discussion — <short title>

**Type**: bug | feature | ideation | architecture | ...
**Started**: 2026-05-19 14:02
**Mini-team**: Tracker, Carson, Murat++
**Status**: open | closed

---

## Initial context (written by Chico)
<task brief, constraints, goal>

## [14:05] Tracker — investigation lead
<my hypotheses, what I've ruled out, where I'm stuck>

> I recommend Carson brainstorms 5 angles via SCAMPER on the redirect logic.

## [14:11] Carson — brainstorm support
<5 angles via SCAMPER>

## [14:18] Tracker — back with conclusion
<pick the most likely, code the fix>

## [14:22] Final decision (written by Chico)
<summary, who executes next>
```

Workflow:

1. Chico creates the discussion board at the start of a mini-team task
2. Every agent invocation includes the board path in the prompt
3. Each agent **reads the full board first**, then appends its own section with timestamp + name + contribution
4. Agents can explicitly request another agent (`> I recommend that <Persona> intervenes on <point>`)
5. Chico re-reads the board between turns and decides who's next
6. When the team's work is done, Chico writes the "Final decision" section and marks the board closed
7. The closed board can optionally be indexed into the RAG for future retrieval

This pattern is the single biggest difference between Chico-as-router and Chico-as-conductor.

---

## Anti-patterns (what the orchestrator does NOT do)

These are explicit non-behaviors written into the orchestrator's persona:

- **Doesn't code itself.** If code is needed, it delegates to Amelia++ or a specialist.
- **Doesn't read project files when an agent is competent for that.** Reading is the agent's job, not the conductor's.
- **Doesn't impose a rigid pipeline.** There is no "you must do PRD before UX before code" enforcement. The agency playbook is a reference, not a gate.
- **Doesn't run verification passes systematically.** They're invoked on demand. A small bugfix doesn't trigger five passes.
- **Doesn't launch an agent just to demonstrate it can.** Conversational or meta requests get answered directly by the orchestrator.

---

## Configuration and substitution

The installer writes user preferences into `_chico/_config/manifest.yaml`:

```yaml
version: 1.1.0
installed: 2026-05-19
user_name: Alice
communication_language: français
document_output_language: français
modules:
  - core
  - cmm
  - cis
  - tea
  - cmb
  - web
  - verify
rag_enabled: false
```

Module-specific config lives in `_chico/<module>/config.yaml`:

```yaml
user_name: Alice
communication_language: français
document_output_language: français
planning_artifacts: _chico-output/planning-artifacts
implementation_artifacts: _chico-output/implementation-artifacts
project_knowledge: docs
```

Skills reference these variables with `{user_name}`, `{communication_language}`, etc. Each agent resolves them at activation time.

---

## The CSV manifests

Three CSV files serve as the orchestrator's address book. They are not optional — they're the mechanism by which Chico finds the right agent.

**`agent-manifest.csv`** — 42 rows, one per agent:

```
canonicalId,name,displayName,title,persona,module,type,phase,origin,path
chico-agent-analyst,Mary++,Mary,Strategic Business Intelligence Lead,Mary,cmm,Memory,P01,fused (...),.claude/skills/chico-agent-analyst
```

**`skill-manifest.csv`** — 130 rows, one per skill:

```
canonicalId,name,description,module,category,origin,path
chico-create-prd,Create PRD,Create product requirements document...,cmm,workflow,conserved,.claude/skills/chico-create-prd
```

**`chico-help.csv`** — contextual help: "if the user is in phase X with artifact Y missing, suggest skill Z."

Updates to these files must be kept in sync — the orchestrator treats them as the source of truth and will refuse to invoke an unregistered skill.

---

## Where to read more

- [Agent catalog](agents.md) — all 42 agents with when-to-invoke notes
- [Modules](modules.md) — what each of the 8 modules contains
- [Agency playbook](playbook.md) — Discover → Run methodology and which agents run which phase
- [Verification](verification.md) — the 5 passes and the Playwright harness
- [Memory system](memory-system.md) — Sanctum vs RAG, when to use which
