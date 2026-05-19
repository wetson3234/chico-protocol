# UI & Design System — Expertise guide

## Philosophy

A design system is a shared visual language between design and development.
Principle: **consistency > originality — every component must be predictable and composable**.

---

## Atomic Design — Methodology

### Levels

```
atoms/          → Indivisible elements (Button, Input, Badge, Icon)
molecules/      → Simple combinations (SearchBar = Input + Button)
organisms/      → Complex sections (Header = Logo + Nav + UserMenu)
templates/      → Layouts without data (DashboardLayout)
pages/          → Templates filled with real data
```

### File structure

```
components/
  ui/                     # Atoms & Molecules
    button/
      button.tsx
      button.stories.tsx
      button.test.tsx
      index.ts
    input/
    badge/
    card/
  features/               # Domain organisms
    user-card/
    order-table/
    dashboard-stats/
  layouts/                # Templates
    app-layout.tsx
    auth-layout.tsx
    dashboard-layout.tsx
```

---

## Design Tokens — CSS Custom Properties

### Definition

```css
/* tokens.css */
:root {
  /* === Primitive colors === */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-900: #1e3a5f;

  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-900: #111827;

  --color-red-500: #ef4444;
  --color-green-500: #22c55e;
  --color-amber-500: #f59e0b;

  /* === Semantic tokens === */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-light: var(--color-blue-50);

  --color-background: #ffffff;
  --color-surface: var(--color-gray-50);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-500);
  --color-text-inverse: #ffffff;

  --color-border: var(--color-gray-200);
  --color-border-focus: var(--color-blue-500);

  --color-error: var(--color-red-500);
  --color-success: var(--color-green-500);
  --color-warning: var(--color-amber-500);

  /* === Typography === */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;

  /* Modular scale (1.25 ratio — Major Third) */
  --text-xs: 0.64rem;     /* 10.24px */
  --text-sm: 0.8rem;      /* 12.8px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.563rem;    /* 25px */
  --text-2xl: 1.953rem;   /* 31.25px */
  --text-3xl: 2.441rem;   /* 39px */
  --text-4xl: 3.052rem;   /* 48.83px */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* === Spacing (4px grid) === */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* === Border radius === */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* === Transitions === */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);

  /* === Z-index === */
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

### Dark Mode

```css
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;

  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-400);
  --color-primary-light: rgba(59, 130, 246, 0.15);
}

/* Honor the system preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Same dark tokens */
  }
}
```

---

## Tailwind CSS — Configuration

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      spacing: {
        // 4px grid via Tailwind (default)
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
```

---

## Responsive Design — Mobile-First

### Breakpoints

```css
/* Mobile-first: base styles = mobile */
.container { padding: var(--space-4); }

/* sm: 640px — Small screen */
@media (min-width: 640px) {
  .container { padding: var(--space-6); }
}

/* md: 768px — Tablet */
@media (min-width: 768px) {
  .container { max-width: 768px; margin: 0 auto; }
}

/* lg: 1024px — Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

/* xl: 1280px — Large screen */
@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### Tailwind pattern

```tsx
<div className="
  grid grid-cols-1       /* Mobile: 1 column */
  sm:grid-cols-2         /* Small screen: 2 columns */
  lg:grid-cols-3         /* Desktop: 3 columns */
  xl:grid-cols-4         /* Large screen: 4 columns */
  gap-4 sm:gap-6
  p-4 sm:p-6 lg:p-8
">
```

---

## Animation

### Framer Motion — Patterns

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
  {children}
</motion.div>

// Animated list
<AnimatePresence>
  {items.map((item) => (
    <motion.li
      key={item.id}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {item.name}
    </motion.li>
  ))}
</AnimatePresence>
```

### CSS Transitions (prefer for simple interactions)

```css
.button {
  transition: all var(--duration-fast) var(--easing-default);
}
.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.button:active {
  transform: translateY(0);
}

/* Honor user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility (a11y)

### Focus Management

```tsx
// Focus visible only via keyboard
.focus-ring {
  outline: none;
}
.focus-ring:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

// Focus trap for modals
import { FocusTrap } from "focus-trap-react";

function Modal({ isOpen, onClose, children }) {
  return (
    <FocusTrap active={isOpen}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Title</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  );
}
```

### Essential ARIA patterns

```tsx
// Toggle button
<button
  aria-pressed={isActive}
  aria-label="Enable dark mode"
  onClick={toggle}
>
  {isActive ? "On" : "Off"}
</button>

// Live region for notifications
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {notification}
</div>

// Navigation
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/" aria-current={isHome ? "page" : undefined}>Home</a></li>
  </ul>
</nav>

// Form
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && <p id="email-error" role="alert">{error}</p>}
</div>
```

### Per-component a11y checklist

| Component | Requirements |
|-----------|--------------|
| Button | `aria-label` when icon-only, `aria-disabled` |
| Modal | `role="dialog"`, `aria-modal`, focus trap, Escape closes |
| Dropdown | `role="menu"`, up/down arrows, Escape closes |
| Toast | `aria-live="polite"`, auto-dismiss >= 5s |
| Form | Linked labels, `aria-invalid`, `aria-describedby` for errors |
| Tab | `role="tablist/tab/tabpanel"`, left/right arrows |
| Accordion | `aria-expanded`, `aria-controls` |

---

## Component API Design — Composition pattern

### Principle: favor composition over configuration

```tsx
// BAD: props-based API (rigid)
<Card
  title="My title"
  subtitle="Subtitle"
  image="/photo.jpg"
  footer={<Button>Action</Button>}
  variant="elevated"
/>

// GOOD: composition-based API (flexible)
<Card variant="elevated">
  <Card.Image src="/photo.jpg" alt="Description" />
  <Card.Header>
    <Card.Title>My title</Card.Title>
    <Card.Description>Subtitle</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Freeform content here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Implementation with compound components

```tsx
import { createContext, useContext } from "react";

interface CardContextType {
  variant: "flat" | "elevated" | "outlined";
}

const CardContext = createContext<CardContextType>({ variant: "flat" });

function Card({
  variant = "flat",
  children,
  className,
}: {
  variant?: CardContextType["variant"];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn(cardVariants({ variant }), className)}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 pb-0", className)}>{children}</div>;
};

Card.Title = function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
};

Card.Content = function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 pt-0 flex gap-2", className)}>{children}</div>;
};

export { Card };
```

---

## Design System Checklist

- [ ] Tokens defined (colors, typography, spacing, shadows, radii)
- [ ] Dark mode supported via semantic tokens
- [ ] Atomic Design components (atoms, molecules, organisms)
- [ ] Composition-based API (compound components)
- [ ] Mobile-first responsive
- [ ] Animations honor `prefers-reduced-motion`
- [ ] Focus visible only via keyboard
- [ ] ARIA patterns implemented
- [ ] Storybook for visual documentation
- [ ] Automated a11y tests (axe-core)
