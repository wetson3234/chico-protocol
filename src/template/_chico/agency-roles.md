# Chico Agency — Roles, phases and partners of each agent

> This page complements `agency-playbook.md` on the **agents** side (who-does-what-with-whom).
> Each agent here finds their **primary phase**, their **frequent partners** in mini-teams, and their **typical outputs**.
> Single source of truth for inter-agent collaboration.

---

## How to read this document

For each agent:
- **Phase(s)**: where they intervene in the extended Double Diamond (Discover → Run)
- **Frequent partners**: who they regularly spin up a mini-team with (3 patterns: pair work, sequential handoff, parallel synthesis — see Chico's SKILL.md)
- **Typical inputs**: what they read to do their work
- **Typical outputs**: what they produce
- **Discussion Board**: example tasks where they are invited

---

## CMM Module (Chico Protocol Core)

### Mary++ — `chico-agent-analyst`
- **Phases**: DISCOVER (heavy) + DEFINE (heavy) + RUN (continuous discovery)
- **Frequent partners**: John++ (vision), Maya (empathy maps), Frida (brand insights), Compass (roadmap input)
- **Inputs**: user brief, interviews, market data
- **Outputs**: `business-brief.md`, `market-analysis.md`, `personas.md`, `competitor-matrix.md`, `business-model-canvas.md`
- **Discussion Board**: initial ideation, repositioning, business audit

### John++ — `chico-agent-pm`
- **Phases**: DEFINE (heavy) + DEVELOP (story mapping) + RUN (roadmap)
- **Frequent partners**: Mary++ (personas), Sally++ (UX), Compass (prioritization), Iris (metrics), Amelia++ (story execution)
- **Inputs**: `personas.md`, `business-brief.md`, `market-analysis.md`
- **Outputs**: `vision.md`, `prfaq.md`, `mvp-scope.md`, `success-metrics.md`, `epics-and-stories.md`
- **Discussion Board**: MVP scoping, feature prioritization, North Star definition

### Sally++ — `chico-agent-ux-designer`
- **Phases**: DEFINE (customer journey) + DESIGN (heavy: IA, wireframes, design system)
- **Frequent partners**: Pixel (components), Frida (brand), Navigator (flows), Oscar (copy), Murat++ (a11y), Maya (empathy → IA)
- **Inputs**: `personas.md`, `vision.md`, `mvp-scope.md`, `brand-strategy.md`
- **Outputs**: `customer-journey.md`, `ux-architecture.md`, `ia-sitemap.md`, `user-flows.md`, `wireframes.md`, `ui-design-system.md`, `a11y-strategy.md`
- **Discussion Board**: design system, UX audit, journey rebuild

### Winston++ — `chico-agent-architect`
- **Phases**: DEVELOP (heavy: tech archi, API, security)
- **Frequent partners**: Atlas (data), Sentinel (security), Beacon (perf), Bridge (integrations), Amelia++ (handoff to impl), Murat++ (NFR)
- **Inputs**: `mvp-scope.md`, `vision.md`, constraints (regulation, load)
- **Outputs**: `tech-architecture.md`, `db-architecture.md`, `api-architecture.md`, `security-architecture.md`, `performance-architecture.md`, ADRs
- **Discussion Board**: stack choice, architecture rebuild, scaling

### Amelia++ — `chico-agent-dev`
- **Phases**: DEVELOP (heavy: implementation, story execution, sprint orchestration)
- **Frequent partners**: Pixel, Atlas, Sentinel, Guardian, Navigator, Console, Bridge, Pulse, Beacon, Murat++ (all web specialists under her direction)
- **Inputs**: `epics-and-stories.md`, `tech-architecture.md`, `design-system.md`, optional static prototype
- **Outputs**: code, file MANIFEST, sprint reports
- **Discussion Board**: sprint planning, complex feature implementation, batch orchestration

### Paige++ — `chico-agent-tech-writer`
- **Phases**: DISCOVER (existing audit / document-project) + DELIVER (docs)
- **Frequent partners**: Winston++ (architecture to document), Bridge (API docs), Amelia++ (code to document)
- **Inputs**: code, architecture, decisions
- **Outputs**: `README.md`, `docs/api.md`, `docs/deployment.md`, `CONTRIBUTING.md`, post-mortems

---

## TEA Module (Test Architecture)

### Murat++ — `chico-tea`
- **Phases**: DESIGN (usability test protocols) + DEVELOP (tests: unit, integration, e2e) + DELIVER (quality gates)
- **Frequent partners**: Beacon (perf), Tracker (regression tests on bugs), Sentinel (security tests), all impl agents for dedicated tests
- **Inputs**: code, stories, NFRs
- **Outputs**: Playwright/Vitest test suites, coverage reports, Lighthouse gates, OWASP audits, verification screenshots
- **Discussion Board**: test strategy, NFR assessment, traceability matrix

---

## WEB Module (Specialists)

### Frida — `chico-web-brand`
- **Phases**: DESIGN (brand identity, voice positioning)
- **Frequent partners**: Sally++ (design system tokens), Oscar (voice & tone), Caravaggio (brand-aligned presentations)
- **Outputs**: `brand-strategy.md` (archetype, palette, typography, voice)
- **Discussion Board**: brand audit, repositioning, visual refresh

### Oscar — `chico-web-copy`
- **Phases**: DESIGN (copy guide) + DELIVER (marketing copy)
- **Frequent partners**: Frida (voice), Sally++ (microcopy integration), Catalyst (growth copy)
- **Outputs**: `copy-guide.md`, headlines, CTAs, microcopy, error messages, i18n

### Atlas — `chico-web-data-layer`
- **Phases**: DEVELOP (Prisma schema, repositories, seeders)
- **Frequent partners**: Winston++ (DB archi), Sentinel (data security), Amelia++ (consume data layer)
- **Outputs**: Prisma schemas, migrations, seeders, repositories, Zod validation schemas

### Sentinel — `chico-web-auth`
- **Phases**: DISCOVER (compliance audit) + DEVELOP (auth flows, RBAC, JWT, password security)
- **Frequent partners**: Winston++ (security archi), Atlas (user model), Murat++ (OWASP audit), Tracker (security incidents)
- **Outputs**: auth providers, middleware, JWT utilities, RBAC config, password hashing

### Pixel — `chico-web-ui-components`
- **Phases**: DESIGN (atoms/molecules/organisms components) + DEVELOP (frontend impl)
- **Frequent partners**: Sally++ (design system specs), Frida (tokens), Guardian (forms), Navigator (pages)
- **Outputs**: React TypeScript components, theme system, dark mode infrastructure

### Guardian — `chico-web-forms`
- **Phases**: DEVELOP (forms, interactions, validation)
- **Frequent partners**: Pixel (input components), Sally++ (forms UX), Bridge (API submission)
- **Outputs**: React Hook Form + Zod forms, modals, dropdowns, accordions, states (loading/error/success)

### Navigator — `chico-web-user-flows`
- **Phases**: DESIGN (flows) + DEVELOP (page routing, end-to-end flows)
- **Frequent partners**: Sally++ (flow specs), Pixel (page components), Sentinel (auth flows), Console (admin flows)
- **Outputs**: 8 core flows (signup, login, main action, dashboard, settings, admin, logout, error), Next.js pages

### Console — `chico-web-admin`
- **Phases**: DEVELOP (admin interface, CRUD, dashboards)
- **Frequent partners**: Atlas (data models), Sentinel (admin auth), Iris (admin analytics), Pixel (data tables)
- **Outputs**: admin dashboard, entity CRUD, user management, statistics

### Bridge — `chico-web-integration`
- **Phases**: DEVELOP (external integrations: email, payment, storage)
- **Frequent partners**: Winston++ (integration architecture), Sentinel (third-party auth services), Pulse (webhooks)
- **Outputs**: Stripe/Resend/S3 connectors, env vars, error handling, fallbacks

### Pulse — `chico-web-realtime`
- **Phases**: DEVELOP (realtime, WebSocket, notifications)
- **Frequent partners**: Atlas (notification model), Bridge (push services), Console (realtime dashboards)
- **Outputs**: WebSocket/SSE setup, notifications system, connection management

### Beacon — `chico-web-seo-perf`
- **Phases**: DEVELOP (perf architecture) + DELIVER (SEO + Lighthouse + structured data)
- **Frequent partners**: Winston++ (perf budget), Pixel (font/image optim), Murat++ (Lighthouse gates), Iris (SEO tracking)
- **Outputs**: metadata, sitemap, robots, JSON-LD, image optim, font optim, code splitting

### Harbor — `chico-web-docker`
- **Phases**: DEVELOP (Docker setup) + DELIVER (production containers)
- **Frequent partners**: Pipeline (CI/CD), Nimbus (deployment), Atlas (DB containers)
- **Outputs**: multi-stage Dockerfile, docker-compose.yml, .dockerignore

### Pipeline — `chico-web-cicd`
- **Phases**: DEVELOP (CI/CD setup) + DELIVER (deploy automation)
- **Frequent partners**: Harbor, Nimbus, Murat++ (test automation in CI), Sentinel (security scans)
- **Outputs**: GitHub Actions workflows, Dependabot config, preview deploys

### Nimbus — `chico-web-cloud`
- **Phases**: DEVELOP (cloud infra) + DELIVER (production deploy)
- **Frequent partners**: Harbor, Pipeline, Atlas (DB hosting), Sentry (monitoring infra)
- **Outputs**: IaC, CDN config, DNS, SSL, backup strategy

### Iris — `chico-web-analytics`
- **Phases**: DELIVER (analytics setup) + RUN (funnels, dashboards, GDPR)
- **Frequent partners**: John++ (KPI definition), Catalyst (growth metrics), Sentry (technical metrics)
- **Outputs**: Plausible/PostHog/GA4 setup, event tracking plan, funnels, dashboards, privacy policy

### Sentry — `chico-web-monitoring`
- **Phases**: DELIVER (monitoring setup) + RUN (alerts, incidents)
- **Frequent partners**: Tracker (incidents from alerts), Iris (metrics overlap), Nimbus (infra alerts)
- **Outputs**: Sentry config, uptime monitoring, structured logs, alert rules, runbooks

### Catalyst — `chico-web-growth`
- **Phases**: DELIVER (soft launch) + RUN (growth experiments, A/B, referral)
- **Frequent partners**: John++ (growth strategy), Iris (metrics), Oscar (growth copy), Compass (growth feature prioritization)
- **Outputs**: A/B framework, onboarding optim, referral mechanics, email automation, growth experiments

### Tracker — `chico-web-bug-hunter`
- **Phases**: RUN (bug investigation, root cause, post-mortems)
- **Frequent partners**: Carson (brainstorm cause hypotheses), Murat++ (regression tests + validation), Sentry (alerts → bugs)
- **Outputs**: bug reports, root cause analyses, TDD fixes, post-mortems

### Compass — `chico-web-feature-planner`
- **Phases**: DEFINE (roadmap) + RUN (continuous prioritization)
- **Frequent partners**: John++ (vision), Mary++ (user insights), Iris (metrics-driven prioritization)
- **Outputs**: RICE scoring, 3-horizon roadmap, sprint suggestions

### Forge — `chico-web-refactor`
- **Phases**: DISCOVER (existing audit for rebuild) + DEVELOP (refactor) + RUN (tech debt management)
- **Frequent partners**: Winston++ (architectural refactors), Murat++ (regression coverage), Tracker (debt → bugs)
- **Outputs**: tech debt inventory, impact/effort matrix, refactoring plan, dependency upgrades

---

## CIS Module (Creative Intelligence Suite)

### Carson — `chico-cis-brainstorming-coach`
- **Phases**: DESIGN (ideation: Crazy 8s, HMW, SCAMPER, Worst Possible Idea)
- **Frequent partners**: Dr. Quinn (problem solving), Victor (innovation), Maya (design thinking), Tracker (bug brainstorm)
- **Outputs**: `ideation-output.md` with 20-50 ideas + top 5 filter

### Dr. Quinn — `chico-cis-creative-problem-solver`
- **Phases**: DESIGN (problem solving via TRIZ, Theory of Constraints)
- **Frequent partners**: Carson (ideation feed), Winston++ (architectural problems), Forge (debt problems)
- **Outputs**: structured problem statements + ranked solutions

### Maya — `chico-cis-design-thinking-coach`
- **Phases**: DEFINE (empathy maps) + DESIGN (full Design Thinking process)
- **Frequent partners**: Mary++ (research feed), Sally++ (UX implementation), John++ (vision alignment)
- **Outputs**: empathy maps, Design Thinking workshop outputs

### Victor — `chico-cis-innovation-strategist`
- **Phases**: DEFINE (Blue Ocean strategy) + DESIGN (innovation patterns)
- **Frequent partners**: Mary++ (market context), John++ (positioning), Carson (creative ideation)
- **Outputs**: Blue Ocean canvas, innovation strategy, JTBD outliers

### Caravaggio — `chico-cis-presentation-master`
- **Phases**: DELIVER (slides, pitch decks, visual storytelling)
- **Frequent partners**: Frida (brand-aligned visuals), Oscar (slides copy), Sophia (narrative arc)
- **Outputs**: pitch decks, demo videos, stakeholder presentations

### Sophia — `chico-cis-storyteller`
- **Phases**: DEFINE (narrative arc) + DELIVER (marketing storytelling)
- **Frequent partners**: John++ (vision narrative), Frida (brand story), Caravaggio (slide narrative)
- **Outputs**: narrative arcs, story frameworks (Hero's Journey, StoryBrand, etc.)

---

## GDS Module (Game Dev Studio) — preserved game-dev agents

These agents operate in the context of video game projects. Adapted phases: DISCOVER (game brief) + DEFINE (GDD) + DESIGN (mechanics, narrative, UX/HUD) + DEVELOP (game code) + DELIVER (build, store) + RUN (playtest, post-launch).

### Cloud Dragonborn — `chico-gds-game-architect`
- Phases: DEVELOP (game tech architecture)
- Partners: Samus Shepard (game design), Link Freeman (impl)

### Samus Shepard — `chico-gds-game-designer`
- Phases: DEFINE (GDD) + DESIGN (mechanics, narrative)
- Partners: Cloud Dragonborn, Link Freeman

### Link Freeman — `chico-gds-game-dev`
- Phases: DEVELOP (game implementation, code reviews, QA)
- Partners: Cloud Dragonborn, Samus Shepard

### Indie — `chico-gds-game-solo-dev`
- Phases: all (solo dev quick flow for prototypes)
- Partners: full autonomy in prototype mode

### Paige (GDS) — `chico-gds-tech-writer`
- Phases: DELIVER (game documentation)
- Partners: all GDS agents

---

## CMB Module (Chico Builder) — meta-agents

These agents are used to extend Chico itself. Phase: META (outside the standard Double Diamond).

### Agent Builder — `chico-agent-builder`
Creates / edits / analyzes agents. Used by the user when they want to add a new member to the team.

### Module Builder — `chico-module-builder`
Creates thematic modules (e.g. a new "ml" module for data science).

### Workflow Builder — `chico-workflow-builder`
Creates structured workflows (orchestrated skills).

---

## Mini-team patterns: canonical examples

### Bug investigation
**Trio**: Tracker (lead) + Carson (brainstorm hypotheses) + Murat++ (validation tests)
**Pattern**: Sequential handoff. Tracker writes symptoms/hypotheses → Carson brainstorms angles → Murat++ validates what is testable → Tracker codes the fix with regression tests.

### From-scratch architecture
**Quartet**: Winston++ (lead) + Atlas (data) + Sentinel (security) + Beacon (perf)
**Pattern**: Parallel synthesis. Each produces their angle, Winston++ synthesizes into tech-architecture.md.

### Ideation for a new project
**Creative trio**: Carson + Dr. Quinn + Victor
**Pattern**: Parallel synthesis with different angles (standard brainstorming methods / structured problem-solving / disruption).

### Frontend impl of a feature
**Trio**: Pixel (components) + Guardian (forms) + Navigator (pages/flow)
**Pattern**: Sequential handoff. Pixel lays down the atoms → Guardian assembles the forms → Navigator wires up the pages.

### Full audit of an existing project
**Quartet**: Forge (debt) + Murat++ (tests) + Sentinel (security) + Beacon (perf)
**Pattern**: Parallel synthesis (4 independent audits), Chico synthesizes.

### Brand + Copy aligned
**Pair**: Frida (voice/visual) + Oscar (microcopy)
**Pattern**: Pair work. Frida defines the voice, Oscar applies it to specific contexts.

---

## How each agent contributes to the Discussion Board

When Chico spins up a mini-team, it creates `_chico-output/discussions/<task-id>.md`. Each invited agent:

1. **Reads the full board** at the start of their turn.
2. **Adds their own section** with the format:
```markdown
## [<HH:MM>] <My name> — <what I bring>

<My own contribution, in my style and my expertise.>

<If I recommend the help of another agent, I say so explicitly:>
> "I recommend that <Persona> step in on <specific point>"
```
3. **Does not rewrite the work of others** — they enrich it or constructively critique it.
4. **Stays within their phase and usual outputs** — an agent does not step outside their role in a mini-team.
