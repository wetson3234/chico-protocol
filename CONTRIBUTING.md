# Contributing to Chico Protocol

Thanks for considering a contribution. Chico Protocol is a structured agent framework, and that structure is what makes it work — so most contributions follow well-defined patterns rather than free-form additions.

This guide walks through the repository layout, the three most common contribution types (new agent, new skill, new module), the manifest discipline, how to test locally, and the PR process.

---

## Repository structure

```
chico-protocol/
├── README.md                 ← public-facing landing
├── LICENSE                   ← MIT
├── CHANGELOG.md              ← keep-a-changelog format
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CONTRIBUTING.md           ← this file
├── .gitignore
├── .npmignore
├── .github/                  ← issue templates, PR template, workflows
├── docs/                     ← user-facing documentation
│   ├── getting-started.md
│   ├── architecture.md
│   ├── agents.md
│   ├── modules.md
│   ├── verification.md
│   ├── memory-system.md
│   └── playbook.md
├── src/
│   └── template/             ← the payload the installer copies into user projects
│       ├── .claude/
│       │   ├── CLAUDE.md
│       │   ├── settings.json
│       │   ├── skills/       ← every agent + every workflow lives here as SKILL.md
│       │   ├── scripts/
│       │   │   └── browser-verify.mjs
│       │   ├── hooks/
│       │   │   └── pre-bash.sh
│       │   └── mcp-servers/
│       │       └── chico-rag/
│       └── _chico/
│           ├── _config/      ← manifests (agent, skill, help, installation)
│           ├── core/         core/cmm/cis/tea/gds/cmb/web/verify
│           ├── memory/       ← per-persona memory files
│           ├── templates/    ← output templates
│           └── agency-playbook.md
└── tools/
    └── installer/
        └── chico-cli.js      ← the npx entry point
```

The **source of truth** for what's installable lives in `src/template/`. The installer is a thin layer that copies this template into a target project, substitutes the user's preferences into `manifest.yaml`, and creates `_chico-output/` directories.

---

## Contribution types

### 1. Adding a new agent

An agent is a `SKILL.md` file plus optional `references/*.md` files, registered in two CSV manifests.

**Use the built-in Agent Builder for this.** Run Claude Code inside a project that has Chico Protocol installed and invoke:

```
/chico-agent-builder
```

It walks you through the conversational discovery: persona name, role, module, type (Memory / Stateless / Autonomous), capabilities, and writes a compliant SKILL.md.

If you prefer to write by hand, the structure is:

```
src/template/.claude/skills/chico-<agent-id>/
├── SKILL.md                  ← persona, identity, communication style, capabilities, activation
└── references/               ← optional, for long reference docs
    └── <topic>.md
```

The `SKILL.md` must include YAML frontmatter:

```yaml
---
name: chico-<agent-id>
description: <One-line role description>. Use when the user asks to talk to <Persona> or requests the <role>.
---
```

After writing the agent, **update both manifests**:

- `src/template/_chico/_config/agent-manifest.csv` — add the canonical row
- `src/template/_chico/_config/skill-manifest.csv` — add the skill entry

If the new agent should appear in the address book the orchestrator reads when routing, also add a row to `src/template/.claude/skills/chico/references/agent-routing.md`.

### 2. Adding a new skill (workflow)

A skill is a single-purpose workflow (e.g. `chico-create-prd`, `chico-verify-browser`). It lives at:

```
src/template/.claude/skills/chico-<skill-id>/
└── SKILL.md
```

Same frontmatter shape as an agent. Skills don't have a persona — they're activated by a trigger phrase, do their job, and return.

Update `skill-manifest.csv` and, if relevant, `src/template/_chico/_config/chico-help.csv` so `/chico-help` surfaces it in the right context.

### 3. Adding a new module

A module is a thematic grouping of agents and skills (the existing modules are `core`, `cmm`, `cis`, `tea`, `gds`, `cmb`, `web`, `verify`). Adding one is a heavier operation.

**Use the built-in Module Builder:**

```
/chico-module-builder
```

It generates the directory structure, the `config.yaml`, the boilerplate, and registers the module in `manifest.yaml`.

Manual structure:

```
src/template/_chico/<module-code>/
├── config.yaml               ← module-specific configuration (paths, language, output destinations)
└── <any module-specific knowledge bases or templates>
```

Add the module to the table in `README.md` and to `docs/modules.md`.

---

## Manifest discipline

The CSV manifests are the orchestrator's address book. **Any new agent, skill, or module that isn't registered there is invisible to Chico.**

Three files to keep in sync:

| File | Purpose |
|---|---|
| `src/template/_chico/_config/agent-manifest.csv` | All 42+ agents — canonical ID, persona, module, role, type, path |
| `src/template/_chico/_config/skill-manifest.csv` | All 130+ skills — ID, name, description, module, category, path |
| `src/template/_chico/_config/chico-help.csv` | Contextual help — what to do when the user is in phase X |

Conventions for CSV rows:

- Use the exact `canonicalId` as the directory name under `.claude/skills/` (e.g. `chico-web-auth` → `src/template/.claude/skills/chico-web-auth/`)
- The `path` column is project-relative once installed (`.claude/skills/chico-web-auth`)
- For agents, the `type` column is one of `Memory`, `Stateless`, `Autonomous`
- For agents in the CMM pipeline, the `phase` column maps to `P01`–`P08` from the agency playbook
- Encoding: UTF-8 without BOM. Line endings: LF
- No trailing whitespace, no quoted fields unless necessary

---

## Local testing

The installer is a node CLI. To test it against your changes:

```bash
# From inside chico-protocol/
npm link

# Now in any empty test directory:
mkdir /tmp/chico-test && cd /tmp/chico-test
chico-protocol install
```

This runs your local `tools/installer/chico-cli.js` against the local `src/template/` — verify that:

1. The `.claude/` and `_chico/` trees are copied correctly
2. The `manifest.yaml` substitution works (user name, language, paths)
3. The `_chico-output/` directories are created
4. The CSV manifests resolve to the actual files

When done:

```bash
npm unlink chico-protocol
```

### Manual verification on a fresh project

Open the test project in Claude Code and try:

```
/chico hello, qu'est-ce que tu peux faire ?
```

Chico should greet you, read the three manifests, and propose actions. If a manifest entry doesn't resolve to a real file, Chico will surface the error explicitly.

---

## Writing style for agent personas

Agents are characters. Each one has:

- A **name** (Mary++, Pixel, Sentinel...) — sticks in users' memory
- A **role** in one short noun phrase (e.g. "Auth & Security Engineer")
- A **communication style** paragraph in their SKILL.md — first-person voice, distinctive tone
- A **principles** list — 5-8 bullet points that constrain their judgment

Keep voices distinct. Sentinel sounds different from Pixel sounds different from Frida. This is on purpose — it helps users (and the orchestrator) remember who does what.

---

## Pull request process

1. **Fork and branch.** Branch names: `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`
2. **One concern per PR.** A new agent in its own PR. A bug fix in its own PR. Bundling makes review hard.
3. **Update the CHANGELOG.** Add an entry under `## [Unreleased]` describing what changed (Added / Changed / Deprecated / Removed / Fixed / Security).
4. **Update the manifests.** If you added or moved a skill or agent, the CSVs must reflect it. CI will fail otherwise.
5. **Lint locally.** No specific linter beyond markdown sanity and CSV column alignment — use your editor.
6. **Open the PR.** Use the template. Describe the user-facing effect, not just the diff.
7. **Respond to review.** Reviewers are looking for: persona clarity, manifest consistency, no broken links, no introduced TODOs.

---

## What we won't accept

- Agents that overlap heavily with existing ones (more than ~70% of the role). Improve the existing agent instead.
- Skills that bypass the manifest system or invent new conventions
- Documentation files that contradict the README or CLAUDE.md
- Personas without a distinct voice ("yet another helpful assistant")
- Any code with TODOs, mocks, or placeholders — Chico's R0–R9 rules apply to its own codebase too

---

## Questions?

Open an issue with the `question` label. For security disclosures, see [SECURITY.md](SECURITY.md).
