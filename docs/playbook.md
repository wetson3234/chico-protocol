# Agency playbook

> **The way a serious tech agency thinks**, baked into Chico Protocol.
>
> Adapted from globally recognized frameworks (IDEO, ThoughtWorks, IBM Garage, Pivotal, Frog, Amazon, Google Sprint).
> This document is the canonical reference Chico re-reads at the start of any non-trivial session.

---

## Why this playbook exists

Chico doesn't treat a request as a one-shot prompt for one-shot output. It thinks like **a full agency**: Discover, Define, Design, Develop, Deliver, Run — each phase has its sub-steps, its proven methodologies, and its referent agent among the 42 available.

The **orchestrator decides** which phases and sub-steps to activate based on the request type. **Not every phase applies to every request.** See the "Phase Selection Matrix" in the orchestrator's SKILL.md.

---

## The macro frame — Extended Double Diamond

```
DISCOVER → DEFINE → DESIGN → DEVELOP → DELIVER → RUN
```

| Phase | Central question | Primary output |
|---|---|---|
| **DISCOVER** | What's the real context? | Enriched brief, personas, market analysis, constraints |
| **DEFINE** | What exactly are we doing, and for whom? | Vision, MVP scope, roadmap, success metrics |
| **DESIGN** | What does it look like and how does it work? | Wireframes, brand, design system, prototype |
| **DEVELOP** | How do we build it? | Code, tests, technical documentation |
| **DELIVER** | How do we launch? | Deployed site, monitoring, analytics, marketing |
| **RUN** | How do we maintain and grow it? | Bugs fixed, features shipped, metrics improved |

---

## Phase 1 — DISCOVER

**Goal.** Understand the context before proposing anything.

| Sub-step | Official method | Chico referent agent | Output | When |
|---|---|---|---|---|
| Stakeholder interview | Active listening, contextual inquiry (Holtzblatt) | **Mary++** + **John++** | `business-brief.md` | Always for from-scratch |
| Business model analysis | Business Model Canvas (Osterwalder), Lean Canvas (Maurya) | **Mary++** | `business-model-canvas.md` | From-scratch B2B/SaaS, optional for vitrine |
| User research | User interviews, surveys, ethnographic study | **Mary++** + **Maya** | `personas-raw.md`, `user-research-findings.md` | From-scratch + user-centric projects |
| Market & competitor | TAM/SAM/SOM, competitor matrix, Blue Ocean (Kim/Mauborgne) | **Mary++** (`chico-market-research`) | `market-analysis.md`, `competitor-matrix.md` | From-scratch serious projects |
| Domain research | Industry/domain research | **Mary++** or **Winston++** (`chico-domain-research`, `chico-technical-research`) | `domain-research.md` | When domain is unknown to the team |
| Constraints audit | RACI, risk register, compliance checklist | **Compass** + **Sentinel** (security) | `constraints.md`, `risk-register.md` | Always for B2B / regulated projects |
| Existing audit (refactor) | Heuristic eval (Nielsen 10), analytics audit, content audit | **Paige++** (`chico-document-project`), **Forge** (refactor analysis) | `existing-audit.md` | Brownfield refactors only |

---

## Phase 2 — DEFINE

**Goal.** Decide what we're doing, for whom, and how we measure success.

| Sub-step | Official method | Chico referent agent | Output | When |
|---|---|---|---|---|
| Personas | Cooper Personas, Forrester Personas, Pruitt | **Mary++** | `personas.md` (2-5 personas) | Always when users are involved |
| Jobs To Be Done | JTBD (Christensen) | **Mary++** or **Maya** | `jtbd-statements.md` | From-scratch, repositioning |
| Empathy maps | XPLANE Empathy Map | **Maya** (`chico-cis-design-thinking`) | `empathy-maps.md` | User-centric projects |
| Customer journey | Service Design Network journey map | **Sally++** or **Navigator** | `customer-journey.md` | From-scratch, UX refactors |
| Vision statement | Roman Pichler Product Vision Board | **John++** | `vision.md` | Always for from-scratch |
| PRFAQ (Working Backwards) | Amazon Working Backwards | **John++** (`chico-prfaq`) | `prfaq.md` | Ambitious from-scratch |
| North Star + KPIs | Sean Ellis North Star, OKRs (Doerr) | **John++** + **Iris** | `success-metrics.md` | Always |
| MVP scope | Ries Lean Startup, MoSCoW | **John++** | `mvp-scope.md` | From-scratch |
| Roadmap | Now/Next/Later (ProductPlan), 3-Horizon (McKinsey) | **Compass** (`chico-web-feature-planner`) | `roadmap.md` | Any project >1 month |

---

## Phase 3 — DESIGN

**Goal.** Imagine the solution before coding.

| Sub-step | Official method | Chico referent agent | Output | When |
|---|---|---|---|---|
| Ideation | Brainstorming (Osborn), Crazy 8s (Google Sprint), HMW (IDEO), SCAMPER (Eberle), Six Thinking Hats (de Bono), Worst Possible Idea | **Carson** (`chico-cis-brainstorming-coach`), **Dr. Quinn**, **Victor**, **Maya** | `ideation-output.md` | When the solution isn't obvious |
| Information architecture | Card sorting, sitemap, taxonomy | **Sally++** | `ia-sitemap.md` | From-scratch web/app |
| User flows | UML activity, BPMN | **Sally++** or **Navigator** | `user-flows.md` (Mermaid diagrams) | From-scratch |
| Wireframes (lo/mid/hi-fi) | Lo-fi → Mid-fi → Hi-fi | **Sally++** (`chico-create-ux-design`) | `wireframes.md` | From-scratch web/app |
| Mood board / brand direction | Pinterest boards, Brand Archetype (Mark & Pearson) | **Frida** (`chico-web-brand`) | `mood-board.md`, `brand-direction.md` | From-scratch |
| Brand identity | Logo, palette, typo, voice (Marty Neumeier) | **Frida** | `brand-strategy.md` | Serious from-scratch |
| Voice & copy | Tone of voice axes, microcopy guide | **Oscar** (`chico-web-copy`) | `copy-guide.md` | From-scratch |
| Design system | Atomic Design (Brad Frost), tokens, components | **Sally++** + **Pixel** | `design-system.md` | From-scratch web/SaaS |
| Static code prototype | HTML / Next.js with mocked data | **`chico-static-prototype`** | Next.js static site, full navigation, mocked data | From-scratch visual — user validation before impl |
| Usability testing protocol | Nielsen 5-user rule, RITE method | **Sally++** + **Murat++** | `usability-test-protocol.md` (run by humans) | Ambitious from-scratch |

---

## Phase 4 — DEVELOP

**Goal.** Actually build it.

| Sub-step | Official method | Chico referent agent | Output |
|---|---|---|---|
| Tech architecture | C4 Model (Brown), ADRs | **Winston++** (`chico-create-architecture`) | `tech-architecture.md`, `ADR-*.md` |
| Data architecture | Schema design, DDD (Evans) | **Atlas** (`chico-web-data-layer`) + **Winston++** | `db-architecture.md`, Prisma schemas |
| API design | OpenAPI / GraphQL spec, REST maturity (Richardson) | **Winston++** + **Bridge** | `api-architecture.md`, OpenAPI specs |
| Security architecture | OWASP Top 10, threat modeling (STRIDE) | **Sentinel** (`chico-web-auth`) | `security-architecture.md` |
| Performance architecture | Web Vitals targets, perf budget | **Beacon** + **Winston++** | `performance-architecture.md` |
| Story mapping | Jeff Patton User Story Mapping | **John++** + **Amelia++** (`chico-create-epics-and-stories`) | `epics-and-stories.md` |
| Sprint planning | Scrum, Kanban | **Amelia++** (`chico-sprint-planning`) | `sprint-plan.md` |
| Setup CI/CD + containers | GitHub Actions, Docker | **Pipeline** + **Harbor** | `.github/workflows/`, `Dockerfile` |
| Frontend implementation | Atomic Design, React patterns | **Pixel**, **Guardian** (forms), **Navigator** (pages) | Components + pages |
| Backend implementation | DDD, Clean Architecture | **Atlas** (data), **Sentinel** (auth), **Bridge** (integrations), **Pulse** (realtime), **Console** (admin) | API + services |
| Story execution | TDD (Beck), pair programming | **Amelia++** (`chico-dev-story`) | Code + tests |
| QA & tests | Test pyramid (Cohn), Playwright, Vitest | **Murat++** + `chico-testarch-*` skills | Test suites |
| Cloud infrastructure | IaC, CDN, DNS, backup | **Nimbus** | `cloud-infra.md` |

---

## Phase 5 — DELIVER

**Goal.** Launch cleanly.

| Sub-step | Official method | Chico referent agent | Output |
|---|---|---|---|
| Pre-launch quality gates | Lighthouse 90+, axe-core 0 critical, broken links 0 | **Murat++** (`chico-verify-*` passes), **Beacon** | Verification reports |
| Browser runtime verification | Playwright on real Chromium | **`chico-verify-browser`** | Screenshots + console errors |
| Soft launch / beta | Closed beta → open beta → GA | **Catalyst** (`chico-web-growth`) | `launch-plan.md` |
| User documentation | README, user manual | **Paige++** | `README.md`, `docs/user-guide.md` |
| API documentation | OpenAPI rendering, Postman collection | **Paige++** + **Bridge** | `docs/api.md` |
| Marketing assets | Press release, demo video, landing page | **Caravaggio** (slides) + **Oscar** (copy) + **Frida** (visuals) | `marketing/` |
| Analytics setup | Plausible / GA4 / PostHog + funnels | **Iris** (`chico-web-analytics`) | Analytics integrated |
| Monitoring & alerting | Sentry, uptime, structured logs, alert rules | **Sentry** (`chico-web-monitoring`) | Monitoring integrated |
| Deployment | Docker, Coolify, GitHub Actions | **Harbor** + **Pipeline** | Automated deployment |

---

## Phase 6 — RUN

**Goal.** Maintain and grow.

| Sub-step | Official method | Chico referent agent | Output |
|---|---|---|---|
| Bug triage | ITIL incident management, severity P0-P3 | **Tracker** (`chico-web-bug-hunter`) | Post-mortems, fixes |
| Incident response | Blameless post-mortem (Etsy, Google SRE) | **Tracker** + **Sentry** | Incident reports |
| Growth experiments | A/B testing (Optimizely framework), AARRR (McClure) | **Catalyst** (`chico-web-growth`) | Experiments + results |
| User feedback loops | NPS, CSAT, in-app surveys | **Iris** + **Catalyst** | Feedback dashboards |
| Tech debt management | Refactoring sprints, dependency audit | **Forge** (`chico-web-refactor`) | Tech debt inventory + plan |
| Continuous discovery | Teresa Torres dual-track agile | **Mary++** + **John++** | New user insights |
| Feature roadmap | RICE scoring, Now/Next/Later | **Compass** | Updated roadmap |

---

## Major variations by project type

Chico uses this matrix to decide which phases to activate.

| Type | DISCOVER | DEFINE | DESIGN | DEVELOP | DELIVER | RUN |
|---|---|---|---|---|---|---|
| **Vitrine site** (lawyer, restaurant) | Light | Medium | Heavy (brand, copy, IA, static prototype) | Light | Standard | Light |
| **B2B SaaS** | Heavy (pro interviews, BMC, JTBD) | Heavy (PRFAQ, North Star, rigorous MVP) | Medium | Heavy (billing, security, integrations) | Heavy (onboarding) | Heavy (growth, NPS) |
| **Mobile app** | Standard | Standard | Heavy (native UX, store assets) | Specialized (iOS/Android) | Heavy (App Store review) | Heavy (ratings) |
| **Windows / desktop program** | Light | Standard | Medium | Specialized (packaging, signing) | Specialized (installer) | Light |
| **Bug fix** | Focus root cause | skip | skip | Light (fix + test) | Light | Standard (post-mortem if critical) |
| **Refactor** | Audit existing | skip | skip | Heavy | Standard | Light |
| **Feature add** | Light (impact) | Medium (story) | Light | Standard | Standard | Light |
| **Advice / question** | Light (clarify) | skip | skip | skip | skip | skip |

---

## Umbrella mindsets

Frameworks Chico applies in parallel with the phases:

- **Design Thinking** (IDEO, Stanford d.school) — Empathize → Define → Ideate → Prototype → Test
- **Lean Startup** (Eric Ries) — Build → Measure → Learn
- **Working Backwards** (Amazon) — start from the PRFAQ of the finished product
- **Google Sprint** (Jake Knapp / GV) — validate an idea in 5 days
- **Jobs To Be Done** (Christensen) — framework for user motivation
- **Agile / Scrum** (Sutherland) — ship in iterative sprints
- **Continuous Discovery** (Teresa Torres) — always be learning

A good agency **combines** these: Discovery uses JTBD + Design Thinking, Build uses Agile, Delivery uses Lean Startup.

---

## Methodology glossary

- **Active Listening** — listen without interrupting, reformulate, dig via open questions (Carl Rogers)
- **A/B Testing** — compare 2 versions on real users, measure
- **AARRR Funnel** (Dave McClure) — Acquisition / Activation / Retention / Referral / Revenue
- **ADR (Architecture Decision Record)** — document an architecture decision (title, context, decision, consequences)
- **Atomic Design** (Brad Frost) — Atoms / Molecules / Organisms / Templates / Pages
- **Blue Ocean Strategy** (Kim & Mauborgne) — create a new market rather than compete in an existing one
- **Business Model Canvas** (Osterwalder) — 9 boxes: value prop, segments, channels, relationships, revenue, resources, activities, partners, costs
- **C4 Model** (Simon Brown) — Context / Container / Component / Code (4 architecture levels)
- **Card Sorting** — users sort cards into groups to reveal natural taxonomy
- **Crazy 8s** (Google Sprint) — 8 idea sketches in 8 minutes
- **Customer Journey Map** — visualization of customer touchpoints with emotions / opportunities
- **DDD (Domain Driven Design)** (Evans) — modeling guided by business domain
- **Empathy Map** (XPLANE) — Says / Thinks / Does / Feels of a persona
- **HMW (How Might We)** (IDEO) — reformulate a problem as an opportunity question
- **JTBD (Jobs To Be Done)** (Christensen) — "When X, I want Y, so I can Z"
- **Lean Canvas** (Maurya) — startup-oriented variant of BMC
- **Lean Startup** (Eric Ries) — Build / Measure / Learn, MVP, validated learning
- **Mood Board** — visual collection to guide brand direction
- **MoSCoW** — Must / Should / Could / Won't (prioritization)
- **Nielsen 5-User Rule** — 5 users detect ~85% of UX problems
- **OKR** (Doerr) — Objectives & Key Results
- **OpenAPI** — REST API documentation standard
- **OWASP Top 10** — top 10 web vulnerabilities
- **Persona** (Cooper) — archetype of target user
- **PRFAQ (Working Backwards)** (Amazon) — press release + FAQ of the finished product, written BEFORE the project
- **RACI** — Responsible / Accountable / Consulted / Informed
- **RICE** (Intercom) — Reach × Impact × Confidence / Effort
- **RITE Method** — Rapid Iterative Testing & Evaluation
- **SCAMPER** (Eberle) — Substitute / Combine / Adapt / Modify / Put to other use / Eliminate / Reverse
- **Service Blueprint** — extension of journey map with back-stage / internal processes
- **Six Thinking Hats** (de Bono) — 6 modes of thought
- **Story Mapping** (Jeff Patton) — narrative visual backlog
- **STRIDE** — Spoofing / Tampering / Repudiation / Info disclosure / DoS / Elevation of privilege
- **TAM/SAM/SOM** — Total / Serviceable / Serviceable Obtainable Market
- **TDD (Test Driven Development)** (Beck) — Red → Green → Refactor
- **Threat Modeling** — identify security threats before the code
- **Worst Possible Idea** — ideation technique to unblock by starting from the counter-example

---

## How Chico uses this playbook

1. **At the start of a non-trivial session**, Chico re-reads this page (or queries the RAG if the project has artifacts indexed).
2. **To qualify the request**, it consults the "Phase Selection Matrix" in its own SKILL.md.
3. **For each activated phase**, it picks the relevant sub-steps and identifies the **referent agents** on this page.
4. **For complex sub-steps** (e.g. Ideation, Architecture), it builds a **mini-team** that collaborates via the **discussion board** (see the `chico-mini-team` skill).
5. **For each produced artifact**, it indexes via the RAG (`chico_memory_index`) and persists it in `_chico-output/planning-artifacts/` or equivalent.
6. **At the end**, it updates `chico-state.md` and invites the user to validate the next phase.
