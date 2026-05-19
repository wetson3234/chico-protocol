# Deployment Checklist — [Project Name]

> Deployment date: YYYY-MM-DD HH:MM
> Version: [vX.Y.Z]
> Owner: [Name]
> Target environment: [ ] Staging / [ ] Production

---

## 1. Pre-deployment Checks

### Code

- [ ] All PRs are merged into the release branch
- [ ] No merge conflicts pending
- [ ] Code is up to date with the main branch
- [ ] Version tag created: `vX.Y.Z`

### Tests

- [ ] Unit tests pass (100%)
- [ ] Integration tests pass (100%)
- [ ] E2E tests pass (100%)
- [ ] No regressions detected
- [ ] Performance tests OK (no degradation > 10%)
- [ ] Code coverage >= [X]%

### Build

- [ ] `npm run build` / `pnpm build` succeeds without errors
- [ ] `npm run type-check` succeeds without errors
- [ ] `npm run lint` succeeds without errors
- [ ] Bundle size verified (no unexpected increase)
- [ ] Docker build succeeds (if applicable)

### Environment Variables

- [ ] All new variables are documented
- [ ] Variables are configured in the target environment
- [ ] No hardcoded secrets in code
- [ ] Check: `[List of new variables]`

| Variable | Staging | Production | Status |
|----------|---------|------------|--------|
| [VAR_NAME] | [ ] Configured | [ ] Configured | |
| [VAR_NAME] | [ ] Configured | [ ] Configured | |

### Secrets

- [ ] New secrets are in the secrets manager
- [ ] Expired or rotating secrets have been updated
- [ ] Access permissions are correct

### Database Migrations

- [ ] Migrations are ready: `[list of migration files]`
- [ ] Migrations have been tested in staging
- [ ] Migrations are reversible (rollback tested)
- [ ] Migrations are compatible with the current code version (zero-downtime)
- [ ] Database backup performed before migration
- [ ] Estimated migration time: [X minutes]

### External Dependencies

- [ ] Third-party services are operational (check status pages)
- [ ] API keys / webhooks are configured
- [ ] Rate limiting thresholds are appropriate

---

## 2. Deployment Steps

### Execution Order

> Check each step as you go.

| # | Step | Command / Action | Time | Status |
|---|-------|-------------------|-------|--------|
| 1 | Notify the team | Message in [Slack/Discord channel] | | [ ] |
| 2 | Enable maintenance mode (if needed) | `[command]` | | [ ] |
| 3 | Database backup | `[command or process]` | | [ ] |
| 4 | Run migrations | `npx prisma migrate deploy` | | [ ] |
| 5 | Deploy the application | `[command or process]` | | [ ] |
| 6 | Verify health check | `curl https://app.example.com/api/health` | | [ ] |
| 7 | Disable maintenance mode | `[command]` | | [ ] |
| 8 | Post-deployment verification | See section 3 | | [ ] |
| 9 | Notify the team of success | Message in [channel] | | [ ] |

### Notes Specific to This Deployment

> Particular steps for this release.

1. [Specific step 1]
2. [Specific step 2]

---

## 3. Post-deployment Checks

### Functional

- [ ] Home page loads correctly
- [ ] Login / registration work
- [ ] [Critical feature 1] works
- [ ] [Critical feature 2] works
- [ ] [Critical feature 3] works
- [ ] Transactional emails are sent correctly
- [ ] Payments work (if applicable)

### Technical

- [ ] No 5xx errors in logs
- [ ] API response times within limits (P95 < [X]ms)
- [ ] Sentry is not reporting new errors
- [ ] Vercel / AWS metrics are normal
- [ ] Background workers / jobs are running
- [ ] Websockets / SSE work (if applicable)
- [ ] CDN is serving assets correctly
- [ ] SSL certificates are valid

### Performance

- [ ] Lighthouse score > [X]
- [ ] Core Web Vitals within thresholds
- [ ] No memory leak detected
- [ ] CPU and memory within normal limits

### Data

- [ ] Migrations executed correctly
- [ ] Existing data is intact
- [ ] New fields have the expected default values
- [ ] No corrupted data

---

## 4. Rollback Plan

### Rollback Conditions

> Trigger a rollback if any of these conditions are met:

- [ ] 5xx error rate > [X]% for more than [Y] minutes
- [ ] Critical feature non-functional
- [ ] Data loss detected
- [ ] P95 response time > [X]ms for more than [Y] minutes
- [ ] Security issue identified

### Rollback Procedure

| # | Step | Command / Action | Owner |
|---|-------|-------------------|-------------|
| 1 | Rollback decision | Confirmation by [Name] | [Name] |
| 2 | Enable maintenance mode | `[command]` | [Name] |
| 3 | Roll back the application | `[command: e.g. vercel rollback, git revert]` | [Name] |
| 4 | Roll back migrations (if applied) | `npx prisma migrate resolve --rolled-back [migration]` | [Name] |
| 5 | Restore DB backup (if needed) | `[command]` | [Name] |
| 6 | Verify health check | `curl https://app.example.com/api/health` | [Name] |
| 7 | Disable maintenance mode | `[command]` | [Name] |
| 8 | Notify the team | Message in [channel] | [Name] |
| 9 | Post-mortem | Schedule within 24h | [Name] |

### Backup Information

| Item | Location | Backup Date | Tested? |
|---------|-------------|---------------|---------|
| Database | [URL / path] | [Date] | [ ] Yes |
| Uploaded files | [URL / path] | [Date] | [ ] Yes |
| Configuration | [URL / path] | [Date] | [ ] Yes |

---

## 5. Sign-off

### Before Deployment

| Role | Name | Approved | Date |
|------|-----|----------|------|
| Tech Lead | [Name] | [ ] | |
| QA | [Name] | [ ] | |
| Product Owner | [Name] | [ ] | |

### After Deployment

| Check | Validated by | Date/Time |
|-------------|-----------|-----------|
| Functional OK | [Name] | |
| Technical OK | [Name] | |
| Performance OK | [Name] | |
| Monitoring OK | [Name] | |

---

## Deployment Log

> Record important events during deployment.

| Time | Event | Action Taken |
|-------|----------|-------------|
| | Deployment started | |
| | | |
| | Deployment completed | |

---

## Lessons Learned

> To be filled out after deployment.

### What Went Well

- [Positive point 1]

### What Could Be Improved

- [Improvement point 1]

### Actions for the Next Deployment

- [ ] [Action 1]
- [ ] [Action 2]
