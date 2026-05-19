---
name: chico-verify-concept
description: "Pass 0: Brief Fidelity Verification - Verify that implemented code respects EXACTLY the original brief. No feature substituted, simplified, or replaced with placeholders."
user-invocable: true
trigger-patterns:
  - "verify concept"
  - "check concept fidelity"
  - "brief verification"
  - "pass 0"
  - "chico verify concept"
---

# Verify Concept — Pass 0: Brief Fidelity Verification

This is a **verification skill**, not a persona agent. No Sanctum, no personality. Pure systematic verification.

## Purpose

Verify that the implemented code respects EXACTLY the original brief. No feature has been substituted, simplified, or replaced with "coming soon." Every requirement in the brief must exist as working code.

## Configuration

- **Config path:** `{project-root}/_chico/verify/config.yaml`
- **Reports output:** `{project-root}/_chico-output/reports/verify-concept-report.md`
- **Variables:** `{user_name}`, `{communication_language}`, `{document_output_language}`

## Execution Steps

### Step 1 — Read the Original Brief/PRD

1. Locate the brief or PRD document. Check these paths in order:
   - `{project-root}/_chico-output/planning-artifacts/phase-01/business-brief.md`
   - `{project-root}/_chico-output/planning-artifacts/phase-02/product-strategy.md`
   - `{project-root}/docs/prd.md`
   - `{project-root}/docs/brief.md`
   - Ask the user for the brief location if none found.
2. Read the document completely. Every word matters.

### Step 2 — Extract Every Feature, Requirement, and Constraint

Build a structured checklist from the brief:
- **Features:** Every feature mentioned, including sub-features.
- **Requirements:** Every functional and non-functional requirement.
- **Constraints:** Every technical, business, or design constraint.
- **Unique selling points:** Every innovation or differentiator.
- **User flows:** Every described user journey.

Format as a numbered list. This becomes the verification matrix.

### Step 3 — Verify Each Feature EXISTS in the Code

For each extracted feature:
1. Search the codebase for files implementing this feature.
2. Verify the feature EXISTS — not just referenced, but actually implemented.
3. Verify the feature MATCHES the concept — same behavior, same scope, same intent.
4. Verify the implementation is COMPLETE — not a stub, not a partial, not a "v1 simplified."

Record for each feature:
- Feature name (from the brief)
- Status: `PASS` or `FAIL`
- Evidence: `file:line` reference proving existence
- Notes: any discrepancy, simplification, or deviation

### Step 4 — Verify Innovations and Unique Selling Points

For each innovation or USP identified in the brief:
1. Verify it is implemented with full coherence — the innovation works as described.
2. Verify no contradiction with stated constraints (e.g., "offline-first" but requires constant API calls).
3. Verify the innovation is not watered down to a generic version.

### Step 5 — Scan for Forbidden Patterns

Search ALL source files (src/, app/, components/, lib/, pages/) for these forbidden patterns:

**English placeholders:**
- `coming soon`
- `placeholder`
- `demo`
- `sample`
- `example content`
- `lorem ipsum`
- `Lorem Ipsum`
- `TODO`
- `FIXME`
- `not yet implemented`
- `will be added`

**French placeholders:**
- `a venir`
- `bientot disponible`
- `en cours de developpement`
- `prochainement`

**Generic stock content:**
- Stock hero text like "Welcome to our platform"
- Generic descriptions that could apply to any product
- Default template content not customized for the specific product

**Exclusions:** `node_modules/`, `.next/`, `dist/`, test files, config comments.

### Step 6 — Produce Report

Generate a Markdown report at `{project-root}/_chico-output/reports/verify-concept-report.md` with:

```markdown
# Verify Concept Report — Pass 0

**Project:** [project name]
**Date:** [timestamp]
**Brief source:** [path to brief]
**Verified by:** Chico Verify Concept

## Summary

- Total features extracted: [N]
- Features PASS: [N]
- Features FAIL: [N]
- Forbidden patterns found: [N]
- Overall status: PASS / FAIL

## Feature Verification Matrix

| # | Feature | Status | Evidence (file:line) | Notes |
|---|---------|--------|---------------------|-------|
| 1 | [feature name] | PASS/FAIL | `src/app/page.tsx:42` | [notes] |
| 2 | ... | ... | ... | ... |

## Innovation/USP Verification

| # | Innovation | Status | Evidence | Coherence Check |
|---|-----------|--------|----------|----------------|
| 1 | [USP name] | PASS/FAIL | `file:line` | [notes] |

## Forbidden Patterns Found

| # | Pattern | File | Line | Context |
|---|---------|------|------|---------|
| 1 | [pattern] | [file] | [line] | [surrounding text] |

## Correction Actions Required

| # | Issue | Responsible Agent | Required Change | Priority |
|---|-------|------------------|----------------|----------|
| 1 | [description] | [agent name] | [what needs to change] | CRITICAL/HIGH |
```

## Correction Loop

If ANY feature has status `FAIL`:
1. Identify the responsible agent (which agent created or should have created this feature).
2. Specify exactly what needs to change — file path, expected behavior, current behavior.
3. The responsible agent makes corrections.
4. Re-run this verification pass from Step 3.

**No iteration limit (Rule R9).** Continue looping until every feature is `PASS` and zero forbidden patterns remain.

## Exit Criteria

- ALL features from the brief have status `PASS`
- ALL innovations/USPs are coherent and complete
- ZERO forbidden patterns found in source code
- Report is saved to `{project-root}/_chico-output/reports/verify-concept-report.md`
