# Changelog

All notable changes to Chico Protocol will be documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
