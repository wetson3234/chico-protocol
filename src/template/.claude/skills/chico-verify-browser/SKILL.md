---
name: chico-verify-browser
description: "Pass 4: Real Playwright Browser Testing - Test the running application in a real Chromium browser using Playwright to catch runtime errors that static analysis and builds miss."
user-invocable: true
trigger-patterns:
  - "verify browser"
  - "browser test"
  - "playwright verify"
  - "pass 4"
  - "chico verify browser"
---

# Verify Browser — Pass 4: Real Playwright Browser Testing

This is a **verification skill**, not a persona agent. No Sanctum, no personality. Pure runtime browser verification.

## Purpose

Test the running application in a real Chromium browser using Playwright. This catches runtime errors that static analysis and builds miss: hydration mismatches, JS exceptions, missing assets at runtime, broken API calls, white screens, and visual regressions.

## Configuration

- **Config path:** `{project-root}/_chico/verify/config.yaml`
- **Reports output:**
  - `{project-root}/_chico-output/reports/browser-report.json`
  - `{project-root}/_chico-output/reports/browser-report.md`
  - `{project-root}/_chico-output/reports/screenshots/`
- **Variables:** `{user_name}`, `{communication_language}`, `{document_output_language}`

## Execution Steps

### Step 1 — Ensure Playwright is Installed

1. Check if Playwright is in `package.json` devDependencies.
2. If not installed, run:
   ```bash
   npm install -D playwright @playwright/test
   npx playwright install chromium
   ```
3. Verify Chromium binary is available: `npx playwright install --dry-run chromium`.
4. If the browser-verify script does not exist at `.claude/scripts/browser-verify.mjs`, create it (see Browser Verify Script section below).

### Step 2 — Start the Dev Server

1. Check if a dev server is already running on the expected port (default: 3000).
2. If not running, start it:
   ```bash
   npm run dev &
   ```
3. Wait for the server to be ready by polling `http://localhost:3000` until it responds (max 60 seconds).
4. If the dev server fails to start, check the error output and fix the issue before proceeding.

For production mode testing (optional, after dev mode passes):
```bash
npm run build && npm run start &
```

### Step 3 — Execute Browser Verification Script

Run the browser verification script:
```bash
node .claude/scripts/browser-verify.mjs
```

The script performs these checks for every page in the application:
1. Navigate to each route discovered from `src/app/` page files.
2. Capture all console messages (log, warn, error).
3. Capture all JS exceptions and uncaught errors.
4. Capture all network requests and their status codes.
5. Check for hydration mismatches (Next.js specific).
6. Measure page load time.
7. Take a screenshot of each page.
8. Check for white/blank screens (page has no visible content).
9. Write results to `browser-report.json`.

### Step 4 — Read and Parse the Browser Report

Read `browser-report.json` and categorize every issue found.

### Step 5 — Categorize Errors

**CRITICAL (must fix, blocks release):**
- JavaScript exceptions / uncaught errors
- Hydration mismatches (server/client HTML mismatch)
- White screens (page renders with no visible content)
- HTTP 500 errors on any route or API call
- Page crashes or timeouts (> 30s load time)

**HIGH (must fix before release):**
- Console errors (not warnings)
- Network 4xx errors on API calls made by the application
- Missing assets returning 404 (images, fonts, scripts)
- Authentication redirect loops
- Form submission failures

**MEDIUM (should fix):**
- Console warnings
- Slow page loads (> 3 seconds)
- Layout issues visible in screenshots (overlap, overflow, missing styles)
- Deprecation notices in console
- Non-critical network errors (e.g., optional analytics failing)

**LOW (nice to fix):**
- Minor console warnings (React dev mode warnings, etc.)
- Deprecation notices from third-party packages
- Non-blocking performance warnings

### Step 6 — Fix CRITICAL and HIGH Errors

For each CRITICAL or HIGH error:

1. **Read the source code** at the error location. Use the stack trace or file reference from the error to locate the exact line.

2. **Identify root cause.** Common causes:
   - **Hydration mismatch:** Component uses `window`, `document`, or `Date.now()` during SSR without `useEffect` or dynamic import.
   - **TypeError:** Accessing property of `null`/`undefined` — missing null check, data not loaded yet.
   - **Prisma error:** Database not migrated, wrong query, missing relation.
   - **Missing handler:** Event handler calls a function that does not exist or is not imported.
   - **Env var missing:** `process.env.XXX` is undefined at runtime.
   - **Import error:** Module not found at runtime (path correct in TS but wrong at runtime).
   - **API error:** Route handler throws an unhandled exception.

3. **Fix the code.** Apply the minimal correct fix. Do not introduce new features or refactor — just fix the error.

4. **Re-run browser verification** for the affected page(s).

5. **Repeat** until zero CRITICAL errors remain.

### Step 7 — Review Screenshots

1. Open each screenshot saved in `_chico-output/reports/screenshots/`.
2. Check for visual issues:
   - Pages rendering with no styles (CSS not loading)
   - Overlapping elements
   - Missing images (broken image icons)
   - Text overflow or truncation
   - Mobile responsiveness issues (if viewport variants were tested)
3. If visual issues are found, trace them to the source CSS/component and fix.

### Step 8 — Produce Reports

**JSON Report** at `{project-root}/_chico-output/reports/browser-report.json`:
```json
{
  "timestamp": "ISO-8601",
  "pages_tested": [
    {
      "route": "/",
      "url": "http://localhost:3000/",
      "status": "PASS|FAIL",
      "load_time_ms": 450,
      "console_errors": [],
      "console_warnings": [],
      "js_exceptions": [],
      "network_errors": [],
      "hydration_errors": [],
      "screenshot": "screenshots/home.png"
    }
  ],
  "summary": {
    "total_pages": 10,
    "passed": 8,
    "failed": 2,
    "critical_errors": 0,
    "high_errors": 1,
    "medium_errors": 3,
    "low_errors": 5
  }
}
```

**Markdown Report** at `{project-root}/_chico-output/reports/browser-report.md`:

```markdown
# Browser Verification Report — Pass 4

**Project:** [project name]
**Date:** [timestamp]
**Verified by:** Chico Verify Browser
**Browser:** Chromium (Playwright)
**Mode:** Development / Production

## Summary

- Pages tested: [N]
- Pages PASS: [N]
- Pages FAIL: [N]
- CRITICAL errors: [N] (fixed: [N])
- HIGH errors: [N] (fixed: [N])
- MEDIUM errors: [N]
- LOW errors: [N]
- Overall status: PASS / FAIL

## Page Results

| # | Route | Load Time | Console Errors | JS Exceptions | Network Errors | Status |
|---|-------|-----------|---------------|---------------|----------------|--------|
| 1 | `/` | 450ms | 0 | 0 | 0 | PASS |
| 2 | `/dashboard` | 1200ms | 1 | 0 | 0 | FAIL |

## CRITICAL Errors (Fixed)

| # | Page | Error | Root Cause | Fix Applied |
|---|------|-------|-----------|-------------|
| 1 | `/dashboard` | Hydration mismatch | `useDate()` in SSR | Wrapped in `useEffect` |

## HIGH Errors (Fixed)

| # | Page | Error | Root Cause | Fix Applied |
|---|------|-------|-----------|-------------|
| 1 | `/api/users` | 500 error | Missing Prisma migration | Ran `npx prisma migrate` |

## Screenshots

| Page | Screenshot | Visual Status |
|------|-----------|--------------|
| Home | `screenshots/home.png` | OK |
| Dashboard | `screenshots/dashboard.png` | OK (after fix) |

## Iterations

- Iteration 1: 3 CRITICAL, 2 HIGH errors
- Iteration 2: 1 CRITICAL, 0 HIGH errors
- Iteration 3: 0 CRITICAL, 0 HIGH errors — PASS
```

## Browser Verify Script

If `.claude/scripts/browser-verify.mjs` does not exist, create it with this logic:

1. Import `chromium` from `playwright`.
2. Launch headless Chromium.
3. Discover all routes from `src/app/**/page.tsx` files.
4. For each route:
   a. Create a new page context.
   b. Set up listeners for console messages, JS exceptions, and network responses.
   c. Navigate to the route with a 30-second timeout.
   d. Wait for `networkidle` state.
   e. Check if the page has visible content (`document.body.innerText.length > 0`).
   f. Take a full-page screenshot.
   g. Record all captured events.
5. Write results to `browser-report.json`.
6. Close the browser.

## Correction Loop

**No iteration limit (Rule R9).** Continue running browser verification and fixing errors until:
- Zero CRITICAL errors
- Zero HIGH errors
- All pages load successfully
- No white screens
- No JS exceptions

## Exit Criteria

- ZERO CRITICAL errors across all pages
- ZERO HIGH errors across all pages
- ALL pages load within 30 seconds
- NO white screens or blank pages
- NO JS exceptions or uncaught errors
- Screenshots captured for all pages
- Reports saved to `{project-root}/_chico-output/reports/`
