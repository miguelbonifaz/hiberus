# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Commands

```bash
npm install             # install deps
npm run dev             # dev server port 3000
npm run build           # tsc -b && vite build — MUST pass before committing
npm run lint            # eslint (flat config, no Prettier)
```

## Architecture

React 19 + TypeScript 6 + Vite 8 + React Router 7. Single-page app, no SSR.

### Routing

`createBrowserRouter` with static route tree in `App.tsx`. `Layout` is the root element with `<Outlet />`.

Route guards are wrapper components (not loaders/middleware):
- `RequireAuth` — redirects to `/login` if no user
- `RequireAdmin` — redirects to `/login` if no user, `/catalog` if not admin

Public routes: `/` (login), `/catalog` (product listing). All other routes require auth. Admin-only: `/products/new`, `/products/:id/edit`.

### State Management

Pure React Context — no external state library.

- `AuthContext`: fake auth — user provides arbitrary ID + role. Persisted to `localStorage`. Exposes `login(id, role)`, `logout()`, `isAdmin`.
- `CartContext`: in-memory only (not persisted). Enforces stock limits. Exposes `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, computed `total`/`count`.
- `ToastContext`: auto-dismiss after 2400ms. `useToast().toast('message')`.

Provider nesting: `AuthProvider > CartProvider > ToastProvider > RouterProvider`.

### API Layer

Single file `services/api.ts`. Axios instance with `baseURL` from `VITE_API_URL` (defaults to `http://localhost:8000`). Request interceptor reads `localStorage('user')` and injects `X-User-Id` / `X-User-Role` headers. Two namespaces: `productApi` (list, get, create, update) and `orderApi` (create, get, checkout).

### Payment Flow

Two-step: `POST /api/orders` → create order (status: pending, cart cleared), then `POST /api/orders/:id/checkout` → randomized 80% success/20% fail. `PaymentForm` is cosmetic only — card data is never sent to backend.

### Constants

`constants.ts`: `CATEGORIES` = `["Electronics", "Accessories", "Furniture", "Other"]`. `CATEGORY_OPTIONS` excludes "Other" (triggers free-text custom category input in ProductForm).

## TypeScript Config

- `verbatimModuleSyntax: true` — must use `import type` for type-only imports
- `erasableSyntaxOnly: true` — no `enum` or `namespace` (TS 6 constraint)
- `ignoreDeprecations: "6.0"` — TS 6 migration shim
- Strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

## CSS / Design System

Single global stylesheet `index.css` (~1560 lines). No CSS modules, no preprocessor, no component library.

- Root font-size: **22px** (not browser default 16px). Scales down at breakpoints.
- Fonts: Cormorant Garamond (display/italic headings), Syne (body), DM Mono (labels/data/badges)
- Layout: `--nav-height: 64px`, `--max-w: 1440px`
- Color palette: neutral-only (`--white`, `--black`, `--gray-100` through `--gray-600`)
- BEM-adjacent naming: `.filter-pill--active`, `.payment-input-wrap--focus`
- Utility classes: `.btn` (`.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-remove`), `.input`, `.label`, `.data`, `.badge`, `.card`, `.page`, `.empty-state`
- 4 breakpoints: mobile (<640px, 16px root), small tablet (640-767px, 18px), tablet (768-1023px, 20px), desktop (1024px+, 22px)
- Responsive catalog: `<table>` on desktop, card list (`.catalog-cards`) on mobile
- Hamburger nav on mobile/tablet, desktop nav on 768px+

## Path Alias

`@` → `./src` (configured in both `vite.config.ts` and `tsconfig.app.json`). Used consistently in all imports.

## Docker

Dev-only Dockerfile: `node:20-alpine`, runs `npm run dev -- --host 0.0.0.0`. No production build in Docker.

## Known Issue

`OrderDetailPage` is defined but not wired into the router — `PaymentFailedPage` navigates to `/order` which has no route.

## Code Style

- Run `npm run build` before committing — typecheck must pass
- No comments unless non-obvious invariant
- All components are function components with default exports
- Inline `style={{}}` props used freely for one-off layout tweaks