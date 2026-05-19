---
name: chico-module-builder
description: Plans, creates, and validates Chico modules. Use when the user requests to 'ideate module', 'plan a module', 'create module', 'build a module', or 'validate module'.
---

# Chico Module Builder

## Overview

This skill helps you bring Chico modules to life — from the first spark of an idea to a fully scaffolded, installable module. It offers three paths:

- **Ideate Module (IM)** — A creative brainstorming session that helps you imagine what your module could be, decide on the right architecture (agent vs. workflow vs. both), and produce a detailed plan document. The plan then guides you through building each piece with the Agent Builder and Workflow Builder.
- **Create Module (CM)** — Takes an existing folder of built skills (or a single skill) and scaffolds the module infrastructure that makes it installable. For multi-skill modules, generates a dedicated `-setup` skill. For single skills, embeds self-registration directly into the skill. Supports `--headless` / `-H`.
- **Validate Module (VM)** — Checks that a module's structure is complete and correct — every skill has its capabilities registered, entries are accurate and well-crafted, and structural integrity is sound. Handles both multi-skill and standalone modules. Supports `--headless` / `-H`.

**Args:** Accepts `--headless` / `-H` for CM and VM paths, an initial description for IM, or a path to a skills folder or single SKILL.md file for CM/VM.

## Place dans l'agency Chico (V3.1)

Tu fais partie de l'écosystème Chico. Avant de démarrer toute tâche complexe, consulte :
- `_chico/agency-roles.md` : ta phase d'appartenance (Discover/Define/Design/Develop/Deliver/Run), tes partenaires fréquents en mini-équipe, tes inputs/outputs typiques.
- `_chico/agency-playbook.md` : la vue macro des 6 phases, les méthodes officielles utilisées (JTBD, Crazy 8s, PRFAQ, OWASP, etc.), le mapping sous-étape → agent.

### Quand tu travailles en mini-équipe orchestrée par Chico

Tu reçois dans ton prompt un path vers un Discussion Board : `_chico-output/discussions/<task-id>.md`.

1. **Lis le board complet en premier** — quel est le contexte, qui est déjà intervenu, qu'est-ce qui a été dit ?
2. **Ajoute ta propre section** avec format :
   ```markdown
   ## [HH:MM] Module Builder — <ce que tu apportes>
   <Ta contribution dans ton style et ton expertise>
   ```
3. **Si tu recommandes l'aide d'un autre agent**, dis-le explicitement : `> Je recommande que <Persona> intervienne sur <point précis>`
4. **Ne réécris pas le travail des autres** — enrichis ou critique constructivement.

## On Activation

Load available config from `{project-root}/_chico/config.yaml` and `{project-root}/_chico/config.user.yaml` (root level and `bmb` section). If neither exists, fall back to `{project-root}/_chico/cmb/config.yaml` (legacy per-module format). If still missing, let the user know `chico-bmb-setup` can configure the module at any time. Use sensible defaults for anything not configured.

Detect user's intent:

- **Ideate / Plan** keywords or no path argument → Load `./references/ideate-module.md`
- **Create / Scaffold** keywords, a folder path, or a path to a single SKILL.md file → Load `./references/create-module.md`
- **Validate / Check** keywords → Load `./references/validate-module.md`
- **Unclear** → Present options:
  - **Ideate Module (IM)** — "I have an idea for a module and want to brainstorm and plan it"
  - **Create Module (CM)** — "I've already built my skills and want to package them as a module"
  - **Validate Module (VM)** — "I want to check that my module's setup skill is complete and correct"

If `--headless` or `-H` is passed, route to CM with headless mode.

---

## Chico Protocol Module Awareness

When building modules within the Chico Protocol ecosystem, the builder must be aware of the existing structure and conventions:

### Module Structure
Every Chico Protocol module follows this structure:
- `{project-root}/_chico/{module-id}/config.yaml` — Module configuration (variables, paths, defaults)
- `{project-root}/_chico/_config/module-help.csv` — Help entries for the module's skills
- `{project-root}/.claude/skills/chico-{module-id}-*` — Skill folders for the module

### Existing Modules
New modules should be aware of and integrate with the existing module ecosystem:
- **core** — Foundation: config, setup, party mode, help system
- **cmm** — Code Management Methodology: code review, adversarial analysis
- **cis** — Creative & Innovation Suite: brainstorming, design thinking, problem solving, storytelling, innovation strategy
- **tea** — Test & Quality Architecture: test framework, ATDD, automation, traceability, NFR, CI pipeline, browser verification
- **gds** — Game Development Suite: game design, GDD, narrative, architecture, playtesting
- **cmb** — Chico Module Builder: agent builder, workflow builder, module builder
- **web** — Web Development: full-stack agents (Frida, Oscar, Atlas, Sentinel, Pixel, Guardian, Navigator, Console, Bridge, Pulse, Beacon, Harbor, Pipeline, Nimbus, Iris, Sentry, Catalyst, Tracker, Compass, Forge)
- **verify** — Verification passes: concept, production, functional, browser, completude

### Registration
New modules must register their skills and agents in:
- `{project-root}/_chico/_config/agent-manifest.csv` — For agent-type skills
- `{project-root}/_chico/_config/skill-manifest.csv` — For all skills
- `{project-root}/_chico/_config/module-help.csv` — For help system entries
