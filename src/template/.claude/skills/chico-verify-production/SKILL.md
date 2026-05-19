---
name: chico-verify-production
description: "Pass 2: Build & Import Verification - Ensure the project builds cleanly and all references (imports, assets, configs, routes) are valid."
user-invocable: true
trigger-patterns:
  - "verify production"
  - "check build"
  - "verify imports"
  - "pass 2"
  - "chico verify production"
---

# Verify Production — Pass 2: Build & Import Verification

This is a **verification skill**, not a persona agent. No Sanctum, no personality. Pure build and reference validation.

## Purpose

Ensure the project builds cleanly and all references are valid. Every import points to a real file or installed package. Every referenced asset exists. Every config file is present and correct. Every route is accessible.

## Configuration

- **Config path:** `{project-root}/_chico/verify/config.yaml`
- **Reports output:** `{project-root}/_chico-output/reports/verify-production-report.md`
- **Variables:** `{user_name}`, `{communication_language}`, `{document_output_language}`

## Execution Steps

### Step 1 — Run Build

1. Execute `npm run build` from the project root.
2. Capture the FULL output (stdout and stderr).
3. If the build succeeds with zero errors and zero warnings, record `BUILD: PASS`.
4. If the build fails, proceed to the correction loop before continuing.

### Step 2 — Parse Build Errors (if build failed)

For each build error:
1. Extract the error message, file path, and line number.
2. Read the source file at the error location.
3. Identify the root cause:
   - Missing import (file does not exist)
   - Type error (TypeScript mismatch)
   - Syntax error
   - Missing dependency (package not installed)
   - Configuration error
4. Fix the issue directly in the source code.
5. Re-run `npm run build`.
6. Repeat until build passes cleanly.

### Step 3 — Audit Imports

For every `.ts` and `.tsx` file in the project (excluding `node_modules/`, `.next/`, `dist/`):

1. Parse all import statements:
   - `import X from './path'` — relative imports
   - `import X from '@/path'` — alias imports
   - `import X from 'package'` — package imports
2. For each relative import: verify the target file exists at the resolved path. Check with and without extensions (`.ts`, `.tsx`, `.js`, `.jsx`, `/index.ts`, `/index.tsx`).
3. For each alias import (e.g., `@/`): resolve the alias from `tsconfig.json` paths, then verify the target file exists.
4. For each package import: verify the package is listed in `package.json` dependencies or devDependencies.
5. Record any broken imports with file path, line number, import statement, and reason.

### Step 4 — Audit Assets

For every referenced asset in the codebase:
1. Search for image references: `src=`, `url(`, `background`, `Image`, `<img`.
2. Search for font references: `@font-face`, font file imports.
3. Search for icon references: SVG imports, icon component imports.
4. For each reference: verify the asset file exists at the referenced path.
5. Check the `public/` directory for static assets.
6. Record any missing assets with the referencing file, line number, and expected asset path.

### Step 5 — Audit Configs

Verify ALL required configuration files exist and are valid:

| File | Required | Check |
|------|----------|-------|
| `next.config.js` or `next.config.mjs` or `next.config.ts` | Yes (Next.js) | Exists, valid syntax |
| `tailwind.config.js` or `tailwind.config.ts` | Yes (if Tailwind used) | Exists, content paths correct |
| `tsconfig.json` | Yes | Exists, valid JSON, paths resolve |
| `postcss.config.js` or `postcss.config.mjs` | Yes (if PostCSS used) | Exists, plugins listed |
| `.env.example` | Yes | Exists, lists all required env vars |
| `package.json` | Yes | Exists, all scripts defined |
| `prisma/schema.prisma` | If Prisma used | Exists, valid schema |

For each missing or invalid config: create it or fix it.

### Step 6 — Audit Routes

For every page file in `src/app/` (Next.js App Router):
1. List all `page.tsx` files and their corresponding routes.
2. For each route: verify the page component renders without import errors.
3. Check for orphan pages (pages that exist but are not linked from navigation).
4. Check for dead routes (navigation links pointing to non-existent pages).
5. Verify layout files exist where needed (`layout.tsx`).
6. Verify loading and error states exist where appropriate.

### Step 7 — Produce Report

Generate a Markdown report at `{project-root}/_chico-output/reports/verify-production-report.md`:

```markdown
# Verify Production Report — Pass 2

**Project:** [project name]
**Date:** [timestamp]
**Verified by:** Chico Verify Production

## Summary

- Build status: PASS / FAIL (iterations needed: [N])
- Broken imports found: [N] (fixed: [N])
- Missing assets found: [N] (fixed: [N])
- Config issues found: [N] (fixed: [N])
- Route issues found: [N] (fixed: [N])
- Overall status: PASS / FAIL

## Build Log

```
[final clean build output]
```

## Import Audit

| # | File | Line | Import Statement | Issue | Fixed |
|---|------|------|-----------------|-------|-------|
| 1 | [file] | [line] | `import X from Y` | [reason] | YES/NO |

## Asset Audit

| # | Referencing File | Line | Expected Asset Path | Issue | Fixed |
|---|-----------------|------|-------------------|-------|-------|
| 1 | [file] | [line] | [path] | Missing | YES/NO |

## Config Audit

| Config File | Status | Issues | Fixed |
|------------|--------|--------|-------|
| next.config.js | PASS/FAIL | [details] | YES/NO |

## Route Audit

| Route | Page File | Status | Issues |
|-------|----------|--------|--------|
| `/` | `src/app/page.tsx` | PASS/FAIL | [details] |
```

## Correction Loop

For each issue found:
1. Fix the issue directly (create missing file, fix import path, install package, update config).
2. Re-run `npm run build` after all fixes.
3. Re-audit the specific category that had issues.
4. Repeat until ALL audits pass.

**No iteration limit (Rule R9).** Continue until the build is clean and all audits pass.

## Exit Criteria

- `npm run build` passes with ZERO errors and ZERO warnings
- ZERO broken imports across all `.ts`/`.tsx` files
- ZERO missing assets referenced in code
- ALL required config files exist and are valid
- ALL routes are accessible and render correctly
- Report is saved to `{project-root}/_chico-output/reports/verify-production-report.md`
