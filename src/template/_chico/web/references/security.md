# Security — Expertise guide

## Philosophy

Security is a shared responsibility at every layer.
Principle: **defense in depth — never trust a single layer of protection**.

---

## OWASP Top 10 — Specific mitigations

### A01 — Broken Access Control

**Risk**: a user accesses another user's resources.

```typescript
// BAD: no ownership check
app.get("/api/orders/:id", async (req, res) => {
  const order = await db.order.findUnique({ where: { id: req.params.id } });
  res.json(order); // Anyone can view any order
});

// GOOD: systematic check
app.get("/api/orders/:id", requireAuth, async (req, res) => {
  const order = await db.order.findUnique({
    where: { id: req.params.id, userId: req.user.id }, // Filter by owner
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});
```

**Mitigations**:
- Deny by default, allow explicitly
- Verify resource ownership on every request
- Use authorization middleware (`can("read", "Order")`)
- Systematic cross-user access tests

### A02 — Cryptographic Failures

**Mitigations**:
- TLS 1.3 everywhere (never HTTP in production)
- Hash passwords with argon2id or bcrypt (cost >= 12)
- Encrypt sensitive data at rest (AES-256-GCM)
- Never store secrets in code or logs

### A03 — Injection

```typescript
// SQL Injection — BAD
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD: parameterized queries (Prisma/Drizzle do this by default)
const user = await prisma.user.findUnique({ where: { email } });

// GOOD: parameterized raw query
const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
```

### A07 — Cross-Site Scripting (XSS)

```typescript
// React escapes automatically — WATCH OUT for dangerouslySetInnerHTML
// BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// GOOD: use DOMPurify if HTML is required
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## JWT — Best practices

### Creation and verification

```typescript
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

// Create an access token (short lifetime)
function createAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",       // 15 minutes maximum
      issuer: "my-app",
      audience: "web-app",
    }
  );
}

// Create a refresh token (long lifetime)
function createRefreshToken(user: User): string {
  return jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}
```

### JWT rules

| Rule | Detail |
|------|--------|
| Access token lifetime | 15 min max |
| Refresh token lifetime | 7 days max |
| Access token storage | JavaScript memory (not localStorage) |
| Refresh token storage | Cookie httpOnly, secure, sameSite=strict |
| Rotation | New refresh token on every use |
| Revocation | Store `tokenVersion` in DB, increment to revoke |
| Algorithm | RS256 (asymmetric) or HS256 (symmetric) |
| Payload | Minimal — no sensitive data |

### Refresh token rotation

```typescript
async function refreshAccessToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload;
  const user = await db.user.findUnique({ where: { id: payload.sub } });

  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new UnauthorizedError("Token revoked");
  }

  // Rotation: new refresh token
  const newAccessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

---

## OAuth 2.0 / OIDC

### Recommended flows

| Context | Flow |
|---------|------|
| SPA / web app | Authorization Code + PKCE |
| Server-to-server | Client Credentials |
| Mobile | Authorization Code + PKCE |
| Legacy (avoid) | Implicit (deprecated) |

### Authorization Code + PKCE

```typescript
import { generators } from "openid-client";

// 1. Generate the code verifier and challenge
const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);

// 2. Redirect to the provider
const authUrl = new URL("https://provider.com/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", "openid profile email");
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");
authUrl.searchParams.set("state", generateState());

// 3. Exchange the code (callback)
const tokenResponse = await fetch("https://provider.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  }),
});
```

---

## Password Hashing

### Argon2id (recommended)

```typescript
import argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,    // 64 MB
    timeCost: 3,          // 3 iterations
    parallelism: 4,
  });
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

### bcrypt (alternative)

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // Minimum 12

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
```

---

## CSRF Protection

### Double Submit Cookie pattern

```typescript
// CSRF middleware for Next.js API Routes
import { randomBytes } from "crypto";

function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

// Verify the CSRF token
function verifyCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get("csrf-token")?.value;
  const headerToken = req.headers.get("x-csrf-token");
  return !!cookieToken && cookieToken === headerToken;
}
```

### SameSite Cookie (primary protection)

```typescript
// cookies with maximum protection
res.cookie("session", sessionId, {
  httpOnly: true,       // No JavaScript access
  secure: true,         // HTTPS only
  sameSite: "strict",   // Not sent cross-origin
  maxAge: 86400000,     // 24h
  path: "/",
  domain: ".example.com",
});
```

---

## Content Security Policy (CSP)

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'nonce-{nonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`;

// middleware.ts
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export function middleware(request: NextRequest) {
  const nonce = randomBytes(16).toString("base64");
  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    cspHeader.replace(/{nonce}/g, nonce).replace(/\s+/g, " ").trim()
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
```

---

## CORS Configuration

```typescript
// Strict CORS configuration
const corsOptions = {
  origin: [
    "https://app.example.com",
    "https://admin.example.com",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  credentials: true,
  maxAge: 86400, // Preflight cache 24h
};
```

---

## Input Validation with Zod

```typescript
import { z } from "zod";

// Full validation schema
const CreateUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255)
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(12, "Minimum 12 characters")
    .max(128)
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[0-9]/, "At least one digit")
    .regex(/[^A-Za-z0-9]/, "At least one special character"),
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, "Disallowed characters"),
});

// Use inside a handler
export async function POST(req: Request) {
  const body = await req.json();
  const result = CreateUserSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", details: result.error.flatten() } },
      { status: 400 }
    );
  }

  // result.data is typed and validated
  const user = await createUser(result.data);
  return Response.json(user, { status: 201 });
}
```

---

## Secret Management

### Solution hierarchy

| Environment | Solution |
|-------------|----------|
| Local development | `.env.local` (in `.gitignore`) |
| CI/CD | Runner environment variables (GitHub Secrets) |
| Production | HashiCorp Vault, AWS Secrets Manager, Vercel Env |

### Rules

1. **Never put secrets in code** — not even temporarily
2. **Never log secrets** — mask automatically
3. **Rotate regularly** — every 90 days minimum
4. **Principle of least privilege** — every service has its own credentials
5. **Audit** — log all secret accesses

```typescript
// Check environment variables at startup
const requiredEnvVars = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}
```

---

## Rate Limiting

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
});

// Middleware
export async function rateLimitMiddleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }
}
```

---

## Security checklist

- [ ] HTTPS everywhere (HSTS enabled)
- [ ] Passwords hashed with argon2id/bcrypt
- [ ] JWT with short lifetime + refresh token rotation
- [ ] Input validation (Zod) on the server side
- [ ] CSP configured
- [ ] Restrictive CORS
- [ ] Cookies are httpOnly, secure, sameSite
- [ ] Rate limiting on sensitive endpoints
- [ ] No secrets in code/logs
- [ ] Security headers (X-Content-Type-Options, X-Frame-Options)
- [ ] Resource ownership checks (IDOR)
- [ ] CSRF protection
- [ ] Dependencies up to date (`npm audit`)
- [ ] Security logs (failed attempts, sensitive access)
