# API Design — Expertise guide

## Philosophy

Design APIs that are predictable, consistent, and well-documented.
Principle: **an API is a contract — stability matters more than novelty**.

---

## REST API — URL conventions

### Structure

```
/api/v1/{resource}              # Collection
/api/v1/{resource}/{id}         # Single item
/api/v1/{resource}/{id}/{sub}   # Sub-resource
```

### Rules

- Use **plural** nouns: `/users`, `/orders`, `/products`
- **kebab-case** for compound words: `/order-items`
- No verbs in the URL (use HTTP methods)
- No trailing slash
- No extensions (`.json`, `.xml`)

### Examples

| Action | Method | URL |
|--------|--------|-----|
| List users | GET | `/api/v1/users` |
| Create a user | POST | `/api/v1/users` |
| Get a user | GET | `/api/v1/users/123` |
| Update (full) | PUT | `/api/v1/users/123` |
| Update (partial) | PATCH | `/api/v1/users/123` |
| Delete | DELETE | `/api/v1/users/123` |
| A user's orders | GET | `/api/v1/users/123/orders` |

---

## HTTP methods & status codes

### Methods

| Method | Idempotent | Request body | Use |
|--------|------------|--------------|-----|
| GET | Yes | No | Read |
| POST | No | Yes | Create |
| PUT | Yes | Yes | Full replacement |
| PATCH | No | Yes | Partial update |
| DELETE | Yes | No | Delete |

### Common status codes

| Code | Meaning | Use |
|------|---------|-----|
| 200 | OK | General success |
| 201 | Created | Resource created (POST) |
| 204 | No Content | Success without body (DELETE) |
| 301 | Moved Permanently | Permanent redirect |
| 304 | Not Modified | Valid cache (ETag) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Conflict (duplicate, invalid state) |
| 422 | Unprocessable Entity | Semantic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance / overload |

---

## Error response format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The submitted data is invalid.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format.",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "age",
        "message": "Must be greater than 0.",
        "code": "MIN_VALUE"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2026-01-15T10:30:00Z"
  }
}
```

### Application-level error codes

Define an enum / constants for error codes:
```typescript
enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE = "DUPLICATE",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RATE_LIMITED = "RATE_LIMITED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}
```

---

## Pagination

### Cursor-based (recommended for infinite feeds)

```
GET /api/v1/posts?cursor=abc123&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

### Offset-based (suited to classic paginated interfaces)

```
GET /api/v1/users?page=2&limit=25
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

### When to use which

| Criterion | Cursor | Offset |
|-----------|--------|--------|
| Real-time data | Yes | No |
| Jump to a specific page | No | Yes |
| Performance on large volumes | Excellent | Degrades |
| Result consistency | Guaranteed | Risk of duplicates |

---

## Filtering and sorting

### Filtering

```
GET /api/v1/products?category=electronics&minPrice=100&maxPrice=500
GET /api/v1/users?status=active&role=admin
GET /api/v1/orders?createdAfter=2026-01-01&createdBefore=2026-12-31
```

### Sorting

```
GET /api/v1/products?sort=price         # Ascending (default)
GET /api/v1/products?sort=-price        # Descending (- prefix)
GET /api/v1/products?sort=-createdAt,name  # Multi-criteria
```

### Search

```
GET /api/v1/products?search=mechanical+keyboard
GET /api/v1/users?q=jordan
```

---

## Versioning

### Recommended: URL prefix

```
/api/v1/users
/api/v2/users
```

### Alternatives

| Method | Example | Pros / Cons |
|--------|---------|-------------|
| URL | `/api/v1/` | Simple, explicit |
| Header | `Accept: application/vnd.api+json;version=2` | More REST-pure, less visible |
| Query param | `?version=2` | Easy but fragile |

### Deprecation strategy

1. Announce deprecation via the `Deprecation: true` header
2. Add a `Sunset: Sat, 01 Jan 2027 00:00:00 GMT` header
3. Document the migration
4. Maintain the old version for 6-12 months

---

## Rate Limiting

### Standard headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1706000000
Retry-After: 30
```

### Strategies

| Algorithm | Description |
|-----------|-------------|
| Fixed Window | N requests per fixed window |
| Sliding Window | Sliding window, smoother |
| Token Bucket | Allows bursts, refills over time |
| Leaky Bucket | Constant throughput, queued |

---

## OpenAPI 3.1 — Reference pattern

```yaml
openapi: "3.1.0"
info:
  title: My API
  version: "1.0.0"
  description: Product ecosystem API

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: http://localhost:3000/api/v1
    description: Development

paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 25, maximum: 100 }
      responses:
        "200":
          description: User list
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/UserListResponse"

components:
  schemas:
    User:
      type: object
      required: [id, email, name]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        createdAt:
          type: string
          format: date-time
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## GraphQL — Essential patterns

### Schema design

```graphql
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
}

type User {
  id: ID!
  email: String!
  name: String!
  orders(first: Int, after: String): OrderConnection!
}

# Relay pattern for pagination
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# Separate input types
input CreateUserInput {
  email: String!
  name: String!
}

# Payload with typed errors
type CreateUserPayload {
  user: User
  errors: [UserError!]
}
```

### N+1 prevention

```typescript
// Use DataLoader for automatic batching
import DataLoader from "dataloader";

const userLoader = new DataLoader<string, User>(async (ids) => {
  const users = await db.user.findMany({
    where: { id: { in: [...ids] } },
  });
  // Return in the same order as the input IDs
  const userMap = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => userMap.get(id) ?? new Error(`User ${id} not found`));
});

// In the resolver
const resolvers = {
  Order: {
    user: (order) => userLoader.load(order.userId),
  },
};
```

### GraphQL best practices

1. **Relay pagination** for all lists
2. **Input types** for mutations
3. **Payload types** with errors for mutations
4. **DataLoader** systematically for N+1 resolutions
5. **Persisted queries** in production for security
6. **Depth limiting** and **complexity analysis** against abuse
7. **Fragments** to share selection sets on the client

---

## API checklist

- [ ] URLs are plural, kebab-case, with no verbs
- [ ] Appropriate HTTP codes
- [ ] Consistent error format with application-level codes
- [ ] Pagination on all lists
- [ ] Filtering and sorting documented
- [ ] Rate limiting with headers
- [ ] Versioning in place
- [ ] OpenAPI specification up to date
- [ ] Authentication documented
- [ ] CORS configured
- [ ] Input validation (Zod / Joi)
- [ ] API integration tests
