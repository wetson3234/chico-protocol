# Agent catalog

Chico Protocol ships with **42 named specialists** distributed across 5 modules with named agents (CMM, Web, CIS, GDS, CMB). They are individually invocable by skill ID, but in most cases you'll let the orchestrator pick — type `/chico <your request>` and Chico will route.

Three types of agents exist:

- **Memory** — persists per-project learnings in `_chico/memory/<persona>.md`. Good for long-running engagements where the agent should remember your preferences and conventions.
- **Stateless** — single-shot expertise. Good for focused tasks where context lives in the prompt.
- **Autonomous** — runs longer investigations across multiple turns (Tracker is the only one today).

---

## CMM module — Chico Protocol core (7 fused agents)

The CMM agents are "fused" — they combine Chico-Methode personas with CCCTA V3 capabilities. They have memory, they cover the central product development pipeline, and they are the agents you'll interact with most often on serious projects.

### Mary++ — `chico-agent-analyst`

> Strategic Business Intelligence Lead

Type: **Memory** · Module: CMM · Phase: P01 (Discover)

Business analysis, market research, competitor matrices, persona creation, domain research. Mary++ is who you invoke when you need to understand the landscape before deciding what to build.

**When to invoke.** From-scratch projects, repositioning exercises, "should we build X or Y?" strategy questions, anytime personas or market sizing matter.

### John++ — `chico-agent-pm`

> Product & Growth Strategist

Type: **Memory** · Module: CMM · Phase: P02 (Define)

PRD authoring, product vision, MVP scope, North Star metrics, growth strategy, PRFAQ (Working Backwards). John++ takes Mary++'s output and turns it into a buildable specification.

**When to invoke.** When you need a PRD, a vision statement, a roadmap, growth experiments planned, or an MVP scope defined.

### Sally++ — `chico-agent-ux-designer`

> UX/UI & Accessibility Architect

Type: **Memory** · Module: CMM · Phase: P02 (Design)

User flows, wireframes, information architecture, design system, WCAG 2.1 AA compliance, customer journey maps, usability test protocols. Sally++ is the bridge between product spec and visual design.

**When to invoke.** When you need a sitemap, user flows, wireframes, a design system, or any accessibility audit.

### Winston++ — `chico-agent-architect`

> Full-Stack Architecture Lead

Type: **Memory** · Module: CMM · Phase: P03 (Solutioning)

Tech architecture, C4 diagrams, ADRs, database design, API design, security architecture, performance architecture. Fused from 5 architect roles in CCCTA V3. Winston++ produces the technical blueprint everyone else builds against.

**When to invoke.** Before any non-trivial build, when you need ADRs, when you're choosing a stack, when you need to coordinate database + auth + API decisions.

### Amelia++ — `chico-agent-dev`

> Full-Stack Dev Lead & Orchestrator

Type: **Memory** · Module: CMM · Phase: P04 (Develop)

Full-stack implementation, story execution, batch orchestration (parallelizes work across Atlas, Sentinel, Pixel, Guardian, Navigator, Console, Bridge, Pulse, Beacon), code review coordination. Amelia++ is the dev lead — she doesn't just code, she coordinates the build.

**When to invoke.** When the architecture is locked and you need to implement, when you have a story to dev, when you need to coordinate multiple specialist developers.

### Murat++ — `chico-tea`

> Master QA & Verification Architect

Type: **Memory** · Module: TEA · Phase: P05 (Test)

Test strategy, test design, automation, NFR assessment, traceability matrix, quality gates, the 5 verification passes. Fused from 6 testing roles. Murat++ is who you call to make sure the work survives contact with reality.

**When to invoke.** For test plans, regression tests, NFR audits (performance/security/reliability), or to run any of the verification passes.

### Paige++ — `chico-agent-tech-writer`

> Documentation & Knowledge Lead

Type: **Memory** · Module: CMM · Phase: P06 (Deliver)

README, API documentation, deployment guides, changelogs, ADRs, project-context generation, brownfield project documentation. Paige++ produces docs developers actually read.

**When to invoke.** At project completion for README + deploy guide, when an API needs an OpenAPI/Postman documentation, when documenting an existing project for AI consumption.

---

## Web module — Web Pipeline specialists (20 agents)

Stateless specialists focused on specific web development layers. They're typically orchestrated by Amelia++, but you can invoke them directly when you know exactly who you want.

### Frida — `chico-web-brand`

> Brand Identity Architect

Type: Stateless · Module: Web

Brand strategy, archetype (Mark & Pearson), visual identity (logo, palette, typography), voice guidelines, mood board direction.

**When to invoke.** From-scratch projects that need a brand. Repositioning. Anytime you need a coherent visual identity.

### Oscar — `chico-web-copy`

> Voice & Copy Strategist

Type: Stateless · Module: Web

Microcopy, error messages, CTAs, SEO copy, internationalization strategy, tone of voice axes.

**When to invoke.** When the UI needs words. When you need a copy guide. When error messages or CTAs need to feel coherent.

### Atlas — `chico-web-data-layer`

> Data Architecture Engineer

Type: Stateless · Module: Web

Prisma schema, migrations, seeders, repositories, validation schemas (Zod), database optimization.

**When to invoke.** When you need a data model, when migrations are tricky, when you need a repository pattern, when seeding data for dev/staging.

### Sentinel — `chico-web-auth`

> Auth & Security Engineer

Type: Stateless · Module: Web

Authentication flows (OAuth, magic link, password), authorization (RBAC, ABAC), JWT, middleware, password security, OWASP Top 10 audits.

**When to invoke.** When you need login. When you need RBAC. When you suspect a security issue. When OWASP compliance matters.

### Pixel — `chico-web-ui-components`

> Component Library Architect

Type: Stateless · Module: Web

Atomic Design (Brad Frost), accessible components (ARIA, keyboard nav), variants with `cva`, dark mode, design tokens.

**When to invoke.** When you need a reusable component library. When existing components need accessibility audits. When dark mode is on the table.

### Guardian — `chico-web-forms`

> Interaction Integrity Agent

Type: Stateless · Module: Web

Form handling, validation, real API connections (no mocks), submission flows, error states, optimistic updates.

**When to invoke.** When forms need to actually work. When you suspect dead handlers or empty `onSubmit`. When validation logic gets complex.

### Navigator — `chico-web-user-flows`

> User Journey Orchestrator

Type: Stateless · Module: Web

End-to-end user journey verification, page assembly, routing, navigation patterns. Verifies 8+ user flows actually complete.

**When to invoke.** When you need to wire up pages and routes. When user flows need end-to-end verification. When navigation feels broken.

### Console — `chico-web-admin`

> Admin Interface Builder

Type: Stateless · Module: Web

Admin dashboards, user management, entity CRUD, admin-specific API routes, role-protected views.

**When to invoke.** When you need an admin panel. When you need to expose entities for CRUD. When ops teams need a UI.

### Bridge — `chico-web-integration`

> External Service Integrator

Type: Stateless · Module: Web

Third-party integrations: email (Resend, Postmark), payments (Stripe), file storage (S3, R2), webhooks, OAuth providers.

**When to invoke.** When you need Stripe. When you need email sending. When you need to integrate any external SaaS.

### Pulse — `chico-web-realtime`

> Realtime & Notifications Engineer

Type: Stateless · Module: Web

WebSocket, SSE, notification systems (in-app, email, push), live updates, presence indicators.

**When to invoke.** When you need real-time. When notifications need to be reliable. When presence/typing indicators matter.

### Beacon — `chico-web-seo-perf`

> SEO & Web Performance Engineer

Type: Stateless · Module: Web

Metadata, sitemap, robots, JSON-LD structured data, image optimization, Core Web Vitals, Lighthouse audits.

**When to invoke.** Before launch for SEO setup. When Lighthouse scores need to hit 90+. When LCP/INP/CLS are off.

### Harbor — `chico-web-docker`

> Container & Orchestration Engineer

Type: Stateless · Module: Web

Multi-stage Dockerfiles, docker-compose, health checks, production container hygiene.

**When to invoke.** When you need to containerize. When the existing Dockerfile is naive. When you need a production-ready image.

### Pipeline — `chico-web-cicd`

> CI/CD & Automation Engineer

Type: Stateless · Module: Web

GitHub Actions workflows for CI, CD, preview deploys, Dependabot, security scanning.

**When to invoke.** When you need CI from scratch. When preview deploys are missing. When security scanning isn't in place.

### Nimbus — `chico-web-cloud`

> Cloud Infrastructure Architect

Type: Stateless · Module: Web

Cloud planning, hosting setup, CDN, DNS, SSL, backup strategy, cost forecasts.

**When to invoke.** When you're choosing a hoster. When you need a backup strategy. When DNS/SSL/CDN need to be designed.

### Iris — `chico-web-analytics`

> Analytics & Privacy Engineer

Type: Stateless · Module: Web

GDPR-compliant analytics (Plausible, PostHog, GA4), event tracking plans, funnels, dashboards, privacy policy.

**When to invoke.** Pre-launch for analytics. When GDPR compliance is needed. When events need a tracking plan.

### Sentry — `chico-web-monitoring`

> Observability & Alerting Engineer

Type: Stateless · Module: Web

Error tracking (Sentry, etc.), APM, structured logs, alerting rules, uptime monitoring.

**When to invoke.** Post-launch for production observability. When you need alerting. When logs need structure.

### Catalyst — `chico-web-growth`

> Growth Experimentation Lead

Type: Stateless · Module: Web

A/B testing, referral programs, onboarding flows, email automation, AARRR funnel.

**When to invoke.** Post-launch for growth experiments. When activation/retention need optimization. When onboarding feels weak.

### Tracker — `chico-web-bug-hunter`

> Production Bug Investigator

Type: **Autonomous** · Module: Web

Bug triage, reproduction, root cause analysis, TDD-driven fix, blameless post-mortem.

**When to invoke.** Every time something is broken in production. Every time you need a serious post-mortem.

### Compass — `chico-web-feature-planner`

> Feature Roadmap Strategist

Type: Stateless · Module: Web

Feature collection, RICE scoring, user stories, 3-horizon roadmap, sprint planning recommendations.

**When to invoke.** When the backlog is messy. When you need to prioritize 20 features down to 5. When stakeholders need a Now/Next/Later view.

### Forge — `chico-web-refactor`

> Technical Debt Reducer

Type: Stateless · Module: Web

Tech debt inventory, impact/effort matrix, quick wins, refactoring sprint planning.

**When to invoke.** When the codebase is slowing you down. When you need to make the case for a refactor sprint. When you want a debt baseline.

---

## CIS module — Creative Intelligence Suite (6 coaches)

Stateless creative coaches. They run structured ideation methodologies — call them when the question is "how do we think about this?" rather than "how do we build it?".

### Carson — `chico-cis-brainstorming-coach`

> Elite Brainstorming Specialist

Type: Stateless · Module: CIS

Facilitated brainstorm sessions using diverse techniques: Crazy 8s, SCAMPER, HMW (How Might We), Six Thinking Hats, Worst Possible Idea, reverse brainstorming.

**When to invoke.** Anytime you need to generate ideas with structure. Multi-angle exploration.

### Dr. Quinn — `chico-cis-creative-problem-solver`

> Master Problem Solver

Type: Stateless · Module: CIS

Systematic problem-solving methodologies: TRIZ (40 inventive principles), Theory of Constraints, 5 Whys, fishbone analysis.

**When to invoke.** When the problem is technical and the solution isn't obvious. When you've been stuck for hours.

### Maya — `chico-cis-design-thinking-coach`

> Design Thinking Maestro

Type: Stateless · Module: CIS

Empathize → Define → Ideate → Prototype → Test. Empathy maps, journey maps, user interviews framing.

**When to invoke.** When you need a human-centered design pass. When you're tempted to skip user research.

### Victor — `chico-cis-innovation-strategist`

> Disruptive Innovation Oracle

Type: Stateless · Module: CIS

Blue Ocean Strategy (Kim & Mauborgne), Jobs To Be Done (Christensen), business model innovation, disruption analysis.

**When to invoke.** When you're competing in a red ocean. When you want to find an uncontested market space.

### Caravaggio — `chico-cis-presentation-master`

> Visual Communication Expert

Type: Stateless · Module: CIS

Slide decks, pitch decks, visual storytelling, executive summaries.

**When to invoke.** When you need a deck. When a written doc needs to become a presentation. Pitch prep.

### Sophia — `chico-cis-storyteller`

> Master Storyteller

Type: Stateless · Module: CIS

Narrative frameworks: Hero's Journey, StoryBrand, Pixar 22 Rules, three-act structure. Brand storytelling, case study writing.

**When to invoke.** When the message needs a narrative arc. Case studies, founder stories, brand narratives.

---

## GDS module — Game Dev Studio (5 agents)

Game-specific specialists with Memory. Don't install this module if you're not making games.

### Cloud Dragonborn — `chico-gds-game-architect`

> Game Systems Architect

Type: Memory · Module: GDS

Game technical architecture, engine systems, networking, save systems, performance budgets.

**When to invoke.** When designing the technical foundation of a game.

### Samus Shepard — `chico-gds-game-designer`

> Lead Game Designer

Type: Memory · Module: GDS

Game Design Documents (GDD), creative vision, mechanics design, narrative design.

**When to invoke.** When you need a GDD. When mechanics need design before code.

### Link Freeman — `chico-gds-game-dev`

> Senior Game Developer

Type: Memory · Module: GDS

Game story execution, code implementation, QA test authorship, sprint orchestration for game projects.

**When to invoke.** When implementing a feature in a game project.

### Indie — `chico-gds-game-solo-dev`

> Elite Solo Dev

Type: Memory · Module: GDS

Rapid prototyping, solo quick-flow development, game jams.

**When to invoke.** Solo indie projects. Prototyping in 48-72 hours. Game jams.

### Paige (GDS) — `chico-gds-tech-writer`

> Technical Writer (Game)

Type: Memory · Module: GDS

Game-specific documentation: GDD writing assistance, mechanics reference, modding guides.

**When to invoke.** When the game project needs documentation.

---

## CMB module — Chico Builder (3 builders)

Meta-agents that build the system itself. Use these when you want to extend Chico with your own agents, modules, or workflows.

### Agent Builder — `chico-agent-builder`

> Agent Creation Framework

Type: Stateless · Module: CMB

Conversational discovery to create, edit, or analyze a Chico agent. Generates the SKILL.md, updates the manifests.

**When to invoke.** When you want to add a new specialist to your local Chico install.

### Module Builder — `chico-module-builder`

> Module Creation Framework

Type: Stateless · Module: CMB

Plan, create, and validate a Chico module. Generates the directory structure, config.yaml, boilerplate.

**When to invoke.** When you have a coherent set of skills/agents that deserves its own module.

### Workflow Builder — `chico-workflow-builder`

> Workflow Creation Framework

Type: Stateless · Module: CMB

Build, convert, and analyze workflow skills (single-purpose skills like `/chico-create-prd`).

**When to invoke.** When you want a custom slash-command workflow specific to your project.

---

## Summary table — all 42 agents

| Persona | Skill ID | Module | Type | Role |
|---|---|---|---|---|
| Mary++ | chico-agent-analyst | CMM | Memory | Business analyst + market + personas |
| John++ | chico-agent-pm | CMM | Memory | PM + growth |
| Sally++ | chico-agent-ux-designer | CMM | Memory | UX + design system + a11y |
| Winston++ | chico-agent-architect | CMM | Memory | Architecture lead |
| Amelia++ | chico-agent-dev | CMM | Memory | Dev lead + orchestrator |
| Paige++ | chico-agent-tech-writer | CMM | Memory | Documentation lead |
| Murat++ | chico-tea | TEA | Memory | QA + verification |
| Frida | chico-web-brand | Web | Stateless | Brand identity |
| Oscar | chico-web-copy | Web | Stateless | Copy + microcopy + i18n |
| Atlas | chico-web-data-layer | Web | Stateless | Prisma + migrations |
| Sentinel | chico-web-auth | Web | Stateless | Auth + RBAC + OWASP |
| Pixel | chico-web-ui-components | Web | Stateless | Atomic components |
| Guardian | chico-web-forms | Web | Stateless | Forms + interactions |
| Navigator | chico-web-user-flows | Web | Stateless | End-to-end flows |
| Console | chico-web-admin | Web | Stateless | Admin dashboards |
| Bridge | chico-web-integration | Web | Stateless | External integrations |
| Pulse | chico-web-realtime | Web | Stateless | WebSocket + notifications |
| Beacon | chico-web-seo-perf | Web | Stateless | SEO + Lighthouse |
| Harbor | chico-web-docker | Web | Stateless | Docker + compose |
| Pipeline | chico-web-cicd | Web | Stateless | GitHub Actions |
| Nimbus | chico-web-cloud | Web | Stateless | Cloud infra |
| Iris | chico-web-analytics | Web | Stateless | Analytics + GDPR |
| Sentry | chico-web-monitoring | Web | Stateless | Error tracking + APM |
| Catalyst | chico-web-growth | Web | Stateless | A/B + referral + onboarding |
| Tracker | chico-web-bug-hunter | Web | Autonomous | Bug investigation |
| Compass | chico-web-feature-planner | Web | Stateless | Roadmap + RICE |
| Forge | chico-web-refactor | Web | Stateless | Tech debt |
| Carson | chico-cis-brainstorming-coach | CIS | Stateless | Brainstorm |
| Dr. Quinn | chico-cis-creative-problem-solver | CIS | Stateless | TRIZ + ToC |
| Maya | chico-cis-design-thinking-coach | CIS | Stateless | Design thinking |
| Victor | chico-cis-innovation-strategist | CIS | Stateless | Blue Ocean + JTBD |
| Caravaggio | chico-cis-presentation-master | CIS | Stateless | Slides + pitch |
| Sophia | chico-cis-storyteller | CIS | Stateless | Narrative |
| Cloud Dragonborn | chico-gds-game-architect | GDS | Memory | Game architecture |
| Samus Shepard | chico-gds-game-designer | GDS | Memory | Game design |
| Link Freeman | chico-gds-game-dev | GDS | Memory | Game dev |
| Indie | chico-gds-game-solo-dev | GDS | Memory | Solo game dev |
| Paige (GDS) | chico-gds-tech-writer | GDS | Memory | Game documentation |
| Agent Builder | chico-agent-builder | CMB | Stateless | Create agents |
| Module Builder | chico-module-builder | CMB | Stateless | Create modules |
| Workflow Builder | chico-workflow-builder | CMB | Stateless | Create workflows |
| Chico | chico | Core | Orchestrator | Single entry point |

That's 42 specialists plus the Chico orchestrator itself.
