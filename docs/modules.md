# Module reference

Chico Protocol is organized into **8 thematic modules**. Each module groups a coherent set of agents and skills, with its own `config.yaml` and its own conventions. You can install all 8 (the default) or pick a subset — for example, skip GDS if you're not making games.

Each module's installed config lives at `_chico/<module-code>/config.yaml`.

---

## Core — `core`

> Utility skills that don't belong to a specific domain.

**Description.** The Core module hosts cross-cutting utilities the other modules depend on: brainstorming facilitation, editorial review, the orchestrator's own skill (`chico`), help, distillation, document indexing, party mode (multi-agent group discussions), adversarial review, edge-case hunting.

**Agents included.**

- **Chico** (`chico`) — the single-entry orchestrator. Technically a "skill" but functionally the conductor of every interaction.

**Skills included (selected).**

- `chico-brainstorming` — facilitate brainstorm sessions
- `chico-editorial-review-prose` — clinical copy edit
- `chico-editorial-review-structure` — structural editing
- `chico-distillator` — lossless LLM-optimized document compression
- `chico-party-mode` — multi-agent group discussions
- `chico-review-adversarial` — cynical review
- `chico-review-edge-case` — exhaustive edge-case sweep
- `chico-advanced-elicitation` — push the LLM to reconsider and improve
- `chico-shard-doc` — split large markdown
- `chico-index-docs` — generate/update index.md
- `chico-help` — contextual recommendations

**Typical use case.** You always have Core installed — it's the substrate. Invoke individual skills when you need them (e.g. `/chico-brainstorming` when you want a structured ideation session without invoking a full mini-team).

---

## Chico Protocol — `cmm`

> Product development pipeline: analysis → planning → solutioning → implementation.

**Description.** The CMM module is the central product development module. It contains the 7 fused Memory agents (Mary++, John++, Sally++, Winston++, Amelia++, Paige++) plus the workflows that drive the discovery → define → design → develop pipeline.

**Agents included.**

- **Mary++** (`chico-agent-analyst`) — Strategic Business Intelligence Lead
- **John++** (`chico-agent-pm`) — Product & Growth Strategist
- **Sally++** (`chico-agent-ux-designer`) — UX/UI & Accessibility Architect
- **Winston++** (`chico-agent-architect`) — Full-Stack Architecture Lead
- **Amelia++** (`chico-agent-dev`) — Full-Stack Dev Lead & Orchestrator
- **Paige++** (`chico-agent-tech-writer`) — Documentation & Knowledge Lead

**Skills included (selected).**

- `chico-create-prd` — 14-step PRD creation workflow
- `chico-edit-prd`, `chico-validate-prd`
- `chico-create-ux-design`, `chico-create-architecture`
- `chico-create-epics-and-stories`, `chico-create-story`
- `chico-dev-story`, `chico-quick-dev`
- `chico-code-review` (orchestrated multi-layer review)
- `chico-sprint-planning`, `chico-sprint-status`, `chico-correct-course`, `chico-retrospective`
- `chico-check-implementation-readiness`, `chico-checkpoint-preview`
- `chico-prfaq` (Working Backwards challenge)
- `chico-product-brief`, `chico-document-project`, `chico-generate-project-context`
- `chico-market-research`, `chico-domain-research`, `chico-technical-research`

**Typical use case.** Any serious product engagement. From-scratch SaaS, B2B web apps, complex feature additions to existing products.

---

## Creative Intelligence — `cis`

> Innovation, creativity, storytelling, design thinking, presentations.

**Description.** The CIS module is the "how do we think about this?" toolkit. It contains 6 creative coaches and the workflow skills that wrap their methodologies.

**Agents included.**

- **Carson** (`chico-cis-brainstorming-coach`) — Crazy 8s, SCAMPER, HMW, Six Hats
- **Dr. Quinn** (`chico-cis-creative-problem-solver`) — TRIZ, Theory of Constraints
- **Maya** (`chico-cis-design-thinking-coach`) — Stanford d.school methodology
- **Victor** (`chico-cis-innovation-strategist`) — Blue Ocean + JTBD
- **Caravaggio** (`chico-cis-presentation-master`) — slides + pitch decks
- **Sophia** (`chico-cis-storyteller`) — narrative frameworks

**Skills included (selected).**

- `chico-cis-brainstorming` — facilitate brainstorm with game-specific techniques
- `chico-cis-design-thinking` — guided design thinking workshops
- `chico-cis-innovation-strategy` — identify disruption opportunities
- `chico-cis-problem-solving` — apply systematic problem-solving methodologies
- `chico-cis-storytelling` — craft narratives using frameworks

**Typical use case.** Stuck on a problem and the solution isn't obvious. Need to ideate. Need a pitch deck. Need a brand story. Need to find a Blue Ocean angle.

---

## Test Architecture — `tea`

> Testing methodology, QA, verification passes, audits.

**Description.** The TEA module is the quality module. Murat++ lives here, plus 9 testarch-* skills that cover the full testing spectrum from framework setup to traceability matrices.

**Agents included.**

- **Murat++** (`chico-tea`) — Master QA & Verification Architect

**Skills included.**

- `chico-testarch-framework` — initialize Playwright or Cypress
- `chico-testarch-atdd` — generate red-phase acceptance test scaffolds
- `chico-testarch-automate` — expand test automation coverage
- `chico-testarch-ci` — scaffold CI/CD quality pipeline
- `chico-testarch-nfr` — assess non-functional requirements (perf/sec/reliability)
- `chico-testarch-test-design` — create system or epic-level test plans
- `chico-testarch-test-review` — review test quality
- `chico-testarch-trace` — generate traceability matrix + quality gate decision
- `chico-teach-me-testing` — progressive testing education

**Typical use case.** Before launch when test coverage matters. When NFRs (performance, security, reliability) need a structured audit. When you need a traceability matrix linking requirements to tests.

---

## Game Dev Studio — `gds`

> Game development specialist workflows and agents.

**Description.** The GDS module is for game projects (Unity, Unreal, Godot, or web games). It mirrors the CMM pipeline but with game-specific methodologies — GDDs instead of PRDs, narrative design, mechanics design, playtesting.

**Agents included.**

- **Cloud Dragonborn** (`chico-gds-game-architect`) — Game Systems Architect
- **Samus Shepard** (`chico-gds-game-designer`) — Lead Game Designer
- **Link Freeman** (`chico-gds-game-dev`) — Senior Game Developer
- **Indie** (`chico-gds-game-solo-dev`) — Solo Dev / Quick Flow
- **Paige (GDS)** (`chico-gds-tech-writer`) — Technical Writer (Game)

**Skills included (selected).**

- `chico-gds-create-game-brief`, `chico-gds-create-gdd`, `chico-gds-edit-gdd`, `chico-gds-validate-gdd`
- `chico-gds-create-narrative` — narrative design with structure + world-building
- `chico-gds-brainstorm-game` — game-specific brainstorming
- `chico-gds-game-architecture` — scale-adaptive game architecture
- `chico-gds-create-ux-design` — game UI/HUD design
- `chico-gds-create-epics-and-stories`, `chico-gds-create-story`, `chico-gds-dev-story`, `chico-gds-quick-dev`
- `chico-gds-code-review`, `chico-gds-sprint-planning`, `chico-gds-sprint-status`, `chico-gds-correct-course`, `chico-gds-retrospective`
- `chico-gds-test-framework`, `chico-gds-test-design`, `chico-gds-test-automate`, `chico-gds-test-review`, `chico-gds-e2e-scaffold`
- `chico-gds-performance-test`, `chico-gds-playtest-plan`
- `chico-gds-document-project`, `chico-gds-generate-project-context`, `chico-gds-domain-research`

**Typical use case.** Anything game development. Skip this module if you don't make games — it adds ~30 skills you won't use.

---

## Chico Builder — `cmb`

> Agent, module, and workflow creation framework.

**Description.** The CMB module is meta — it's how you extend Chico itself. It contains three builder agents and a setup skill.

**Agents included.**

- **Agent Builder** (`chico-agent-builder`) — create/edit/analyze agents
- **Module Builder** (`chico-module-builder`) — plan/create/validate modules
- **Workflow Builder** (`chico-workflow-builder`) — build/convert/analyze workflows

**Skills included.**

- `chico-bmb-setup` — set up the Chico Builder module in a project

**Typical use case.** When you want a custom specialist that doesn't exist (e.g. a domain-specific compliance agent for your industry). When you're forking Chico Protocol for your team and want to add proprietary modules. When you need a one-off project-specific workflow exposed as a slash command.

---

## Web Pipeline — `web`

> Specialized web dev agents: brand, copy, data, auth, UI, devops, post-launch.

**Description.** The Web module is where the heavy lifting happens for web projects. It contains 20 stateless specialists covering every layer of a modern Next.js stack: brand, copy, data, auth, UI components, forms, user flows, admin, integrations, realtime, SEO/perf, Docker, CI/CD, cloud, analytics, monitoring, growth, bug hunting, feature planning, refactoring.

**Agents included.**

| Agent | Skill ID | Role |
|---|---|---|
| Frida | `chico-web-brand` | Brand Identity Architect |
| Oscar | `chico-web-copy` | Voice & Copy Strategist |
| Atlas | `chico-web-data-layer` | Data Architecture Engineer |
| Sentinel | `chico-web-auth` | Auth & Security Engineer |
| Pixel | `chico-web-ui-components` | Component Library Architect |
| Guardian | `chico-web-forms` | Interaction Integrity Agent |
| Navigator | `chico-web-user-flows` | User Journey Orchestrator |
| Console | `chico-web-admin` | Admin Interface Builder |
| Bridge | `chico-web-integration` | External Service Integrator |
| Pulse | `chico-web-realtime` | Realtime & Notifications Engineer |
| Beacon | `chico-web-seo-perf` | SEO & Web Performance Engineer |
| Harbor | `chico-web-docker` | Container & Orchestration Engineer |
| Pipeline | `chico-web-cicd` | CI/CD & Automation Engineer |
| Nimbus | `chico-web-cloud` | Cloud Infrastructure Architect |
| Iris | `chico-web-analytics` | Analytics & Privacy Engineer |
| Sentry | `chico-web-monitoring` | Observability & Alerting Engineer |
| Catalyst | `chico-web-growth` | Growth Experimentation Lead |
| Tracker | `chico-web-bug-hunter` | Production Bug Investigator |
| Compass | `chico-web-feature-planner` | Feature Roadmap Strategist |
| Forge | `chico-web-refactor` | Technical Debt Reducer |

**Skills included.** These agents are themselves the skills (one SKILL.md per persona). The Web module is unusual in that it's agent-heavy rather than workflow-heavy — most work is invoking a specialist directly or via Amelia++.

**Typical use case.** Web projects of any size. You'll likely have all 20 agents on standby and use Amelia++ to coordinate them.

---

## Verification — `verify`

> 5 individual verification passes + browser-verify Playwright infrastructure.

**Description.** The Verify module contains the five focused verification passes and the Playwright harness that powers Pass 4. Each pass is a skill that can be invoked individually or chained.

**Agents included.** None directly — verification skills can be invoked by the user, by Chico, or by Murat++ depending on context.

**Skills included.**

- `chico-verify-concept` (Pass 0) — Brief fidelity verification
- `chico-verify-production` (Pass 2) — Build + imports + assets verification
- `chico-verify-functional` (Pass 3) — Zero dead elements, zero mocks, complete flows
- `chico-verify-browser` (Pass 4) — Real Playwright browser testing on Chromium
- `chico-verify-completude` (Pass 5) — Zero TODO/FIXME/placeholder/mock/lorem

**Infrastructure.** `.claude/scripts/browser-verify.mjs` is the Playwright runner that powers Pass 4. It boots the app in headless Chromium, navigates, captures console errors, captures network failures, captures JS exceptions, takes screenshots, and writes a structured report.

**Typical use case.** Before merge, before launch, after large refactors. Pass 4 is the highest-signal one — it catches what static analysis misses.

See [docs/verification.md](verification.md) for the full methodology.

---

## How modules combine

Most real projects use **Core + CMM + Web + TEA + Verify**. Add CIS when you need creative coaching, CMB when you want to extend the system, GDS when you make games.

The orchestrator reads `_chico/_config/manifest.yaml` to know which modules are installed and routes only to skills that exist. You won't get errors invoking Chico after a partial install — uninstalled modules simply don't appear in the address book.
