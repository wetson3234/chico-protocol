## Summary

Brief description of what this PR changes.

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New agent or skill
- [ ] New module
- [ ] Enhancement to existing agent/skill/installer
- [ ] Documentation
- [ ] Breaking change (existing users will need to adapt)

## Impacted areas

- [ ] CLI installer (`tools/installer/`)
- [ ] Template content (`src/template/`)
- [ ] An agent skill (`src/template/.claude/skills/chico-...`)
- [ ] A module config (`src/template/_chico/<module>/`)
- [ ] The `chico-rag` MCP server
- [ ] Documentation (`docs/` or root `*.md`)

## Test plan

How did you verify this? Walk through the install or the agent flow.

## Checklist

- [ ] I've run `npx chico-protocol install` locally against a clean directory
- [ ] No secrets, tokens, or personal paths committed
- [ ] Manifests (`agent-manifest.csv`, `skill-manifest.csv`) updated if an agent or skill was added
- [ ] `CHANGELOG.md` updated if user-visible
