---
name: chico-static-prototype
description: "Generates a non-functional static Next.js prototype from the design artifacts (wireframes, design system, sitemap, brand). All pages, real styled components, clickable navigation, but 100% mocked data (zero API, zero DB, zero real auth). Use in the DESIGN phase, sub-step 'Static Code Prototype', to validate visually with the user before functional implementation."
user-invocable: true
trigger-patterns:
  - "static prototype"
  - "scaffold visual"
---

# chico-static-prototype — Non-functional static prototype

## Overview

Orchestration skill that produces a **navigable mockup in code** (Next.js + Pixel components) from the design artifacts. The prototype is **visually complete** (all pages, real components, real navigation, real typography, real realistic data) but **non-functional**: no API, no DB, no auth, no real business logic. Forms render and "submit" via a mock toast. Data comes from TypeScript constants in `src/mocks/`.

It is the step between Figma wireframes (static 2D) and the real product (functional) — a **clickable, styled version** the user can validate before we invest in the backend.

## Where this fits in the agency-playbook

Phase **DESIGN**, sub-step **Static Code Prototype**. Comes right before the DEVELOP phase. Critical for from-scratch sites/apps with rich visual content; skip it for bug fixes, refactors, pure backend work, or a non-visual tool.

## When to use

- **Always** for a from-scratch web/SaaS/mobile project with a rich UI, after Sally++, Frida, Pixel, Oscar have produced their artifacts
- **Always** when the user wants to "see what it will look like" before we code the logic
- **When you want to test UX with real users** (the prototype can be deployed within minutes for user testing)

## When NOT to use

- Bug fix, refactor, backend-only work (API, jobs, scripts)
- Modification of an existing project (use Pixel + Navigator directly)
- A site already well into dev (the prototype loses its purpose)
- A minimalist brief / question / piece of advice

## Required inputs

At minimum, a subset of the following artifacts must exist in `_chico-output/planning-artifacts/`:

| Artifact | Producer | Use in the prototype |
|---|---|---|
| `ia-sitemap.md` | Sally++ | List of pages to generate |
| `user-flows.md` | Sally++ or Navigator | Navigation between pages (what leads where) |
| `wireframes.md` | Sally++ | Rough layout of each page |
| `design-system.md` | Sally++ + Pixel | Tokens (colors, typography, spacing) + available components |
| `brand-strategy.md` | Frida | Final palette, typography, voice |
| `copy-guide.md` | Oscar | Microcopy, CTAs, headlines |
| `mvp-scope.md` | John++ | Which pages/features to include in the proto |
| `personas.md` | Mary++ | To generate realistic mocked data |

If some are missing, the skill still starts with smart defaults and reports what is missing to the user.

## Output

A folder `_chico-output/implementation-artifacts/static-prototype/` containing a complete and self-contained **Next.js 15 App Router** project, with:

```
static-prototype/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with brand, fonts, theme
│   │   ├── page.tsx                  # Home
│   │   ├── globals.css                # Tailwind + design tokens
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Mocked login
│   │   │   └── signup/page.tsx       # Mocked signup
│   │   ├── dashboard/page.tsx        # If app
│   │   └── ... (all pages from the sitemap)
│   ├── components/
│   │   ├── ui/                       # Atoms (Button, Input, Card, etc.)
│   │   ├── layout/                   # Header, Footer, Sidebar
│   │   └── sections/                 # Hero, Features, Pricing, etc.
│   ├── mocks/
│   │   ├── users.ts                  # MOCK_USERS = [...]
│   │   ├── products.ts
│   │   ├── analytics.ts
│   │   └── current-user.ts           # Mock of the "logged-in" user
│   └── lib/
│       └── mock-toast.ts              # showSuccessToast / showErrorToast for forms
├── public/
│   └── (placeholder images, logos, OG)
└── README.md                          # List of what is mocked, how to run, how to migrate
```

**The README.md** explains precisely:
- All mocked data and where it lives
- All form handlers that are stubs
- All "functional" links that actually lead to static pages
- A "Migration to the real thing" section: how to move from the proto to the real product (replace mocks with API, add Prisma, etc.)

## Strict prototype rules

1. **Zero API routes** (`src/app/api/` forbidden). If you need to display data, it is an import from `src/mocks/`.
2. **Zero Prisma, zero DB, zero `.env` file required to run.**
3. **Zero real auth.** A `MockAuthProvider` context simulates the logged-in user with a dev toggle to switch between logged-in / logged-out.
4. **Forms displayed but not wired.** `onSubmit` does `e.preventDefault()` + `showSuccessToast("Request sent (mock)")`.
5. **Everything is clickable.** Buttons, links, tabs, dropdowns — every interaction leads somewhere or shows a mock state.
6. **Real realistic data.** No "Lorem ipsum", no "Test User 1". If Mary++ produced personas, use them to generate 10–50 believable mocks (locale-appropriate names, recent dates, realistic prices for the domain).
7. **Clean build.** `npm run build` must pass without warning. Lighthouse 90+ on Accessibility and Best Practices (Performance can be lower since images are not optimized).
8. **No TODO, FIXME, placeholder.** If something is missing, generate a clean visual fallback (skeleton, empty state).

## Capabilities (invocation codes)

| Code | Description |
|------|-------------|
| **SCAFFOLD** | Initialize the Next.js project with config + design system from the artifacts |
| **PAGES** | Generate all sitemap pages with layout + sections |
| **MOCKS** | Create `src/mocks/` files with realistic data (based on personas) |
| **NAV** | Wire the header/footer/sidebar navigation according to `user-flows.md` |
| **FORMS** | Implement all forms with client-side Zod validation + mock toast on submit |
| **AUTH-MOCK** | Configure the `MockAuthProvider` with a dev toggle |
| **README** | Generate the README that documents everything mocked and the migration path |

## Mini-team activated by default

This skill is itself a mini-team orchestrator. It invokes in this order:

1. **Pixel** (`chico-web-ui-components`) — produces UI atoms/molecules/organisms
2. **Navigator** (`chico-web-user-flows`) — wires pages and navigation
3. **Guardian** (`chico-web-forms`) — lays out forms (in mock mode)
4. **Oscar** (`chico-web-copy`) — applies copy to headlines, CTAs, microcopy
5. **Murat++** (`chico-tea`) — verifies that the build passes (Pass 2 verify-production) and that navigation is consistent

All write to the **Discussion Board** `_chico-output/discussions/static-prototype-<date>.md` for traceability (see Chico's SKILL.md for the Discussion Board pattern).

## Anti-patterns

- Building a real API "just to show it could work" — it dilutes the proto and slows validation
- Using Lorem ipsum — the user must be able to show the proto to a real client
- Skipping responsiveness — a proto that breaks on mobile is not validatable
- Forgetting the migration README — the proto should be able to become the real code, not thrown away
- Implementing a full feature that was not in `mvp-scope.md` (Rule R0 — the brief is sacred)

## On Activation

1. **Check inputs**: scan `_chico-output/planning-artifacts/` to identify which artifacts exist (sitemap, wireframes, design-system, brand, copy, mvp-scope, personas). List what is missing to the user with a sensible default for each.
2. **Create the Discussion Board**: `_chico-output/discussions/static-prototype-<YYYY-MM-DD>.md` with initial context (brief, scope, available artifacts).
3. **Launch the mini-team** in the order Pixel → Navigator → Guardian → Oscar → Murat++ with handoff via the Discussion Board.
4. **Final output**: a complete Next.js project in `_chico-output/implementation-artifacts/static-prototype/`, migration README.md, passing build, Lighthouse Accessibility 90+.
5. **Index via RAG**: `chico_memory_index` on the produced folder for future reuse.
6. **Report to Chico**: number of pages generated, components created, mocks defined, build status, link to open the proto locally (`cd ... && npm install && npm run dev`).

## Migration path to the real thing (to document in the produced README)

```
Static proto             →  Real product
─────────────────────       ──────────────────
src/mocks/users.ts       →  Prisma + API /api/users
MockAuthProvider         →  NextAuth or Clerk
showSuccessToast(mock)   →  fetch() to a real API
hardcoded data           →  fetch() on load + cache
"clickable" buttons      →  real business actions
```

This README section is the entry point for **Amelia++** in the DEVELOP phase — she picks up the proto and replaces mock by mock, layer by layer, until the final product.
