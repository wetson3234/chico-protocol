---
name: chico-verify-functional
description: "Pass 3: Zero Dead Elements Verification - Ensure every interactive element in the UI actually works. No dead buttons, empty forms, or broken links."
user-invocable: true
trigger-patterns:
  - "verify functional"
  - "check dead elements"
  - "zero dead elements"
  - "pass 3"
  - "chico verify functional"
---

# Verify Functional — Pass 3: Zero Dead Elements Verification

This is a **verification skill**, not a persona agent. No Sanctum, no personality. Pure functional completeness verification.

## Purpose

Ensure every interactive element in the UI actually works. No dead buttons, no empty forms, no broken links. Every `onClick` does something real. Every `href` goes somewhere real. Every API route returns real data.

## Configuration

- **Config path:** `{project-root}/_chico/verify/config.yaml`
- **Reports output:** `{project-root}/_chico-output/reports/verify-functional-report.md`
- **Variables:** `{user_name}`, `{communication_language}`, `{document_output_language}`

## Execution Steps

### Step 1 — Scan for Empty Handlers

Search ALL `.tsx` and `.ts` files in `src/` for empty event handlers:

**Click handlers:**
- `onClick={() => {}}` or `onClick={() => null}` or `onClick={() => undefined}`
- `onClick={handleClick}` where `handleClick` is defined as `() => {}` or `() => null`
- `onClick={() => { /* ... */ }}` with only comments, no real logic

**Form handlers:**
- `onSubmit={() => {}}` or `onSubmit={() => null}`
- `onSubmit={(e) => { e.preventDefault() }}` with no other logic
- `onSubmit={handleSubmit}` where handler only prevents default

**Input handlers:**
- `onChange={() => {}}` or `onChange={() => null}`
- `onChange={handleChange}` where handler does nothing with the value
- `onBlur={() => {}}` or `onFocus={() => {}}` with empty bodies

**Other handlers:**
- `onKeyDown`, `onKeyUp`, `onKeyPress` with empty bodies
- `onScroll`, `onResize` with empty bodies
- `onDragStart`, `onDrop` with empty bodies

For each found: record file, line number, handler type, and the empty expression.

### Step 2 — Scan for Dead Links

Search ALL `.tsx` and `.ts` files for non-functional links:

**Dead href patterns:**
- `href="#"`
- `href=""`
- `href="javascript:void(0)"`
- `href="javascript:;"`
- `href={undefined}` or `href={null}`

**Broken route links:**
- `<Link href="/some-page">` where `src/app/some-page/page.tsx` does not exist
- `<Link href="/some-page">` where the route is defined but the page component is empty or a stub
- `router.push('/some-page')` where the target page does not exist

**External link checks:**
- Links to external URLs should have `target="_blank"` and `rel="noopener noreferrer"`
- Links with `#section-id` should have a matching `id` attribute somewhere on the page

For each found: record file, line number, link value, and why it is dead.

### Step 3 — Scan API Routes for Mock Responses

Search ALL files in `src/app/api/` (or API route directories) for mock/stub behavior:

**Hardcoded responses:**
- Routes returning hardcoded JSON objects instead of database queries
- Routes returning static arrays of fake data
- `return NextResponse.json({ message: "Not implemented" })`
- `return NextResponse.json({ data: [] })` with no actual data fetching

**Incomplete handlers:**
- Routes with `TODO` or `FIXME` in the handler body
- Routes with commented-out logic and a placeholder return
- Routes that catch all errors with a generic message and no actual error handling
- `GET`/`POST`/`PUT`/`DELETE` handlers that are defined but empty

**Mock data patterns:**
- Variables named `mockData`, `fakeData`, `dummyData`, `testData` (outside test files)
- Hardcoded user IDs, emails, or other data that should come from auth/DB
- `Math.random()` used to generate fake data in production routes

For each found: record file, line number, issue type, and the problematic code.

### Step 4 — Verify User Flows End-to-End

Trace these critical user flows through the code (static analysis of the call chain):

**Authentication flow:**
1. Signup page exists and form submits to a real API route
2. API route creates a real user (Prisma/DB call, not mock)
3. Email verification is triggered (if in the brief)
4. Login page exists and form submits to a real auth endpoint
5. Auth middleware protects dashboard routes
6. Dashboard page renders with real user data

**Core value proposition flow:**
1. Identify the main action the product enables (from the brief)
2. Trace the UI component that initiates this action
3. Verify the handler calls a real API route
4. Verify the API route performs real business logic
5. Verify the result is displayed back to the user

**Settings flow:**
1. Settings/Profile page exists
2. Form is pre-populated with current user data
3. Form submission calls a real API route
4. API route updates the database
5. Success/error feedback is shown to the user

For each flow: record status (COMPLETE/BROKEN), the point of failure if broken, and what is missing.

### Step 5 — Fix Issues

For each issue found in Steps 1-4:
1. **Empty handlers:** Connect the handler to real logic. If the logic does not exist yet, implement it. If it requires an API route, create the route. If it requires state management, add the state.
2. **Dead links:** Create the missing page, or update the link to point to an existing page, or remove the link if the feature is not in the brief.
3. **Mock API routes:** Replace hardcoded data with real database queries. Implement the actual business logic. Add proper error handling.
4. **Broken flows:** Fill in the missing pieces. Create missing pages, API routes, middleware, or database queries.

### Step 6 — Produce Report

Generate a Markdown report at `{project-root}/_chico-output/reports/verify-functional-report.md`:

```markdown
# Verify Functional Report — Pass 3

**Project:** [project name]
**Date:** [timestamp]
**Verified by:** Chico Verify Functional

## Summary

- Files scanned: [N]
- Empty handlers found: [N] (fixed: [N])
- Dead links found: [N] (fixed: [N])
- Mock API routes found: [N] (fixed: [N])
- Broken user flows: [N] (fixed: [N])
- Overall status: PASS / FAIL

## Empty Handlers

| # | File | Line | Handler Type | Expression | Status |
|---|------|------|-------------|------------|--------|
| 1 | [file] | [line] | onClick | `() => {}` | FIXED/OPEN |

## Dead Links

| # | File | Line | Link Value | Issue | Status |
|---|------|------|-----------|-------|--------|
| 1 | [file] | [line] | `href="#"` | Dead anchor | FIXED/OPEN |

## Mock API Routes

| # | Route File | Method | Issue | Status |
|---|-----------|--------|-------|--------|
| 1 | [file] | GET | Hardcoded response | FIXED/OPEN |

## User Flow Verification

| # | Flow | Steps Verified | Status | Break Point | Fix Applied |
|---|------|---------------|--------|-------------|-------------|
| 1 | Authentication | 5/5 | PASS | - | - |
| 2 | Core Action | 3/5 | FAIL | Step 4: API mock | Implemented real handler |

## Corrections Applied

| # | File | Change Description | Lines Changed |
|---|------|--------------------|--------------|
| 1 | [file] | Connected onClick to real API call | 15-28 |
```

## Correction Loop

After all fixes:
1. Re-scan for empty handlers, dead links, and mock routes.
2. Re-verify user flows.
3. If new issues are found (fixes may have introduced new references), fix them.
4. Repeat until ZERO issues remain.

**No iteration limit (Rule R9).** Continue until every interactive element works.

## Exit Criteria

- ZERO empty event handlers in any `.tsx`/`.ts` file
- ZERO dead links (`href="#"`, `href=""`, broken routes)
- ZERO mock/hardcoded API responses in production routes
- ALL critical user flows verified as complete
- Report is saved to `{project-root}/_chico-output/reports/verify-functional-report.md`
