# Chico — Agency Playbook

> The **mindset of a serious tech agency**, embedded into the Chico Protocol.
> Inspired by globally recognized official frameworks (IDEO, ThoughtWorks, IBM Garage, Pivotal, Frog, Amazon, Google Sprint).
> **Canonical** document to re-read at the start of any non-trivial session.

---

## Why this playbook

Chico no longer handles a request as an isolated agent. It thinks like **a complete agency**: Discovery, Define, Design, Develop, Deliver, Run — each phase has its official sub-steps, its battle-tested methods, and its lead agent among the 42 available.

The **Chico orchestrator decides** which phases / sub-steps to activate based on the type of request. **Not all of them apply systematically.** See the "Phase Selection Matrix" in Chico's SKILL.md.

---

## The macro framework: extended Double Diamond

```
DISCOVER → DEFINE → DESIGN → DEVELOP → DELIVER → RUN
```

| Phase | Central question | Main output |
|---|---|---|
| **DISCOVER** | What is the real context of the problem? | Enriched brief, personas, market analysis, constraints |
| **DEFINE** | What exactly are we building, and for whom? | Vision, MVP scope, roadmap, success metrics |
| **DESIGN** | What does it look like and how does it work? | Wireframes, brand, design system, prototype |
| **DEVELOP** | How do we build it? | Code, tests, technical documentation |
| **DELIVER** | How do we launch? | Deployed site, monitoring, analytics, marketing |
| **RUN** | How do we maintain and grow? | Bugs fixed, features shipped, metrics improved |

---

## Phase 1 — DISCOVER

**Goal**: understand the context before making any proposal.

| Sub-step | Official method | Lead Chico agent | Output | When |
|---|---|---|---|---|
| Stakeholder interview | Active listening, contextual inquiry (Holtzblatt) | **Mary++** + **John++** | `business-brief.md` | Always for from-scratch |
| Business Model Analysis | Business Model Canvas (Osterwalder), Lean Canvas (Maurya) | **Mary++** | `business-model-canvas.md` | from-scratch B2B/SaaS, optional for marketing sites |
| User Research | User interviews, surveys, ethnographic study | **Mary++** + **Maya** | `personas-raw.md`, `user-research-findings.md` | from-scratch + user-centered projects |
| Market & Competitor | TAM/SAM/SOM sizing, competitor matrix, Blue Ocean (Kim/Mauborgne) | **Mary++** (`chico-market-research`) | `market-analysis.md`, `competitor-matrix.md` | Serious from-scratch |
| Domain Research | Industry / domain research | **Mary++** or **Winston++** (`chico-domain-research`, `chico-technical-research`) | `domain-research.md` | When the domain is unknown to the team |
| Constraints Audit | RACI, risk register, compliance checklist | **Compass** + **Sentinel** (security) | `constraints.md`, `risk-register.md` | Always for B2B / regulated projects |
| Existing Audit (rebuild) | Heuristic eval (Nielsen 10), analytics audit, content audit | **Paige++** (`chico-document-project`), **Forge** (refactor analysis) | `existing-audit.md` | Rebuild only |

---

## Phase 2 — DEFINE

**Goal**: decide what we build, for whom, and how we measure success.

| Sub-step | Official method | Lead Chico agent | Output | When |
|---|---|---|---|---|
| Personas | Cooper Personas, Forrester Personas, Pruitt | **Mary++** | `personas.md` (2-5 personas) | Always when users are involved |
| Jobs To Be Done | JTBD framework (Christensen) | **Mary++** or **Maya** | `jtbd-statements.md` | from-scratch, repositioning |
| Empathy Maps | XPLANE Empathy Map | **Maya** (`chico-cis-design-thinking`) | `empathy-maps.md` | User-centered projects |
| Customer Journey | Service Design Network journey map | **Sally++** or **Navigator** | `customer-journey.md` | from-scratch, UX rebuild |
| Vision Statement | Roman Pichler Product Vision Board | **John++** | `vision.md` | Always for from-scratch |
| PRFAQ (Working Backwards) | Amazon Working Backwards | **John++** (`chico-prfaq`) | `prfaq.md` | Ambitious from-scratch |
| North Star + KPIs | Sean Ellis North Star, OKRs (Doerr) | **John++** + **Iris** | `success-metrics.md` | Always |
| MVP Scope | Reis Lean Startup, MoSCoW | **John++** | `mvp-scope.md` | from-scratch |
| Roadmap | Now/Next/Later (ProductPlan), 3-Horizon (McKinsey) | **Compass** (`chico-web-feature-planner`) | `roadmap.md` | All projects >1 month |

---

## Phase 3 — DESIGN

**Goal**: imagine the solution before coding.

| Sub-step | Official method | Lead Chico agent | Output | When |
|---|---|---|---|---|
| Ideation | Brainstorming (Osborn), Crazy 8s (Google Sprint), HMW (IDEO), SCAMPER (Eberle), Six Thinking Hats (de Bono), Worst Possible Idea | **Carson** (`chico-cis-brainstorming-coach`), **Dr. Quinn**, **Victor**, **Maya** | `ideation-output.md` | When the solution is not obvious |
| Information Architecture | Card sorting, sitemap, taxonomy | **Sally++** | `ia-sitemap.md` | from-scratch web/app |
| User Flows | UML activity, BPMN | **Sally++** or **Navigator** | `user-flows.md` (Mermaid diagrams) | from-scratch |
| Wireframes (low/mid/high fidelity) | Lo-fi → Mid-fi → Hi-fi | **Sally++** (`chico-create-ux-design`) | `wireframes.md` | from-scratch web/app |
| Mood Board / Brand Direction | Pinterest boards, Brand Archetype (Mark & Pearson) | **Frida** (`chico-web-brand`) | `mood-board.md`, `brand-direction.md` | from-scratch |
| Brand Identity | Logo, palette, typography, voice (Marty Neumeier) | **Frida** | `brand-strategy.md` | Serious from-scratch |
| Voice & Copy | Tone of voice axes, microcopy guide | **Oscar** (`chico-web-copy`) | `copy-guide.md` | from-scratch |
| Design System | Atomic Design (Brad Frost), tokens, components | **Sally++** + **Pixel** | `design-system.md` | from-scratch web/SaaS |
| Static Code Prototype | HTML / Next.js with mocked data | **`chico-static-prototype`** (NEW) | static Next.js site, full navigation, mocked data | from-scratch visual — user validation before impl |
| Usability Testing Protocol | Nielsen 5-user rule, RITE method | **Sally++** + **Murat++** | `usability-test-protocol.md` (to be executed by humans) | Ambitious from-scratch |

---

## Phase 4 — DEVELOP

**Goal**: actually build it.

| Sub-step | Official method | Lead Chico agent | Output |
|---|---|---|---|
| Tech Architecture | C4 Model (Brown), ADRs | **Winston++** (`chico-create-architecture`) | `tech-architecture.md`, `ADR-*.md` |
| Data Architecture | Schema design, DDD (Evans) | **Atlas** (`chico-web-data-layer`) + **Winston++** | `db-architecture.md`, Prisma schemas |
| API Design | OpenAPI / GraphQL spec, REST maturity (Richardson) | **Winston++** + **Bridge** | `api-architecture.md`, OpenAPI specs |
| Security Architecture | OWASP Top 10, threat modeling (STRIDE) | **Sentinel** (`chico-web-auth`) | `security-architecture.md` |
| Performance Architecture | Web Vitals targets, perf budget | **Beacon** + **Winston++** | `performance-architecture.md` |
| Story Mapping | Jeff Patton User Story Mapping | **John++** + **Amelia++** (`chico-create-epics-and-stories`) | `epics-and-stories.md` |
| Sprint Planning | Scrum, Kanban | **Amelia++** (`chico-sprint-planning`) | `sprint-plan.md` |
| CI/CD + Containers Setup | GitHub Actions, Docker | **Pipeline** + **Harbor** | `.github/workflows/`, `Dockerfile` |
| Frontend Implementation | Atomic Design, React patterns | **Pixel**, **Guardian** (forms), **Navigator** (pages) | components + pages |
| Backend Implementation | DDD, Clean Architecture | **Atlas** (data), **Sentinel** (auth), **Bridge** (integrations), **Pulse** (realtime), **Console** (admin) | API + services |
| Story Execution | TDD (Beck), pair programming | **Amelia++** (`chico-dev-story`) | code + tests |
| QA & Tests | Test pyramid (Cohn), Playwright, Vitest | **Murat++** + `chico-testarch-*` skills | test suites |
| Cloud Infrastructure | IaC, CDN, DNS, backup | **Nimbus** | `cloud-infra.md` |

---

## Phase 5 — DELIVER

**Goal**: ship it cleanly.

| Sub-step | Official method | Lead Chico agent | Output |
|---|---|---|---|
| Pre-Launch Quality Gates | Lighthouse 90+, axe-core 0 critical, broken links 0 | **Murat++** (`chico-verify-*` passes), **Beacon** | verification reports |
| Browser Runtime Verification | Playwright on real Chromium | **`chico-verify-browser`** | screenshots + console errors |
| Soft Launch / Beta | Closed beta → open beta → GA | **Catalyst** (`chico-web-growth`) | `launch-plan.md` |
| User Documentation | README, user manual | **Paige++** | `README.md`, `docs/user-guide.md` |
| API Documentation | OpenAPI rendering, Postman collection | **Paige++** + **Bridge** | `docs/api.md` |
| Marketing Assets | Press release, demo video, landing page | **Caravaggio** (slides) + **Oscar** (copy) + **Frida** (visuals) | `marketing/` |
| Analytics Setup | Plausible / GA4 / PostHog + funnels | **Iris** (`chico-web-analytics`) | analytics integrated |
| Monitoring & Alerting | Sentry, uptime, structured logs, alert rules | **Sentry** (`chico-web-monitoring`) | monitoring integrated |
| Deployment | Docker, container platforms, GitHub Actions | **Harbor** + **Pipeline** | automated deployment |

---

## Phase 6 — RUN

**Goal**: maintain it and grow it.

| Sub-step | Official method | Lead Chico agent | Output |
|---|---|---|---|
| Bug Triage | ITIL incident management, severity P0-P3 | **Tracker** (`chico-web-bug-hunter`) | post-mortems, fix |
| Incident Response | Blameless post-mortem (Etsy, Google SRE) | **Tracker** + **Sentry** | incident reports |
| Growth Experiments | A/B testing (Optimizely framework), AARRR (McClure) | **Catalyst** (`chico-web-growth`) | experiments + results |
| User Feedback Loops | NPS, CSAT, in-app surveys | **Iris** + **Catalyst** | feedback dashboards |
| Tech Debt Management | Refactoring sprints, dependency audit | **Forge** (`chico-web-refactor`) | tech-debt-inventory + plan |
| Continuous Discovery | Teresa Torres dual-track agile | **Mary++** + **John++** | new user insights |
| Feature Roadmap | RICE scoring, Now/Next/Later | **Compass** | updated roadmap |

---

## Major variations by project type

Chico uses this matrix to choose which phases to activate.

| Type | DISCOVER | DEFINE | DESIGN | DEVELOP | DELIVER | RUN |
|---|---|---|---|---|---|---|
| **Marketing site** (lawyer, restaurant) | Light | Medium | Heavy (brand, copy, IA, static prototype) | Light | Standard | Light |
| **SaaS B2B** | Heavy (pro interviews, BMC, JTBD) | Heavy (PRFAQ, North Star, rigorous MVP) | Medium | Heavy (billing, security, integrations) | Heavy (onboarding) | Heavy (growth, NPS) |
| **Mobile app** | Standard | Standard | Heavy (native UX, store assets) | Specialized (iOS/Android) | Heavy (App Store review) | Heavy (ratings) |
| **Windows / desktop program** | Light | Standard | Medium | Specialized (packaging, signing) | Specialized (installer) | Light |
| **Bug fix** | Root cause focus | Skipped | Skipped | Light (fix + test) | Light | Standard (post-mortem if critical) |
| **Refactor** | Existing audit | Skipped | Skipped | Heavy | Standard | Light |
| **Feature add** | Light (impact) | Medium (story) | Light | Standard | Standard | Light |
| **Advice / question** | Light (clarify) | Skipped | Skipped | Skipped | Skipped | Skipped |

---

## Umbrella frameworks that structure thinking

Mindsets Chico applies in parallel to the phases:

- **Design Thinking** (IDEO, Stanford d.school) — Empathize → Define → Ideate → Prototype → Test
- **Lean Startup** (Eric Ries) — Build → Measure → Learn
- **Working Backwards** (Amazon) — start from the PRFAQ of the finished product
- **Google Sprint** (Jake Knapp / GV) — validate an idea in 5 days
- **Jobs To Be Done** (Christensen) — user motivation framework
- **Agile / Scrum** (Sutherland) — deliver in iterative sprints
- **Continuous Discovery** (Teresa Torres) — always be learning

A good agency **combines** these frameworks: Discovery uses JTBD + Design Thinking, Build uses Agile, Delivery uses Lean Startup.

---

## Glossary of cited methods

- **Active Listening** — listen without interrupting, paraphrase, dig with open-ended questions (Carl Rogers)
- **A/B Testing** — compare 2 versions on real users, measure
- **AARRR Funnel** (Dave McClure) — Acquisition / Activation / Retention / Referral / Revenue
- **ADR (Architecture Decision Record)** — document an architectural decision (title, context, decision, consequences)
- **Atomic Design** (Brad Frost) — Atoms / Molecules / Organisms / Templates / Pages
- **Blue Ocean Strategy** (Kim & Mauborgne) — create a new market rather than fight in an existing one
- **Business Model Canvas** (Osterwalder) — 9 blocks: value prop, segments, channels, relationships, revenue, resources, activities, partners, costs
- **C4 Model** (Simon Brown) — Context / Container / Component / Code (4 levels of architecture)
- **Card Sorting** — users sort cards into groups to reveal the natural taxonomy
- **Crazy 8s** (Google Sprint) — 8 idea sketches in 8 minutes
- **Customer Journey Map** — visualization of customer touchpoints with emotions / opportunities
- **DDD (Domain Driven Design)** (Evans) — modeling driven by the business domain
- **Empathy Map** (XPLANE) — Says / Thinks / Does / Feels of a persona
- **HMW (How Might We)** (IDEO) — reframe a problem as an opportunity question
- **JTBD (Jobs To Be Done)** (Christensen) — "When X, I want Y, so I can Z"
- **Lean Canvas** (Maurya) — startup-oriented variant of BMC
- **Lean Startup** (Eric Ries) — Build / Measure / Learn, MVP, validated learning
- **Mood Board** — visual collection used to steer the brand
- **MoSCoW** — Must / Should / Could / Won't (prioritization)
- **Nielsen 5-User Rule** — 5 users uncover ~85% of UX issues
- **OKR** (Doerr) — Objectives & Key Results
- **OpenAPI** — standard for REST API documentation
- **OWASP Top 10** — top 10 web vulnerabilities
- **Persona** (Cooper) — target user archetype
- **PRFAQ (Working Backwards)** (Amazon) — press release + FAQ of the finished product, written BEFORE the project
- **RACI** — Responsible / Accountable / Consulted / Informed
- **RICE** (Intercom) — Reach × Impact × Confidence / Effort
- **RITE Method** — Rapid Iterative Testing & Evaluation
- **SCAMPER** (Eberle) — Substitute / Combine / Adapt / Modify / Put to other use / Eliminate / Reverse
- **Service Blueprint** — extension of a journey map with back-stage / internal processes
- **Six Thinking Hats** (de Bono) — 6 modes of thinking
- **Story Mapping** (Jeff Patton) — visual narrative backlog
- **STRIDE** — Spoofing / Tampering / Repudiation / Info disclosure / DoS / Elevation of privilege
- **TAM/SAM/SOM** — Total / Serviceable / Serviceable Obtainable Market
- **TDD (Test Driven Development)** (Beck) — Red → Green → Refactor
- **Threat Modeling** — identify security threats before writing code
- **Worst Possible Idea** — ideation technique to unblock by starting from the counter-example

---

## How Chico uses this playbook

1. **At the start of a new non-trivial session**, Chico re-reads this page (or queries the RAG if the project already has artifacts).
2. **To qualify the request**, it consults the "Phase Selection Matrix" in the SKILL.md.
3. **For each activated phase**, it picks the relevant sub-steps and identifies the **lead agents** on this page.
4. **For complex sub-steps** (e.g. Ideation, Architecture), it spins up a **mini-team** that collaborates via the **Discussion Board** (see the `chico-mini-team` skill).
5. **For every artifact produced**, it indexes it through the RAG (`chico_memory_index`) and persists it in `_chico-output/planning-artifacts/` or equivalent.
6. **At the end**, it updates `chico-state.md` and invites the user to validate the next phase.
