# Getting started with Chico Protocol

This guide walks you through installing Chico Protocol into a new or existing project, your first `/chico` interaction, and the conceptual model for where everything lives.

If you just want the one-liner: run `npx chico-protocol install` in your project directory and follow the prompts.

---

## 1. Prerequisites

Before installing, make sure you have:

- **Claude Code** — the official Anthropic CLI or IDE extension. Install instructions at [docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code).
- **Node.js 20+** — required by the installer and by Playwright (used internally by the browser verification pass). Verify with `node --version`.
- **Git** (recommended) — every change an agent makes to your project is easier to review when tracked in version control. Run `git init` first if your project isn't already a repo.

Optional, for the semantic memory layer:

- **Python 3.11+** with `pip` — for the `chico-rag` MCP server
- **Qdrant** running somewhere reachable (local Docker or a small VPS via SSH tunnel)

The base system works fully without the optional dependencies. You can enable the RAG layer later when you have a larger codebase.

---

## 2. Installation

### Interactive (recommended for first install)

```bash
cd /path/to/your-project
npx chico-protocol install
```

The installer asks a handful of questions:

- **Your name** — used for greetings (e.g. "Welcome back, Alice")
- **Communication language** — the language agents will speak to you in (English, French, etc.)
- **Document output language** — the language for generated artifacts (PRDs, READMEs, architecture docs)
- **Modules to install** — defaults to all 8, but you can deselect modules you don't need (e.g. skip GDS if you're not building games)
- **Enable semantic RAG?** — yes/no, defaults to no

Defaults are sensible. You can press Enter through the whole flow if you want everything.

### Non-interactive (CI, scripted setups)

```bash
npx chico-protocol install \
  --user-name "Alice" \
  --communication-language "français" \
  --document-output-language "français" \
  --modules all \
  --no-rag \
  --yes
```

The `--yes` flag confirms all defaults and writes without prompting. Useful in containers, CI pipelines, or when scripting team-wide rollouts.

### Updating an existing install

```bash
npx chico-protocol install --update
```

This refreshes the skills and manifests but preserves your `_chico/memory/` files (agent sanctums) and your `_chico-output/` (generated artifacts). Your config is also preserved unless you pass `--reset-config`.

---

## 3. What the installer creates

After running the install, your project has these new directories and files:

```
your-project/
├── .claude/
│   ├── CLAUDE.md                  ← top-level Chico configuration the model reads
│   ├── settings.json              ← permissions, MCP server registrations
│   ├── skills/                    ← 130+ skills, each in its own folder
│   │   ├── chico/                 ←   the orchestrator
│   │   ├── chico-agent-analyst/   ←   Mary++ (business analyst)
│   │   ├── chico-agent-dev/       ←   Amelia++ (full-stack dev lead)
│   │   ├── chico-web-auth/        ←   Sentinel (auth & security)
│   │   ├── chico-verify-browser/  ←   browser verification skill
│   │   └── ...                    ←   126 more
│   ├── scripts/
│   │   └── browser-verify.mjs     ← Playwright harness for the browser pass
│   ├── hooks/
│   │   └── pre-bash.sh            ← logs bash commands, blocks dangerous ones
│   └── mcp-servers/
│       └── chico-rag/             ← optional RAG MCP server (Python)
│
├── _chico/                        ← module configurations, manifests, memory, templates
│   ├── _config/
│   │   ├── manifest.yaml          ← installation record (modules, version, date, user prefs)
│   │   ├── agent-manifest.csv     ← address book — all 42 agents
│   │   ├── skill-manifest.csv     ← address book — all 130 skills
│   │   └── chico-help.csv         ← contextual help mapping
│   ├── core/                      ← per-module config.yaml files
│   ├── cmm/
│   ├── cis/
│   ├── tea/
│   ├── gds/
│   ├── cmb/
│   ├── web/
│   ├── verify/
│   ├── memory/                    ← per-persona memory files (created on demand)
│   │   └── _TEMPLATE.md
│   ├── templates/                 ← output templates (architecture, business, product, deploy)
│   └── agency-playbook.md         ← Discover → Run methodology, indexed by Chico
│
└── _chico-output/                 ← everything agents produce lands here
    ├── chico-state.md             ← orchestrator's state file (auto-created on first /chico turn)
    ├── planning-artifacts/        ← phase 01-03 outputs
    ├── implementation-artifacts/  ← phase 04+ outputs
    ├── reports/                   ← verification pass reports
    │   ├── screenshots/           ← browser-verify screenshots
    │   └── bash-log.md            ← pre-bash hook log
    ├── testing-artifacts/         ← test plans, traceability matrices
    └── discussions/               ← mini-team discussion boards (when multiple agents collaborate)
```

The two trees are intentionally separated:

- `.claude/` and `_chico/` are the **system** (install-time, read-only for the most part)
- `_chico-output/` is **your project's output** (gitignored by default, regenerated by agents)

You should commit `.claude/` and `_chico/` to version control. You can choose whether to commit `_chico-output/` — most users keep planning artifacts but gitignore reports and screenshots.

---

## 4. Your first `/chico`

Open Claude Code in your project directory. Type one of:

### Example 1 — Debug

```
/chico the login redirects to /undefined after submit, can you investigate?
```

Chico will classify this as `debug`, route to **Tracker** (production bug investigator), and likely open a mini-team with **Carson** (brainstorm 5 hypotheses) and **Murat++** (regression test design). You'll get back a short synthesis and a path to a discussion board where you can see the reasoning.

### Example 2 — Modification

```
/chico add a "dark mode" toggle to the settings page, persist user preference
```

Chico classifies this as `modif`, routes to **Pixel** (component library) for the toggle and to **Amelia++** (dev lead) to wire the persistence. Both run in parallel. You get back a list of files changed and a one-line "next step" suggestion.

### Example 3 — From scratch

```
/chico build me a landing page for a tax accountant in Brussels —
brand should feel trustworthy, French copy, contact form, no blog
```

Chico classifies this as `from-scratch site vitrine` and activates the agency pipeline: **Frida** for brand direction, **Sally++** for UX, **Oscar** for copy, **Pixel** for components, **Navigator** for the page assembly, **Beacon** for SEO and Lighthouse. It runs the appropriate verification passes at the end.

For each pattern, see the [agency playbook](playbook.md) for the full phase mapping.

---

## 5. Understanding `chico-state.md`

After every `/chico` invocation, the orchestrator writes (or appends to) `_chico-output/chico-state.md`. This is its working memory — the file it reads at the start of the next turn so the conversation resumes cleanly.

Structure:

```markdown
# Chico — Session state

**Initial request**: build me a billing dashboard
**Started**: 2026-05-19 14:02
**Last turn**: 2026-05-19 14:47 — Turn 3

## Turn 1 — 2026-05-19 14:02
**Request**: build me a billing dashboard
**Category**: from-scratch
**Strategy**: parallel (3 agents)
**Agents activated**:
- Mary++ (chico-agent-analyst) — produced personas.md (3 personas)
- Frida (chico-web-brand) — produced brand-direction.md
- Winston++ (chico-agent-architect) — produced tech-architecture.md
**State**: completed
**Next proposed step**: review the personas before we lock the brand
```

You can read this file at any time to know where you stand. You can also edit it manually if you want to redirect the orchestrator — Chico re-reads it on every turn.

When you type `/chico` with no arguments, Chico opens this file, summarizes where you are, and proposes the next step.

---

## 6. Where to look when you're lost

A few quick anchors:

- **"What agents exist?"** — `_chico/_config/agent-manifest.csv` (or [docs/agents.md](agents.md))
- **"What skills can I invoke directly?"** — `_chico/_config/skill-manifest.csv`
- **"I'm in the middle of a project, what now?"** — run `/chico-help`, it inspects your state and suggests next steps
- **"What is Chico thinking right now?"** — read `_chico-output/chico-state.md`
- **"How is a complex task broken down?"** — read `_chico-output/discussions/<task-id>.md` (the mini-team board)
- **"Which methodology applies to this kind of project?"** — read `_chico/agency-playbook.md`

If a manifest entry points to a file that doesn't exist, Chico will tell you explicitly rather than making something up. That's by design — the framework refuses to fake it.

---

## 7. Next steps

Once you've run a few `/chico` interactions and gotten comfortable:

- Read the [agency playbook](playbook.md) to understand how Chico decides which phases to activate
- Skim the [agent catalog](agents.md) so you start recognizing personas
- Set up the optional [semantic RAG layer](memory-system.md) if your project has more than ~20 artifacts to keep in semantic memory
- Run a [verification pass](verification.md) on something you built before Chico — you'll be surprised what surfaces

Welcome aboard.
