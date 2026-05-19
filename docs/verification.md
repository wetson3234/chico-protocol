# Verification

Chico Protocol has five focused verification passes. They are **on-demand** — not automatic — and each one is a separate skill. You can invoke any pass individually (`/chico-verify-production`), chain them in sequence, or let Murat++ run a full suite. Each pass loops until clean (Rule R9 — no iteration limit).

The big difference between Chico's verification and most "AI checks" you've seen elsewhere is **Pass 4**: it actually runs your application in a real Chromium browser via Playwright. Static analysis catches what static analysis catches. Real-runtime catches the rest.

---

## Why five passes (and not one)

A single monolithic "is this good?" check is a coin flip — too many dimensions, too easy to silently skip a category. Five focused passes each answer a single, sharp question:

| Pass | Skill | Sharp question |
|---|---|---|
| 0 | `/chico-verify-concept` | Does the implementation match the brief, feature by feature? |
| 2 | `/chico-verify-production` | Does it build, do imports resolve, do assets exist? |
| 3 | `/chico-verify-functional` | Do interactive elements actually do something real? |
| 4 | `/chico-verify-browser` | Does it run in a real browser without errors? |
| 5 | `/chico-verify-completude` | Are there any forbidden patterns left (TODO, mock, lorem)? |

(Pass 1 is reserved for future linting work — currently skipped.)

Each pass produces a structured report in `_chico-output/reports/`. Reports are markdown, signed with the pass number and timestamp, and consumable by humans or by the next pass.

---

## Pass 0 — Verify Concept

**Skill.** `/chico-verify-concept`

**Sharp question.** Does the implementation match the brief?

**What it checks.**

- Every feature mentioned in the original request exists in the code
- No feature was silently substituted ("you asked for OAuth, we gave you password" — forbidden by R0)
- No feature was simplified ("we'll add real-time later" — forbidden by R0)
- No "coming soon" placeholders in user-facing surfaces
- Edge cases mentioned in the brief are actually handled

**How it works.** Reads the original brief from `chico-state.md` and the relevant planning artifacts (PRD, user flows, stories). Walks each requested feature, locates its implementation in the code, and produces a fidelity matrix:

```
| Feature                          | Status  | Location               | Notes |
|----------------------------------|---------|------------------------|-------|
| Login with email + password      | ✅      | src/app/login/         |       |
| Forgot password flow             | ❌      | not implemented        | R0 violation |
| Remember me checkbox             | ⚠       | UI exists, no logic    | R2 violation |
```

**When to invoke.** After implementation, before any other pass. If Pass 0 fails, the other passes are largely irrelevant.

**Output.** `_chico-output/reports/verify-concept-<timestamp>.md`

---

## Pass 2 — Verify Production

**Skill.** `/chico-verify-production`

**Sharp question.** Does it build cleanly?

**What it checks.**

- `npm run build` returns exit code 0 with no warnings
- TypeScript: zero type errors, zero `any` slipped past (configurable strictness)
- Every `import` statement resolves to an existing file or installed package
- Every static asset referenced (images, fonts, JSON, etc.) exists at the expected path
- Every config file required by the framework is present and valid (`next.config.js`, `tsconfig.json`, etc.)
- `package.json` scripts referenced in CI exist
- `.env.example` covers every `process.env.VAR` used in the code (R8)

**How it works.** Spawns the build via a subprocess, captures stdout + stderr, parses for errors. Then statically walks the import graph using TypeScript's compiler API or a Babel parser. Then walks asset references in code and template files.

**When to invoke.** After Pass 0 passes. Whenever you suspect a build regression.

**Output.** `_chico-output/reports/verify-production-<timestamp>.md` with structured error tables.

---

## Pass 3 — Verify Functional

**Skill.** `/chico-verify-functional`

**Sharp question.** Do interactive elements actually do something real?

**What it checks.**

- Zero empty handlers — every `onClick`, `onSubmit`, `onChange`, `onBlur` has actual logic, not just `() => {}` or `console.log`
- Zero mock responses — no hardcoded JSON pretending to come from an API
- Zero dead links — no `href="#"`, no links to nonexistent pages, no `<a>` without `href`
- Forms submit to real endpoints
- API routes have real implementations, not `return NextResponse.json({ ok: true })` with no logic
- Authentication flows actually authenticate (a login that doesn't set a session is a Pass 3 failure)
- Critical user flows complete end-to-end (login → dashboard, signup → email confirmation, checkout → payment)

**How it works.** Combines AST analysis (finding handlers and inspecting their bodies) with route-graph analysis (matching every `<Link href>` to a real page or API route). For critical flows, it can hand off to Pass 4 to run them in a browser.

**When to invoke.** After Pass 2 passes. Especially before user testing — Pass 3 catches the "looks done but doesn't actually work" failure mode.

**Output.** `_chico-output/reports/verify-functional-<timestamp>.md` with per-violation explanations and file:line references.

---

## Pass 4 — Verify Browser

**Skill.** `/chico-verify-browser`

**Sharp question.** Does it run in a real browser without errors?

**What it checks.**

- Boots the application in headless Chromium via Playwright
- Navigates to each declared page (from sitemap or route enumeration)
- Captures **all console messages** at every level (error, warning, info)
- Captures **all network requests** and flags 4xx/5xx responses
- Captures **uncaught JS exceptions** thrown during page lifecycle
- Captures **failed resource loads** (404s on images, missing CSS, etc.)
- Takes a full-page screenshot of every page for visual verification
- Optionally runs Lighthouse for performance/accessibility/SEO scoring

**How it works.** The Playwright harness lives at `.claude/scripts/browser-verify.mjs`. It:

1. Reads the project's run configuration (port, base URL, build/dev command)
2. Spawns the application (typically `npm run dev` or `npm run start`)
3. Waits for the port to respond
4. Walks the page list from the sitemap (or enumerates routes from the file system if no sitemap)
5. For each page:
   - Attaches listeners for `console`, `pageerror`, `request`, `response`
   - Navigates with `page.goto(url, { waitUntil: 'networkidle' })`
   - Captures everything
   - Takes a screenshot to `_chico-output/reports/screenshots/`
6. Optionally invokes Lighthouse via the Chrome DevTools Protocol
7. Writes a structured markdown report

**Why this matters.** Static analysis can't catch:

- `Cannot read properties of undefined` thrown at runtime
- A 404 on a hero image that the build doesn't detect
- A hydration error from a server/client component mismatch
- An axe-core accessibility violation that only manifests when the DOM exists
- A CSP violation blocking a third-party script

Pass 4 catches all of these. It's the highest-signal pass in the suite.

**When to invoke.** After Pass 3 passes. Before merging. Before launching. Whenever you've made changes that could affect runtime.

**Output.** `_chico-output/reports/verify-browser-<timestamp>.md` + screenshots at `_chico-output/reports/screenshots/`.

### Requirements for Pass 4

- Playwright installed (`@playwright/test` in devDependencies)
- Chromium downloaded (`npx playwright install chromium`)
- The application must be runnable locally (a dev or build command that listens on a known port)
- Node 20+

The installer adds the `browser-verify.mjs` script; Playwright itself you install when you first run Pass 4 (the script prompts).

---

## Pass 5 — Verify Completude

**Skill.** `/chico-verify-completude`

**Sharp question.** Are there any forbidden patterns left?

**What it checks.** A grep sweep across the entire codebase for:

- `TODO`, `FIXME`, `XXX`, `HACK`, `WIP`, `KLUDGE`
- `placeholder`, `Lorem ipsum`, `lorem ipsum`
- `mock` (with context filtering to avoid false positives on legit `__mocks__` test files)
- `coming soon`, `to be implemented`, `not yet implemented`
- `console.log` in production code (allowed in tests, warnings, scripts)
- `debugger` statements
- Commented-out code blocks (heuristic threshold)
- Untracked `process.env.VAR` references (cross-checked with `.env.example` per R8)

**How it works.** Pure regex sweep over source files (excluding `node_modules`, `.next`, `dist`, etc., and respecting `.gitignore`). For each match, classifies severity (blocking / warning / info) and produces a violation list with file:line references.

**When to invoke.** The final pre-merge / pre-launch sweep. Pass 5 is the cleanest pass to run last because it catches debug artifacts that other passes might miss.

**Output.** `_chico-output/reports/verify-completude-<timestamp>.md` with a per-pattern violation count.

---

## Chaining passes

You can chain manually:

```
/chico-verify-concept       # Pass 0
/chico-verify-production    # Pass 2
/chico-verify-functional    # Pass 3
/chico-verify-browser       # Pass 4
/chico-verify-completude    # Pass 5
```

Or you can ask Chico to run a full suite:

```
/chico run the full verification suite on the changes from this sprint
```

Chico will sequence the passes, fix violations between passes (delegating fixes to Amelia++ or specialists), and re-run failed passes until they're clean. This is where R9 (unlimited correction iterations) kicks in — the loop doesn't stop until every pass is green.

---

## What verification is NOT

A few things to be clear about, because expectations matter:

- **Verification is not a substitute for human judgment.** Pass 0 checks the brief against the code, but it can't tell you the brief was wrong.
- **Verification is not a substitute for actual user testing.** Pass 4 catches runtime errors, not whether real users understand the UI.
- **Verification is not free.** Pass 4 in particular spawns a browser and walks every page — on a large app it can take minutes. Run it on a representative subset for fast iteration; run it fully before merging.
- **Verification is not automatic.** Chico doesn't run any pass without being asked. The framework respects that you might want to commit work-in-progress without triggering a full suite.

---

## Customizing the passes

Each verify skill has configuration knobs documented in its own `SKILL.md` under `.claude/skills/chico-verify-*/`. Common adjustments:

- **Pass 2** — adjust TypeScript strictness, choose between `npm run build` and a typecheck-only command
- **Pass 4** — adjust the dev command, the port, the page list, whether to run Lighthouse, headless vs headed mode
- **Pass 5** — adjust the forbidden pattern list, add domain-specific patterns (e.g. internal placeholders)

Customizations are per-project and live in `_chico/verify/config.yaml`.
