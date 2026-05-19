# Database — Expertise guide

## Philosophy

The database is the foundation of any application.
Principle: **optimize reads, protect writes, plan for growth**.

---

## PostgreSQL — Tuning

### Essential configuration

```sql
-- postgresql.conf — starting values (tune based on RAM)
shared_buffers = '256MB'          -- 25% of RAM
effective_cache_size = '768MB'    -- 75% of RAM
work_mem = '4MB'                  -- Per sort operation
maintenance_work_mem = '128MB'    -- VACUUM, CREATE INDEX
random_page_cost = 1.1            -- If SSD
effective_io_concurrency = 200    -- If SSD
```

### Recommended data types

| Need | Type | Why |
|------|------|-----|
| Identifier | `uuid` or `bigint` | UUID for distributed, bigint for perf |
| Short text | `varchar(n)` | Size control |
| Long text | `text` | No artificial limit |
| Money | `numeric(12,2)` | Exact precision, never `float` |
| Date/time | `timestamptz` | Always with timezone |
| JSON | `jsonb` | Indexable, not `json` |
| Boolean | `boolean` | No 0/1 integer |
| Enum | `text` + CHECK | More flexible than ENUM types |

---

## Indexing — Strategies

### B-tree (default)

```sql
-- Simple index
CREATE INDEX idx_users_email ON users (email);

-- Composite index — column order matters
CREATE INDEX idx_orders_user_date ON orders (user_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);
```

### Partial index

```sql
-- Index only the relevant rows
CREATE INDEX idx_orders_pending
  ON orders (created_at)
  WHERE status = 'pending';

-- Very efficient for frequent queries on a subset
CREATE INDEX idx_users_active
  ON users (email)
  WHERE deleted_at IS NULL;
```

### GIN (Generalized Inverted Index)

```sql
-- For jsonb
CREATE INDEX idx_products_metadata ON products USING GIN (metadata);

-- For full-text search
CREATE INDEX idx_articles_search ON articles USING GIN (
  to_tsvector('english', title || ' ' || content)
);

-- For arrays
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
```

### When to index

| Situation | Index? |
|-----------|--------|
| Column in frequent WHERE | Yes |
| Column in JOIN | Yes |
| Column in ORDER BY | Often |
| Table < 1000 rows | Rarely |
| Column with few distinct values | No (unless partial) |
| Table with heavy INSERT load | Moderate the indexes |

---

## Query Optimization — EXPLAIN ANALYZE

### Reading an execution plan

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id)
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2026-01-01'
GROUP BY u.name
ORDER BY COUNT(o.id) DESC
LIMIT 10;
```

### Warning signs

| Signal | Problem | Solution |
|--------|---------|----------|
| Seq Scan on large table | Missing index | Add an index |
| Nested Loop + Seq Scan | SQL N+1 | Use JOIN or subquery |
| Sort + Disk | `work_mem` too low | Increase or add index on ORDER BY |
| Very large Hash Join | Expensive join | Check join indexes |
| Estimated rows diverge from actual | Stale statistics | `ANALYZE table_name;` |

### Optimization patterns

```sql
-- BAD: correlated subquery (N+1)
SELECT u.name,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;

-- GOOD: JOIN + GROUP BY
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- BAD: LIKE '%term%' (not indexable)
SELECT * FROM products WHERE name LIKE '%keyboard%';

-- GOOD: Full-text search
SELECT * FROM products
WHERE to_tsvector('english', name) @@ plainto_tsquery('english', 'keyboard');
```

---

## Prisma ORM — Patterns

### Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  orders    Order[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
  @@index([email])
  @@index([createdAt])
}

enum Role {
  USER
  ADMIN
}
```

### Optimized queries

```typescript
// Select only the necessary fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    _count: { select: { orders: true } },
  },
  where: { role: "ADMIN" },
  orderBy: { createdAt: "desc" },
  take: 25,
  skip: 0,
});

// Transaction for atomic operations
const [user, order] = await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { balance: { decrement: amount } } }),
  prisma.order.create({ data: { userId: id, total: amount } }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id } });
  if (!user || user.balance < amount) {
    throw new Error("Insufficient balance");
  }
  await tx.user.update({ where: { id }, data: { balance: { decrement: amount } } });
  await tx.order.create({ data: { userId: id, total: amount } });
});
```

---

## Drizzle ORM — Patterns

### Schema

```typescript
import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

### Queries

```typescript
import { eq, desc, sql } from "drizzle-orm";

// Select with join
const result = await db
  .select({
    userName: users.name,
    orderCount: sql<number>`count(${orders.id})`,
  })
  .from(users)
  .leftJoin(orders, eq(users.id, orders.userId))
  .groupBy(users.id)
  .orderBy(desc(sql`count(${orders.id})`))
  .limit(10);
```

---

## Migrations — Zero-downtime

### Principles

1. **Never drop a column directly** — first stop using it
2. **Never rename directly** — add the new column, migrate, drop the old one
3. **No exclusive locks on large tables** — use `CREATE INDEX CONCURRENTLY`

### Safe process to drop a column

```
Phase 1 (deployment): Stop reading/writing the column in code
Phase 2 (migration) : ALTER TABLE ... DROP COLUMN ...
```

### Safe process to rename a column

```
Phase 1: ALTER TABLE ADD COLUMN new_name ...
Phase 2: Write to both columns (code)
Phase 3: Backfill: UPDATE ... SET new_name = old_name WHERE new_name IS NULL
Phase 4: Read from new_name only
Phase 5: Stop writing to old_name
Phase 6: DROP COLUMN old_name
```

### Indexing without downtime

```sql
-- ALWAYS use CONCURRENTLY in production
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);

-- CONCURRENTLY cannot run inside a transaction, so:
-- Execute outside of a transaction in the migration
```

---

## Connection Pooling

### PgBouncer (recommended in production)

```ini
# pgbouncer.ini
[databases]
myapp = host=127.0.0.1 port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction    # Recommended for most apps
default_pool_size = 20
max_client_conn = 200
min_pool_size = 5
```

### Prisma with pool

```
# .env
DATABASE_URL="postgresql://user:pass@localhost:6432/myapp?pgbouncer=true&connection_limit=10"
```

---

## Redis — Cache patterns

### Caching strategies

| Pattern | Description | Use case |
|---------|-------------|----------|
| Cache-aside | App reads cache, then DB on miss | Most common |
| Write-through | Simultaneous cache + DB write | Strong consistency |
| Write-behind | Cache write, DB asynchronously | Max performance |

### Cache-aside in TypeScript

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const CACHE_TTL = 300; // 5 minutes

async function getUser(id: string): Promise<User> {
  const cacheKey = `user:${id}`;

  // 1. Look up in cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss → DB query
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User not found");

  // 3. Populate cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user));

  return user;
}

// Invalidate after mutation
async function updateUser(id: string, data: UpdateUserInput) {
  const user = await db.user.update({ where: { id }, data });
  await redis.del(`user:${id}`);
  return user;
}
```

### Advanced Redis patterns

```typescript
// Rate limiting with sliding window
async function checkRateLimit(userId: string, limit: number, windowSec: number) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, windowStart);
  pipe.zadd(key, now.toString(), `${now}-${Math.random()}`);
  pipe.zcard(key);
  pipe.expire(key, windowSec);

  const results = await pipe.exec();
  const count = results?.[2]?.[1] as number;
  return count <= limit;
}

// Session store
async function setSession(sessionId: string, data: SessionData) {
  await redis.setex(`session:${sessionId}`, 86400, JSON.stringify(data));
}
```

---

## Database Checklist

- [ ] Appropriate data types (no unbounded `varchar`, no `float` for money)
- [ ] Indexes on frequent WHERE, JOIN, ORDER BY columns
- [ ] `EXPLAIN ANALYZE` on critical queries
- [ ] Connection pooling configured
- [ ] Reversible and zero-downtime migrations
- [ ] Automated and tested backups
- [ ] Slow-query monitoring
- [ ] Redis cache for frequent reads
- [ ] Transactions for atomic writes
- [ ] Integrity constraints (FK, UNIQUE, CHECK)
