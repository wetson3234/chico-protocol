# Changelog

All notable changes to Chico Protocol will be documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] — 2026-07-29

### Fixed
- **Auto-resume missed "weekly limit" messages** (real overnight incident: a weekly limit killed
  every in-flight agent and nothing resumed for ~24 h). Detection now covers every limit kind —
  session, weekly, daily, monthly, 5-hour, rate, "usage limit reached", "out of usage credits" —
  in English and French, with every observed time format (`8pm`, `6:50pm`, `18:50`, `20h05`,
  optional `at`, optional weekday, optional IANA timezone). The reset time stays fully dynamic.
- **Scheduling did not survive a PC sleep or reboot.** Pending resumes are now persisted to a
  state file and fired by a wall-clock check instead of a long `setTimeout`; a startup catch-up
  scan detects a session that died on a limit while no watcher was running (e.g. relaunched by a
  scheduled task after a reboot) and schedules the resume immediately.

### Added
- **Model fallback** (`--fallback-chain`, default `fable,opus,sonnet`; disable with
  `--no-fallback` or `AUTO_RESUME_FALLBACK=0`): when a high-tier model hits its limit, resume
  immediately on the next lower tier instead of waiting, while keeping the reset-time resume as a
  safety net that restores the original model.
- Single-instance lock (safe to rerun from a scheduled task or cron every few minutes).
- `--scan-only` (print the catch-up verdict and exit) and `--dry-run` (log decisions without
  spawning `claude`) for safe verification.

## [1.1.0] — 2026-07-25

### Added
- **Auto-resume after a usage limit** (`.claude/scripts/auto-resume.mjs`): watches the
  session transcript, detects a real usage-limit event, parses the reset time (12h/24h +
  IANA timezone, DST-safe), waits until reset + a safety delay, then relaunches the session
  with `claude --resume` so work (and in-flight agents) picks back up on its own. Pure Node,
  zero dependencies, cross-platform.
  - **Reliable detection**: triggers only on the genuine limit record
    (`type:"assistant"` with `isApiErrorMessage:true`), never on messages that merely *quote*
    the phrase (user messages, task-notifications, assistant explanations) — validated on real
    transcripts (27 real events matched, 69 quotes ignored).
  - Robust `claude` binary resolution (`where`/`which`, `--claude-bin`, `CLAUDE_BIN`) — a wrong
    binary name previously caused silent failures.
  - Never-silent failures (logged + retry), reschedules to the earliest reset, follows the new
    transcript created by each resume.

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
