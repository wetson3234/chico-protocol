# Security Policy

## Supported Versions

The latest minor release line receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Chico Protocol:

1. **Do not** open a public issue
2. Email the maintainer (address in the repository profile) with subject `[chico-protocol] Security`
3. Include: description, reproduction steps, affected versions, your assessment of severity

You can expect an acknowledgment within 72 hours and a remediation plan within 14 days.

## Scope

In scope:
- The installer CLI (`tools/installer/`)
- The Chico orchestrator and any included agent skill
- The optional `chico-rag` MCP server template

Out of scope (please direct reports upstream):
- Vulnerabilities in Claude Code itself
- Vulnerabilities in third-party MCP servers users may install separately
- Issues in dependencies (report to those projects directly)

## Sensitive data

Chico Protocol itself does not store, transmit, or process user credentials.
The optional `chico-rag` MCP server may connect to a user-configured Qdrant
instance over SSH — its `.env` is `.gitignore`d and should never be committed.
