---
name: chico-mini-team
description: "Orchestrator skill invoked by Chico to run a mini-team of agents collaborating on a complex task via a shared Discussion Board. Uses the 3 patterns (pair work, sequential handoff, parallel synthesis) from Chico's SKILL.md. Use it when a task benefits from multiple analysis angles — debug with brainstorm, multi-layer architecture, creative ideation, full audit, etc."
trigger-patterns:
  - "mini team"
  - "discussion board"
  - "orchestrate team"
  - "agent collaboration"
---

# chico-mini-team — Mini-team orchestration via Discussion Board

## Overview

This is the **concrete mechanism** Chico calls to make multiple agents collaborate on the same task. Not a persona, not a human agent — a **technical skill** that implements the communication ecosystem described in Chico's SKILL.md (sections "Mini-Team Patterns" and "Inter-Agent Communication").

This skill:
1. Creates a **Discussion Board** (shared markdown artifact)
2. Invites agents one by one (or in parallel depending on the chosen pattern)
3. Each agent reads + adds its contribution
4. At the end, synthesizes and indexes via RAG

**Canonical reference**: `_chico/agency-roles.md` (who-does-what-with-whom), `_chico/agency-playbook.md` (the 6 macro-phases).

## When to invoke

Chico calls this skill when:
- The task benefits from **multiple angles** (e.g., bug with brainstorm + tests, architecture with data + security + perf)
- The task is **too broad for a solo agent**
- The task is **critical** and deserves a cross-check among experts
- The user explicitly requested collaborative work

**Do not invoke** for:
- A task bounded to 1 expertise (e.g., "Murat++ write me an e2e test")
- A conversational / meta question
- A trivial request (e.g., "how do I enable dark mode")

## Required inputs

When Chico calls this skill, it must provide:

| Input | Description | Example |
|---|---|---|
| `task_id` | Unique identifier for the Discussion Board | `bug-login-redirect-2026-04-27-1` |
| `task_type` | Task type | `bug-investigation`, `from-scratch-architecture`, `ideation`, `audit`, etc. |
| `brief` | Task description | "The login button redirects to /home instead of /dashboard on Safari iOS only" |
| `pattern` | Collaboration pattern | `pair-work`, `sequential-handoff`, `parallel-synthesis` |
| `team` | List of agents (with role in the mini-team) | `[{persona: "Tracker", role: "lead investigation"}, {persona: "Carson", role: "brainstorm cause hypotheses"}, {persona: "Murat++", role: "test validation + regression coverage"}]` |
| `context_artifacts` | Paths to files provided to the agents | `["_chico-output/planning-artifacts/...", "src/auth/..."]` |

## Output

At the end, the skill produces:

1. **The complete Discussion Board**: `_chico-output/discussions/<task-id>.md` with timestamped contributions from each agent + Final decision by Chico
2. **The artifacts produced** by the agents (code, docs, tests…) in their usual locations
3. **A short synthesis** returned to Chico for the report to the user
4. **RAG indexing** of the Discussion Board via `chico_memory_index` for future reuse

## The 3 execution patterns

### Pattern 1 — Pair Work

**When**: an agent A is working but needs a specialized brain on a precise point (once or several times).

**Execution**:
```
Turn 1: Chico → invokes A with board path
  A reads the board (empty) + writes its first contribution
  A indicates "I need B on X"
Turn 2: Chico → invokes B with board path
  B reads the board + replies on X only
Turn 3: Chico → invokes A again
  A integrates B's reply + finalizes its contribution
```

**Typical case**: Tracker investigates a bug, asks Carson to brainstorm 5 hypotheses via SCAMPER, integrates, continues.

### Pattern 2 — Sequential Handoff

**When**: structured pipeline where each agent enriches the previous work (A → B → C chain).

**Execution**:
```
Turn 1: Chico → invokes A
  A reads board (empty) + produces its full contribution + explicit handoff
Turn 2: Chico → invokes B with board path
  B reads board (=> has seen what A did) + produces its contribution extending A's
Turn 3: Chico → invokes C
  C reads board + finalizes / synthesizes
```

**Typical case**: Mary++ produces personas → John++ produces vision (using the personas) → Sally++ produces customer-journey (using both).

### Pattern 3 — Parallel Synthesis

**When**: independent sub-tasks that shed light on different angles; Chico synthesizes.

**Execution**:
```
Turn 1: Chico → invokes A + B + C in parallel (3 Agent calls in 1 message)
  A, B, C read board (empty or initial context)
  Each writes its own contribution in a dedicated section
  None reads the others' work because parallel
Turn 2: Chico → re-reads the full board
  Chico writes the "Final decision" by synthesizing the 3 contributions
```

**Typical case** for ideation: Carson (Crazy 8s) + Dr. Quinn (TRIZ) + Victor (Blue Ocean) in parallel. Chico then identifies the 3 best leads across the 3 contributions.

### Choosing the right pattern

| Task characteristic | Recommended pattern |
|---|---|
| A lead agent needs punctual help | Pair work |
| Ordered steps with dependencies | Sequential handoff |
| Creative brainstorm / multi-angle exploration | Parallel synthesis |
| Audit with orthogonal criteria | Parallel synthesis |
| From-scratch workflow (Discover → Define → Design …) | Sequential handoff between phases, sometimes parallel within a phase |
| Bug investigation | Pair work (Tracker lead) or Sequential (Tracker → Carson → Murat → Tracker) |

## Discussion Board format

The file `_chico-output/discussions/<task-id>.md` follows this strict format:

```markdown
# Discussion — <Short title of the task>

**Task ID**: <task-id>
**Type**: <task-type>
**Started**: <YYYY-MM-DD HH:MM>
**Pattern**: <pair-work | sequential-handoff | parallel-synthesis>
**Mini-team**: <Persona1, Persona2, ...>
**Status**: <open | closed>

---

## Initial context (written by Chico)

<Task brief, constraints, objective, available artifacts, precise scope.>

---

## [HH:MM] <Persona1> — <its role in this task>

<Its own contribution, in its style and expertise.>

<If recommending another agent's help: "> I recommend that <Persona> intervene on <point>".>

---

## [HH:MM] <Persona2> — <its role>

<Its contribution. May cite/reply to Persona1 but without rewriting their work.>

---

## [HH:MM] <Persona3> — <its role>

<Same.>

---

## Final decision (written by Chico)

**Synthesis**: <2-5 lines of what emerged>
**Decision**: <chosen path + rationale>
**Next action(s)**: <who executes what now>
**Produced artifacts**: <list with paths>
```

## Inter-agent recommendation detection

When an agent finishes its contribution in the board, it can recommend that another agent intervene. The **strict format** to use (and that Chico detects via simple regex):

```markdown
> I recommend that <Persona> intervene on <precise point>
```

- The initial `> ` (blockquote) is mandatory — it acts as a marker
- `<Persona>` must match an agent name in `agent-manifest.csv`
- Chico parses these lines at the start of every turn to decide who to invoke next

If a single agent emits multiple recommendations, Chico handles them in order of appearance.

## Multi-board chaining (multi-phase projects)

For a from-scratch project that activates several phases (Discover → Define → Design → Develop), **each phase has its own board** + a **master board** that chains them:

```
_chico-output/discussions/
├── master-law-firm-2026-04-27.md       # master board, chains everything
├── discover-law-firm-2026-04-27.md
├── define-law-firm-2026-04-27.md
├── design-law-firm-2026-04-27.md
└── develop-law-firm-2026-04-27.md
```

The **master board** contains:
- A project overview
- The ordered list of activated phases with links to each sub-board
- Major inter-phase decisions
- Global state (which phase is in progress, which is done)

Each sub-board remains autonomous. The master is updated by Chico at every phase transition.

## RAG indexing — exactly when

Chico invokes `chico_memory_index(<board_path>)` **immediately after writing the "Final decision"** in a board. Not before (an incomplete board pollutes the RAG), not later (risk of forgetting).

For a master board of a multi-phase project: index **at the end of each phase** (every time a sub-board moves to `Status: closed`), so later phases can retrieve earlier-phase context via semantic search.

## Detailed workflow for Chico

### Step 1 — Preparation

```
task_id = "<type>-<short-slug>-<YYYY-MM-DD>-<n>"
board_path = "_chico-output/discussions/<task_id>.md"
mkdir -p _chico-output/discussions/    # idempotent, won't break if it exists
```

Write the initial context in the board (header + "Initial context" section).

**Inspiration**: a populated Discussion Board example for a bug fix exists in `_chico-output/discussions/_EXAMPLE-bug-investigation.md` — use it as a structural template.

### Step 2 — Pattern choice

Based on the `task_type` and the nature of the sub-tasks, Chico picks `pair-work`, `sequential-handoff`, or `parallel-synthesis` (see table above).

### Step 3 — Agent invocation

For every agent invoked, the **prompt sent** must contain this dedicated Discussion Board section:

```
DISCUSSION BOARD
You work as a mini-team on this task. The shared board is at:
<board_path>

Before you work:
1. Read this file in full — see what other agents have already written.
2. Build your contribution in your style, your expertise, your dedicated role.
3. Write your section in the board with the format:

   ## [<HH:MM_now>] <Your persona name> — <your role in this task>

   <Your contribution>

   <If you recommend another agent: "> I recommend that <Persona> intervene on <point>".>

4. NEVER rewrite other agents' work — enrich or constructively critique.
5. Respect your phase membership and your usual outputs (see _chico/agency-roles.md).

YOUR ROLE IN THIS MINI-TEAM
<precise role as defined by Chico>
```

### Step 4 — Final synthesis

Once all agents have spoken, Chico re-reads the full board and writes the "Final decision" section:
- Synthesis in 2-5 lines
- Chosen path + rationale
- Next action(s) with who executes
- List of artifacts produced with paths

Then Chico marks the board `Status: closed` and **indexes it via RAG**:
```
chico_memory_index("_chico-output/discussions/<task-id>.md")
```

### Step 5 — Report to the user

Chico synthesizes for the user in max 5 lines:
- Which mini-team worked
- Pattern used
- Decision retained
- Produced artifacts (with paths)
- Next step

## Anti-patterns

- ❌ Spinning up a mini-team on a trivial task → unnecessary overhead, frustration
- ❌ Mini-team too large (> 5 agents) → noise > signal, the Discussion Board becomes unreadable
- ❌ Forgetting to index the board via RAG → the task memory is lost for future sessions
- ❌ Letting agents rewrite each other's work → loss of contributions, ego clash
- ❌ Parallel pattern without initial context in the board → everyone goes off in a different direction

## Canonical examples (from `agency-roles.md`)

### Bug investigation
**Trio**: Tracker (lead) + Carson (hypothesis brainstorm) + Murat++ (test validation)
**Pattern**: Sequential handoff
**Discussion Board example**: `bug-login-redirect-2026-04-27-1.md`

### From-scratch architecture
**Quartet**: Winston++ (lead) + Atlas (data) + Sentinel (security) + Beacon (perf)
**Pattern**: Parallel synthesis (each produces its angle, Winston++ synthesizes in tech-architecture.md)

### Ideation for a new project
**Creative trio**: Carson + Dr. Quinn + Victor
**Pattern**: Parallel synthesis (Crazy 8s / TRIZ / Blue Ocean)

### Frontend impl of a feature
**Trio**: Pixel (components) + Guardian (forms) + Navigator (pages/flow)
**Pattern**: Sequential handoff (Pixel atoms → Guardian forms → Navigator pages)

### Full audit of an existing project
**Quartet**: Forge (debt) + Murat++ (tests) + Sentinel (security) + Beacon (perf)
**Pattern**: Parallel synthesis

## On Activation

When Chico invokes this skill, it runs steps 1-5 above directly in its reasoning loop. This SKILL.md is above all a **procedural reference** — Chico uses it as an execution manual.
