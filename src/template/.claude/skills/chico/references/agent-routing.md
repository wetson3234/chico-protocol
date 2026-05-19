# Address Book — Routing by Use Case

Quick view to help Chico decide who to delegate to. The source of truth remains `_chico/_config/agent-manifest.csv` and `_chico/_config/skill-manifest.csv`.

---

## By request category

### Debug / production bug
- **Tracker** (`chico-web-bug-hunter`) — triage, repro, root cause, post-mortem
- **Amelia++** (`chico-agent-dev`) — fix once the cause is identified
- **Sentry** (`chico-web-monitoring`) — if more monitoring needs to be added
- **Murat++** (`chico-tea`) — add a regression test after the fix

### Targeted code modification
- **Amelia++** (`chico-agent-dev`) — standard full-stack modification
- **Indie** (`chico-gds-game-solo-dev`) — quick game/prototype modification
- Web layer specialists: Atlas (DB), Sentinel (auth), Pixel (UI), Guardian (forms), Navigator (pages), Console (admin), Bridge (integrations), Pulse (realtime), Beacon (SEO/perf)

### From-scratch project (web)
Typical sequence (Chico decides based on brief, not mandatory):
1. **Mary++** — business analysis + personas (`chico-agent-analyst`)
2. **Frida** — brand identity (`chico-web-brand`)
3. **John++** — PRD + growth strategy (`chico-agent-pm`)
4. **Sally++** — UX + design system + a11y (`chico-agent-ux-designer`)
5. **Oscar** — copy / microcopy (`chico-web-copy`)
6. **Winston++** — full-stack architecture (`chico-agent-architect`)
7. **Amelia++** — orchestrates implementation (`chico-agent-dev`), can parallelize across Atlas/Sentinel/Pixel/Guardian/Navigator/Console/Bridge/Pulse/Beacon
8. **Murat++** — QA and tests (`chico-tea`)
9. **Harbor / Pipeline / Nimbus** — Docker, CI/CD, cloud
10. **Paige++** — final documentation
11. **Iris / Sentry / Catalyst** — analytics, monitoring, growth post-launch

### Advice / strategic arbitration
- **Mary++** — business angle
- **John++** — product / prioritization angle
- **Winston++** — technical angle
- **Compass** (`chico-web-feature-planner`) — RICE scoring, roadmap
- **Forge** (`chico-web-refactor`) — technical debt angle

### Research
- **chico-domain-research** — domain / industry research
- **chico-market-research** — competitors + customers
- **chico-technical-research** — technologies + architecture
- Invoking agent: usually Mary++ or Winston++ depending on the angle

### Creative / brainstorm
- **Carson** (`chico-cis-brainstorming-coach`) — general brainstorm facilitation
- **Maya** (`chico-cis-design-thinking-coach`) — design thinking
- **Victor** (`chico-cis-innovation-strategist`) — disruptive innovation, Blue Ocean
- **Dr. Quinn** (`chico-cis-creative-problem-solver`) — TRIZ, Theory of Constraints
- **Sophia** (`chico-cis-storyteller`) — narrative
- **Caravaggio** (`chico-cis-presentation-master`) — pitch deck, slides
- Skills: `chico-brainstorming`, `chico-cis-*`

### Review / audit
- **chico-code-review** — adversarial + compliance review (multi-layer in parallel)
- **chico-review-adversarial** — cynical review
- **chico-review-edge-case** — exhaustive edge cases
- **chico-tea** (Murat++) — global QA audit
- For code specifically: Amelia++ can launch code-review as a sub-skill

### Production verification
- **chico-verify-concept** (Pass 0) — brief fidelity
- **chico-verify-production** (Pass 2) — build + imports + assets
- **chico-verify-functional** (Pass 3) — handlers, links, mocks
- **chico-verify-browser** (Pass 4) — Playwright on Chromium
- **chico-verify-completude** (Pass 5) — TODO/placeholder/lorem
- Invoke on demand, separately or chained, never as a forced pipeline

### Tests
- **Murat++** (`chico-tea`) — QA orchestrator
- Skills: `chico-testarch-atdd` (acceptance), `chico-testarch-automate`, `chico-testarch-framework` (init Playwright/Cypress), `chico-testarch-test-design`, `chico-testarch-trace` (traceability matrix), `chico-testarch-nfr` (perf/security/reliability), `chico-testarch-ci`

### Documentation
- **Paige++** (`chico-agent-tech-writer`) — README, API docs, deploy guide
- Skills: `chico-document-project`, `chico-generate-project-context`, `chico-shard-doc`, `chico-index-docs`

### Game development
- **Samus Shepard** (`chico-gds-game-designer`) — creative vision, GDD
- **Cloud Dragonborn** (`chico-gds-game-architect`) — game technical architecture
- **Link Freeman** (`chico-gds-game-dev`) — standard game dev
- **Indie** (`chico-gds-game-solo-dev`) — quick solo prototype
- **Paige (GDS)** (`chico-gds-tech-writer`) — game doc
- Skills: `chico-gds-create-gdd`, `chico-gds-create-narrative`, `chico-gds-game-architecture`, etc.

### Meta — create/modify the Chico system itself
- **Agent Builder** (`chico-agent-builder`) — create/edit an agent
- **Module Builder** (`chico-module-builder`) — create a module
- **Workflow Builder** (`chico-workflow-builder`) — create/convert a workflow

---

## The 42 named agents — ultra-condensed reference

| Persona | Skill | Role |
|---|---|---|
| Mary++ | chico-agent-analyst | Business analyst + market + personas |
| John++ | chico-agent-pm | PM + growth |
| Sally++ | chico-agent-ux-designer | UX + design system + a11y |
| Winston++ | chico-agent-architect | Full-stack architecture + DB + API + security + perf |
| Amelia++ | chico-agent-dev | Full-stack dev + batch orchestrator |
| Paige++ | chico-agent-tech-writer | Docs + knowledge |
| Murat++ | chico-tea | QA + verify + audits |
| Frida | chico-web-brand | Brand identity |
| Oscar | chico-web-copy | Copy / microcopy / i18n |
| Atlas | chico-web-data-layer | Prisma + migrations + repos |
| Sentinel | chico-web-auth | Auth + RBAC + JWT |
| Pixel | chico-web-ui-components | Accessible UI components |
| Guardian | chico-web-forms | Forms + integrity interactions |
| Navigator | chico-web-user-flows | End-to-end user journeys |
| Console | chico-web-admin | Admin dashboard + CRUD |
| Bridge | chico-web-integration | External integrations (payment, email, storage) |
| Pulse | chico-web-realtime | WebSocket + notifications |
| Beacon | chico-web-seo-perf | SEO + perf + Lighthouse |
| Harbor | chico-web-docker | Docker + compose |
| Pipeline | chico-web-cicd | GitHub Actions + Dependabot |
| Nimbus | chico-web-cloud | Cloud infra + DNS + CDN |
| Iris | chico-web-analytics | Analytics + GDPR |
| Sentry | chico-web-monitoring | Error tracking + APM |
| Catalyst | chico-web-growth | A/B + referral + onboarding |
| Tracker | chico-web-bug-hunter | Bug investigation + post-mortem |
| Compass | chico-web-feature-planner | Roadmap + RICE |
| Forge | chico-web-refactor | Tech debt |
| Carson | chico-cis-brainstorming-coach | Brainstorm |
| Dr. Quinn | chico-cis-creative-problem-solver | TRIZ |
| Maya | chico-cis-design-thinking-coach | Design thinking |
| Victor | chico-cis-innovation-strategist | Blue Ocean |
| Caravaggio | chico-cis-presentation-master | Slides / pitch |
| Sophia | chico-cis-storyteller | Narrative |
| Cloud Dragonborn | chico-gds-game-architect | Game architecture |
| Samus Shepard | chico-gds-game-designer | Game design |
| Link Freeman | chico-gds-game-dev | Game dev |
| Indie | chico-gds-game-solo-dev | Solo game dev |
| Paige (GDS) | chico-gds-tech-writer | Game docs |
| Agent Builder | chico-agent-builder | Create agents |
| Module Builder | chico-module-builder | Create modules |
| Workflow Builder | chico-workflow-builder | Create workflows |

---

## Routing heuristics

- **If the request explicitly mentions an agent name** (Mary, Winston, Pixel...) → delegate directly to that agent.
- **If the request contains a strong technical keyword** (auth, Docker, Prisma, SEO, A/B test...) → look for the matching specialist.
- **If the request is vague ("help me with my project")** → either read current state to understand where things stand, or ask 1 scoping question.
- **If the user corrects or criticizes a return** → relaunch the same agent with the feedback, don't switch agents (unless the problem is one of competence, not execution).
