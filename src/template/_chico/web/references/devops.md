# DevOps — Expertise guide

## Philosophy

Automate everything you can; make every deployment reproducible.
Principle: **if it isn't in the code, it doesn't exist — infrastructure as code, pipelines as code**.

---

## Docker — Multi-stage Builds

### Optimized Next.js Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker best practices

| Rule | Why |
|------|-----|
| Multi-stage builds | Minimal final image |
| Complete `.dockerignore` | No `node_modules`, `.git`, `.env` in the image |
| Non-root user | Security |
| Alpine as base | Lighter image |
| `--frozen-lockfile` | Reproducible builds |
| Layer caching | Copy `package.json` before source code |
| Health checks | Automatic failure detection |

### .dockerignore

```
node_modules
.next
.git
.env*
*.md
docker-compose*.yml
.github
coverage
.turbo
```

---

## Docker Compose — Patterns

### Complete development environment

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps  # Dependencies only for dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm dev

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    volumes:
      - redis_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
```

---

## GitHub Actions — CI/CD

### Complete CI workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:ci
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: build
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Reusable Workflow

```yaml
# .github/workflows/reusable-deploy.yml
name: Deploy (reusable)

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      vercel-args:
        required: false
        type: string
        default: ""
    secrets:
      VERCEL_TOKEN:
        required: true
      VERCEL_ORG_ID:
        required: true
      VERCEL_PROJECT_ID:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ inputs.vercel-args }}
```

### Matrix Builds

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

---

## Deployment strategies

### Blue/Green

```
1. Deploy the new version (Green) alongside the old one (Blue)
2. Test Green in isolation
3. Switch traffic from Blue to Green
4. Keep Blue on standby for instant rollback
5. Remove Blue after validation
```

**Pro**: Instant rollback
**Con**: Temporary double infrastructure

### Canary

```
1. Deploy to 5% of traffic
2. Monitor metrics (errors, latency, CPU)
3. If OK: ramp up to 25%, 50%, 100%
4. If KO: immediate rollback to 100% old version
```

**Pro**: Minimal risk
**Con**: Slower, requires solid monitoring

### Rolling Update

```
1. Update instances one by one
2. Each instance is checked (health check) before continuing
3. If one instance fails, stop the deployment
```

**Pro**: No double infrastructure
**Con**: Mixed versions during deployment

---

## Monitoring

### Sentry — Error Tracking

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,       // 10% of transactions
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors
});
```

### Key metrics to watch

| Category | Metric | Alert threshold |
|----------|--------|-----------------|
| Availability | Uptime | < 99.9% |
| Performance | P95 latency | > 500ms |
| Performance | P99 latency | > 1000ms |
| Errors | 5xx error rate | > 1% |
| Resources | CPU | > 80% |
| Resources | Memory | > 85% |
| DB | Slow queries | > 100ms |
| DB | Active connections | > 80% of pool |

### Structured Logging

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: ["password", "token", "authorization", "cookie"],
    censor: "[REDACTED]",
  },
});

// Usage
logger.info({ userId: user.id, action: "login" }, "Login successful");
logger.error({ err, requestId }, "Processing error");
```

---

## Terraform — Basics

```hcl
# main.tf
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "eu-west-3"
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  default = "eu-west-3"
}

variable "environment" {
  type = string
}

# Resources
resource "aws_ecs_service" "app" {
  name            = "app-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.environment == "production" ? 3 : 1

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}
```

---

## DevOps Checklist

- [ ] Multi-stage Dockerfile with non-root user
- [ ] docker-compose for local development
- [ ] CI: lint, type-check, tests, build
- [ ] CD: automated deployment (preview + production)
- [ ] Health checks configured
- [ ] Monitoring: errors (Sentry) + metrics + structured logs
- [ ] Secrets in environment variables (not in code)
- [ ] Documented and tested rollback
- [ ] Infrastructure as Code (Terraform / Pulumi)
- [ ] Alerts configured on key metrics
