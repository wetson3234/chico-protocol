---
name: chico-verify-completude
description: "Pass 5: Zero TODO/Placeholder Verification - Final sweep to ensure absolute completeness. Nothing left unfinished, no debug artifacts, no placeholders."
user-invocable: true
trigger-patterns:
  - "verify completude"
  - "check completeness"
  - "zero todo"
  - "pass 5"
  - "chico verify completude"
---

# Verify Completude — Pass 5: Zero TODO/Placeholder Verification

This is a **verification skill**, not a persona agent. No Sanctum, no personality. Pure completeness verification.

## Purpose

Final sweep to ensure absolute completeness. Nothing left unfinished. No TODO, no placeholder, no lorem ipsum, no debug console.log, no mock data, no dead link, no undocumented env var. The codebase must be production-ready.

## Configuration

- **Config path:** `{project-root}/_chico/verify/config.yaml`
- **Reports output:** `{project-root}/_chico-output/reports/verify-completude-report.md`
- **Variables:** `{user_name}`, `{communication_language}`, `{document_output_language}`

## Execution Steps

### Step 1 — Grep Scan for Forbidden Patterns

Search ALL source files in `src/`, `prisma/`, and `tests/` for forbidden patterns. Exclude: `node_modules/`, `.next/`, `dist/`, `.git/`.

**Code markers (case-insensitive):**
- `TODO` — incomplete work
- `FIXME` — known bug or issue
- `HACK` — workaround that needs proper fix
- `XXX` — dangerous or problematic code
- `@todo` — JSDoc-style TODO

**Placeholder content (case-insensitive):**
- `placeholder` (in string literals, not HTML attribute name)
- `lorem ipsum` / `Lorem Ipsum`
- `dummy` (as in dummy data, dummy text)
- `sample text`
- `example content`

**Incomplete markers (case-insensitive):**
- `coming soon`
- `a venir`
- `to be implemented`
- `not yet`
- `not implemented`
- `WIP`
- `work in progress`
- `under construction`

**Debug artifacts:**
- `console.log(` — except in dedicated error-handling/logging utilities
- `console.warn(` — except in dedicated logging utilities
- `console.error(` — except in catch blocks and error boundaries
- `debugger` — JavaScript debugger statement
- `alert(` — JavaScript alert (not in test files)

**Mock indicators (outside test files):**
- `mockData`
- `fakeData`
- `hardcoded`
- `stubbed`
- `dummyData`
- `testData` (in production code, not test files)

**Exclusion rules:**
- `node_modules/` — always excluded
- `.next/` — always excluded
- `dist/` — always excluded
- Test files (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`, `__tests__/`) — mock/test data patterns are OK in tests
- `console.error` in `catch` blocks — acceptable for error handling
- `placeholder` as an HTML input attribute — acceptable (e.g., `placeholder="Enter email"`)

For each match: record file path, line number, pattern matched, and the full line of code.

### Step 2 — Scan Links and Navigation

**Internal links:**
1. Find every `href` attribute and `<Link to=` / `<Link href=` in `.tsx` files.
2. For each internal link (starts with `/`): verify the target page exists in `src/app/`.
3. For each anchor link (starts with `#`): verify a matching `id` attribute exists on the same page.

**Navigation elements:**
1. Find the header/navbar component (search for `nav`, `Navbar`, `Header`, `Navigation` components).
2. Extract every link in the navigation.
3. For each navigation link: verify the target route exists and renders content.

**Sidebar navigation (if applicable):**
1. Find sidebar components.
2. Extract every link.
3. Verify each link target exists.

**Footer links:**
1. Find footer components.
2. Extract every link.
3. Verify internal links point to real pages. External links should be valid URLs.

For each broken link: record the component file, line number, link value, and expected target.

### Step 3 — Scan Environment Variables

1. Find every usage of `process.env.` in the codebase (all `.ts`, `.tsx`, `.js`, `.mjs` files).
2. Extract the full variable name (e.g., `process.env.DATABASE_URL`).
3. Build a complete list of all environment variables used.
4. Read `.env.example` (or `.env.local.example`).
5. For each env var used in code: verify it is listed in `.env.example` with a descriptive comment.
6. For each env var in `.env.example`: verify it is actually used somewhere in the code (detect unused env vars).

If `.env.example` does not exist: create it with all discovered env vars and descriptive placeholder values.

For each missing entry: record the env var name, the file(s) where it is used, and what it is for.

### Step 4 — Final Build Verification

1. Run `npm run build`.
2. The build MUST pass with:
   - **Zero errors** — no TypeScript errors, no module resolution failures, no syntax errors
   - **Zero warnings** — no unused variables, no implicit any types, no deprecation warnings
3. If there are warnings, fix them:
   - Unused imports: remove them
   - Unused variables: remove or prefix with `_`
   - Implicit `any`: add proper types
   - Deprecated API usage: update to current API
4. Re-run build until completely clean.

### Step 5 — Fix All Issues

For each issue found in Steps 1-4:

**Code markers (TODO, FIXME, etc.):**
- Implement the TODO — do the work that was deferred.
- Fix the FIXME — resolve the known bug.
- Replace the HACK — implement the proper solution.
- If a TODO refers to a feature not in the brief, remove the TODO and the incomplete code.

**Placeholder content:**
- Replace lorem ipsum with real content appropriate to the product.
- Replace "sample text" with actual copy from the brief or contextually appropriate text.
- Replace dummy data with realistic seed data or proper empty states.

**Debug artifacts:**
- Remove all `console.log` calls (replace with proper logging if needed).
- Remove all `debugger` statements.
- Remove all `alert()` calls.
- Keep `console.error` only in error boundaries and catch blocks.

**Mock data in production code:**
- Replace with real database queries or API calls.
- If the data source is not available, implement a proper empty state.

**Broken links:**
- Create the missing page if the feature is in the brief.
- Remove the link if the feature is not in the brief.
- Fix the href to point to the correct route.

**Missing env vars in .env.example:**
- Add the variable with a descriptive comment and placeholder value.

### Step 6 — Produce Report

Generate a comprehensive report at `{project-root}/_chico-output/reports/verify-completude-report.md`:

```markdown
# Verify Completude Report — Pass 5

**Project:** [project name]
**Date:** [timestamp]
**Verified by:** Chico Verify Completude

## Summary

- Files scanned: [N]
- Forbidden patterns found: [N] (fixed: [N])
- Broken links found: [N] (fixed: [N])
- Missing env var docs: [N] (fixed: [N])
- Build warnings: [N] (fixed: [N])
- Final build status: PASS / FAIL
- Overall status: PASS / FAIL

## Forbidden Pattern Scan

### Code Markers
| # | File | Line | Pattern | Full Line | Status |
|---|------|------|---------|----------|--------|
| 1 | [file] | [line] | TODO | `// TODO: implement auth` | FIXED |

### Placeholder Content
| # | File | Line | Pattern | Full Line | Status |
|---|------|------|---------|----------|--------|
| 1 | [file] | [line] | lorem ipsum | `<p>Lorem ipsum dolor...</p>` | FIXED |

### Debug Artifacts
| # | File | Line | Pattern | Full Line | Status |
|---|------|------|---------|----------|--------|
| 1 | [file] | [line] | console.log | `console.log("debug", data)` | REMOVED |

### Mock Data
| # | File | Line | Pattern | Full Line | Status |
|---|------|------|---------|----------|--------|
| 1 | [file] | [line] | mockData | `const mockData = [...]` | REPLACED |

## Link Verification

### Navigation Links
| # | Component | Link | Target | Status |
|---|----------|------|--------|--------|
| 1 | Header | `/dashboard` | `src/app/dashboard/page.tsx` | PASS |

### All Internal Links
| # | File | Line | Link | Target Exists | Status |
|---|------|------|------|--------------|--------|
| 1 | [file] | [line] | `/pricing` | YES | PASS |

## Environment Variables

| # | Variable | Used In | In .env.example | Description | Status |
|---|----------|---------|-----------------|-------------|--------|
| 1 | `DATABASE_URL` | `prisma/schema.prisma` | YES | PostgreSQL connection string | PASS |
| 2 | `NEXT_PUBLIC_API_URL` | `src/lib/api.ts` | NO | API base URL | ADDED |

## Build Verification

- Build attempt 1: [N] errors, [N] warnings
- Build attempt 2: [N] errors, [N] warnings
- Final build: 0 errors, 0 warnings — PASS

## Corrections Applied

| # | File | Change | Category |
|---|------|--------|----------|
| 1 | `src/app/page.tsx:15` | Removed `console.log` | Debug artifact |
| 2 | `src/components/Hero.tsx:8` | Replaced lorem ipsum with real copy | Placeholder |
```

## Correction Loop

After fixing all issues:
1. Re-run the full grep scan to verify no forbidden patterns remain.
2. Re-scan links to verify all are valid.
3. Re-check env vars documentation.
4. Re-run `npm run build` to confirm zero errors and zero warnings.
5. If any new issues are found (fixes may introduce new patterns), fix and repeat.

**No iteration limit (Rule R9).** Continue until the codebase is absolutely clean.

## Exit Criteria

- ZERO forbidden patterns (TODO, FIXME, placeholder, lorem ipsum, console.log, debugger, mock data) in production code
- ZERO broken internal links
- ALL environment variables documented in `.env.example`
- `npm run build` passes with ZERO errors and ZERO warnings
- Report is saved to `{project-root}/_chico-output/reports/verify-completude-report.md`
