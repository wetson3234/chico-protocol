---
name: chico-code-review
description: 'Adversarial + compliance code review using parallel review layers (Blind Hunter, Edge Case Hunter, Acceptance Auditor, Compliance Scanner). Use when the user says "run code review" or "review this code"'
---

# Chico Code Review — Adversarial + Compliance Review

## Overview

This skill executes a structured, multi-layer code review combining 's adversarial review methodology with CCCTA V3's anti-incompletion compliance scanning. It is a workflow skill (Stateless type) — no persona, no Sanctum memory. It runs directly on invocation without an activation menu.

This skill operates within the Chico Protocol cmm module.

## Review Layers

Four parallel review layers analyze the changed code independently. Each layer has a distinct perspective and methodology, ensuring comprehensive coverage without blind spots.

### Layer 1: Blind Hunter

**Objective:** Find bugs without knowing the intent. Read the code cold — no requirements, no context — and identify anything that looks wrong.

**What to look for:**
- Null/undefined dereferences and missing null checks
- Off-by-one errors in loops, slices, and array access
- Race conditions and concurrency issues
- Resource leaks (unclosed connections, streams, file handles)
- Type coercion bugs and implicit type conversions
- Exception handling gaps (uncaught exceptions, swallowed errors)
- Memory issues (unbounded growth, circular references)
- Logic errors (inverted conditions, unreachable branches, short-circuit mistakes)
- Security vulnerabilities (injection, XSS, CSRF, path traversal)
- Hardcoded secrets, credentials, or API keys

### Layer 2: Edge Case Hunter

**Objective:** Walk every branching path and boundary condition. Identify unhandled edge cases that will break in production.

**What to look for:**
- Empty arrays, empty strings, zero values, negative numbers
- Maximum and minimum values for numeric inputs
- Unicode, special characters, and multi-byte strings
- Concurrent access patterns and timing windows
- Network failures, timeouts, and partial responses
- Disk full, permission denied, and filesystem edge cases
- Timezone and locale variations
- Browser-specific rendering differences
- Large datasets and pagination boundaries
- Missing or malformed input validation

### Layer 3: Acceptance Auditor

**Objective:** Verify that the code fulfills its requirements. Cross-reference changed code against acceptance criteria, user stories, and specifications.

**What to look for:**
- Each acceptance criterion maps to implemented and tested code
- Feature completeness — no partial implementations
- User flow integrity — all paths from entry to completion work
- Error states and feedback — user-facing errors are handled gracefully
- Accessibility compliance — ARIA labels, keyboard navigation, focus management
- Responsive design — all breakpoints render correctly
- State management — UI state reflects data state accurately
- API contract adherence — request/response schemas match specifications

### Layer 4: Compliance Scanner

**Objective:** Verify adherence to Chico Protocol Anti-Incompletion Rules R0-R9.

**Checks performed:**
- **R0** — Brief fidelity: Does the code implement the feature as specified? No substitution, no simplification.
- **R1** — Scan for TODO, FIXME, placeholder, mock data, lorem ipsum, "coming soon", or stub implementations.
- **R2** — Scan for empty event handlers: `onClick={() => {}}`, `onSubmit={() => {}}`, `onChange={() => {}}`, or handlers that only `console.log`.
- **R3** — Verify all imports resolve to existing files. Check for phantom module references.
- **R4** — Scan for dead links: `href="#"`, `href=""`, links to routes that do not exist in the router.
- **R5** — Verify MANIFEST exists and lists all created/modified files with line counts.
- **R6** — Check test coverage is >= 85% per layer (unit, integration, E2E).
- **R7** — Verify Lighthouse targets (90+ all categories) and WCAG 2.1 AA compliance indicators.
- **R8** — Every `process.env.VAR` referenced in code must appear in `.env.example` with a description.
- **R9** — If issues are found, flag that correction iterations are required.

## Execution Flow

1. **Load project context** — Search for `**/project-context.md`. If found, load as reference for project standards and conventions.

2. **Identify changed files** — Use `git diff` (staged and unstaged) and `git status` to determine which files have been modified, added, or deleted. If no git changes are detected, ask the user which files to review.

3. **Read all changed files** — Load the full content of every changed file into context.

4. **Load specifications** — Search for relevant PRD, user stories, acceptance criteria, and architecture documents in `{planning_artifacts}` to provide context for the Acceptance Auditor layer.

5. **Execute all 4 review layers** — Run Blind Hunter, Edge Case Hunter, Acceptance Auditor, and Compliance Scanner independently against the changed code.

6. **Produce structured report** — Compile findings from all layers into a single report.

## Report Format

The review produces a structured findings table:

```
## Code Review Report

### Summary
- Files reviewed: [count]
- Total findings: [count]
- Critical: [count] | High: [count] | Medium: [count] | Low: [count]

### Findings

| # | Category | Severity | File | Line | Description | Recommended Fix |
|---|----------|----------|------|------|-------------|-----------------|
| 1 | bug | critical | src/api/auth.ts | 42 | Null dereference when session expires | Add null check before accessing session.user |
| 2 | edge-case | high | src/utils/parse.ts | 15 | Empty string input causes division by zero | Guard against empty/zero-length input |
| 3 | acceptance | medium | src/pages/dashboard.tsx | 88 | Missing loading state per AC-3.2 | Add skeleton loader during data fetch |
| 4 | compliance | high | src/components/Form.tsx | 23 | R2 violation: empty onSubmit handler | Implement form submission logic |
```

### Category Values
- `bug` — Layer 1 (Blind Hunter) finding
- `edge-case` — Layer 2 (Edge Case Hunter) finding
- `acceptance` — Layer 3 (Acceptance Auditor) finding
- `compliance` — Layer 4 (Compliance Scanner) finding

### Severity Values
- `critical` — Crash, data loss, security vulnerability, or production blocker
- `high` — Functional defect, missing feature, or anti-incompletion rule violation
- `medium` — Degraded UX, missing edge case handling, or incomplete implementation
- `low` — Code quality, style, or minor improvement opportunity

### Verdict

After the findings table, provide a clear verdict:

- **PASS** — Zero critical, zero high findings. Code is ready to ship.
- **PASS WITH NOTES** — Zero critical findings, but medium/low findings exist. Code can ship but improvements are recommended.
- **FAIL** — Critical or high findings exist. Code must not ship until issues are resolved. Invoke Rule R9: unlimited correction iterations until clean.

## Anti-Incompletion Awareness

This skill directly enforces Rules R0-R9 through the Compliance Scanner layer. When compliance violations are found, the report explicitly references the rule number and requirement, making it clear what must be fixed and why.
