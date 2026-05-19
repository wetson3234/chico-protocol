# React 19+ & Next.js 15+ — Expertise guide

## Philosophy

React 19 and Next.js 15 with the App Router favor server rendering by default.
Guiding principle: **everything is a Server Component unless interactivity is explicitly required**.

---

## Server Components vs Client Components

### Server Components (default)

- No `"use client"` → it's a Server Component
- Direct access to the database, the filesystem, and server-side environment variables
- Zero JavaScript shipped to the client
- Can be `async` and use `await` directly

```tsx
// app/users/page.tsx — Server Component
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();
  return <UserList users={users} />;
}
```

### Client Components

- Marked with `"use client"` on the first line
- Required for: `useState`, `useEffect`, `onClick`, `onChange`, etc.
- Keep Client Components as small and "leaf-like" as possible

```tsx
"use client";
// components/counter.tsx — minimal Client Component
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Composition rule

```
Server Component (layout, page)
  └─ Server Component (data fetching)
       └─ Client Component (interactivity, as small as possible)
```

---

## Data Fetching — Recommended patterns

### 1. Server Actions (mutations)

```tsx
// app/actions/user.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  await db.user.create({ data: parsed.data });
  revalidatePath("/users");
}
```

### 2. React `use()` for promises

```tsx
import { use } from "react";

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

### 3. Fetch with Next.js built-in cache

```tsx
// Automatically deduplicated by Next.js
async function getUser(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  });
  return res.json();
}
```

---

## State Management

### Zustand (recommended for simple global state)

```tsx
import { create } from "zustand";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));
```

### Jotai (recommended for atomic / derived state)

```tsx
import { atom, useAtom } from "jotai";

const countAtom = atom(0);
const doubledAtom = atom((get) => get(countAtom) * 2);
```

### When to use which

| Need | Solution |
|------|----------|
| Form state | `useActionState` (React 19) |
| Local UI state | `useState` / `useReducer` |
| Simple global state | Zustand |
| Atomic / derived state | Jotai |
| Server cache | TanStack Query (when client-side needed) |
| URL state | `useSearchParams` + `nuqs` |

---

## Component patterns

### Naming conventions

```
components/
  ui/                  # Generic components (Button, Input, Card)
    button.tsx
    input.tsx
  features/            # Domain components
    user-card.tsx
    order-summary.tsx
  layouts/             # Layout components
    sidebar.tsx
    header.tsx
```

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `use-camel-case.ts`
- Utilities: `camel-case.ts`

### Composition pattern

```tsx
// Prefer composition over configuration
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Props with TypeScript

```tsx
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

---

## App Router file structure

```
app/
  (auth)/              # Route group — not in the URL
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx          # Shared dashboard layout
    page.tsx            # /
    settings/
      page.tsx          # /settings
  api/
    users/
      route.ts          # GET, POST /api/users
      [id]/
        route.ts        # GET, PUT, DELETE /api/users/:id
  error.tsx             # Global error boundary
  loading.tsx           # Global loading UI
  not-found.tsx         # Global 404
  layout.tsx            # Root layout
  page.tsx              # Home page
```

---

## Error Boundaries & Suspense

### Error Boundary (error.tsx)

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>An error occurred</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

### Suspense with loading.tsx

```tsx
// app/users/loading.tsx — shown automatically while loading
export default function Loading() {
  return <UserListSkeleton />;
}
```

### Granular Suspense

```tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}
```

---

## Cache strategies

| Strategy | When | How |
|----------|------|-----|
| Static | Content rarely changes | `export const dynamic = "force-static"` |
| ISR | Content updated periodically | `fetch(..., { next: { revalidate: 60 } })` |
| On-demand | After a mutation | `revalidatePath()` / `revalidateTag()` |
| Dynamic | Personalized per request | `export const dynamic = "force-dynamic"` |

### Cache tags

```tsx
// Fetch with a tag
const users = await fetch("/api/users", { next: { tags: ["users"] } });

// Revalidate by tag after a mutation
import { revalidateTag } from "next/cache";
revalidateTag("users");
```

---

## Best practices summary

1. **Server Components by default** — don't add `"use client"` without a reason
2. **Colocate data** — fetch as close as possible to the component that consumes it
3. **Parallel data fetching** — launch requests in parallel with `Promise.all`
4. **Streaming** — use Suspense for progressive rendering
5. **Metadata** — use `generateMetadata` for SEO
6. **Images** — always use `next/image` with `width`/`height`
7. **Fonts** — use `next/font` to avoid layout shift
8. **Validation** — validate on the server AND the client with Zod
9. **Types** — type every prop, no `any`
10. **Tests** — Testing Library + Vitest for components
