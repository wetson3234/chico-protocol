# Changelog

All notable changes to Chico Protocol will be documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] — 2026-05-20

### Fixed
- Installer no longer accepts placeholder values as a real name (e.g. "e.g. Alex"); validation now rejects "e.g. ...", "ex. ...", "your name", bracketed values, and the example "Alice".
- The orchestrator skill reported "128 skills" — corrected to 130 to match the manifest and the installer banner.
- Generic examples in `docs/` (memory-system, architecture, getting-started) now use a neutral example name instead of a real one.

## [1.0.0] — 2026-05-19

First public release of Chico Protocol.

### Added
- One-line installer: `npx chico-protocol install`
- 42 named agents across 8 modules (core, cmm, cis, tea, gds, cmb, web, verify)
- 130 skills (orchestration, agents, workflows, verification passes, builders)
- Single entry point: the `/chico` orchestrator skill
- Agency Playbook (Discover → Define → Design → Develop → Deliver → Run)
- Anti-Incompletion Rules (R0–R9)
- 5 verification passes (concept, production, functional, browser, completude)
- Two-tier memory system: semantic RAG (optional MCP `chico-rag`) + Agent Sanctum
- Pre-Bash safety hook (dangerous command interception, lockfile awareness)
- Browser runtime verification via Playwright on real Chromium

### Notes
- The `chico-rag` MCP server (Python, requires Qdrant) is included as an
  optional component. The installer prints the steps to enable it; Chico works
  fully without it.
