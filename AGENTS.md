# AGENTS.md

## Stack

- **Backend**: PHP 8.2, Symfony 7 (Doctrine ORM 3.x, PostgreSQL 16)
- **Frontend**: React 19, TypeScript 6, Vite 8, React Router 7, Axios
- **Infra**: Docker Compose (Apache+PHP, PostgreSQL 16, Node/Vite)

The DB is PostgreSQL 16. The `DATABASE_URL` uses `postgresql://`.

## Commands

### Backend

```bash
cd backend
composer install                           # install deps
php bin/phpunit                            # run all tests
php bin/phpunit tests/Controller/ProductControllerTest.php  # single test file
./vendor/bin/pint                          # format code (MUST run before committing)
php bin/console doctrine:migrations:migrate # run migrations
php bin/console doctrine:fixtures:load      # seed data (8 products)
```

### Frontend

```bash
cd frontend
npm install           # install deps
npm run dev           # dev server (port 3000)
npm run build         # typecheck + build (runs `tsc -b && vite build`) — MUST pass before committing
npm run lint          # eslint
```

### Docker

```bash
docker compose up --build              # start everything
docker compose exec backend php bin/phpunit  # tests inside container
```

Entrypoint (`backend/docker/entrypoint.sh`) auto-runs migrations and fixtures on every container start.

## Architecture

**Backend** (`backend/src/`):
- `Controller/` — ProductController, OrderController (REST API under `/api/`)
- `Entity/` — Product, Order, OrderItem (Doctrine ORM with `#[ORM\Entity]` attributes, not YAML/XML)
- `Repository/` — ProductRepository (paginated with search, category filter, sort), OrderRepository, OrderItemRepository
- `Security/` — SimulatedAuthSubscriber (priority 10) and AdminRoleSubscriber (priority 5) — kernel event subscribers, not Symfony Authenticators
- `DataFixtures/` — AppFixtures seeds 8 products

**Frontend** (`frontend/src/`):
- `pages/` — Login, Catalog, Cart, Checkout, OrderDetail, ProductForm, PaymentSuccess, PaymentFailed
- `components/` — Layout, PaymentForm (Stripe-style simulated card form)
- `context/` — AuthContext, CartContext, ToastContext (toast notifications)
- `services/api.ts` — Axios client with auth header interceptor
- `types/` — TypeScript interfaces

## Auth

Simulated via HTTP headers (no real auth system):
- `X-User-Id: <int>` — customer/user ID
- `X-User-Role: ADMIN|CLIENT` — role check

In tests, headers are `HTTP_X_User_Id` / `HTTP_X_User_Role` (Symfony's HTTP header normalization).

`GET /api/products` is public; all other `/api/*` endpoints require auth headers. `POST /api/products` requires `ADMIN`.

## API query params

`GET /api/products` supports: `search`, `page`, `sort` (id|name|price|stock|category|createdAt), `direction` (ASC|DESC), `category` (exact match).

## Payment flow

Checkout is a multi-step process — all simulated, no real payment:
1. `POST /api/orders` — creates order (status: `pending`), clears cart
2. Frontend shows `PaymentForm` (card number, holder, expiry, CVC — all cosmetic, not sent to backend)
3. `POST /api/orders/{id}/checkout` — randomized: 80% success → `paid`, 20% fail → `failed`
4. On success → redirect to `/payment/success?orderId=&total=` with animated checkmark
5. On failure → redirect to `/payment/failed?orderId=` with animated X
6. A full-screen overlay with spinner shows while the checkout API call is in flight

## Testing gotchas

- Checkout endpoint (`POST /api/orders/{id}/checkout`) has **randomized outcome** (80% success, 20% fail). Tests must assert `assertContains($statusCode, [200, 402])` — never assert exact status.
- PHPUnit config enables `failOnDeprecation`, `failOnNotice`, `failOnWarning` by default — any deprecation, notice, or warning will fail the suite.
- No frontend test runner (no vitest/jest in dependencies).

## Database

- PostgreSQL 16 — exposed on host port **5433** → container 5432
- DSN: `postgresql://hiberus:hiberus@127.0.0.1:5432/hiberus_test?serverVersion=16&charset=utf8` (local dev uses port 5432; Docker maps to 5433 on host)
- Doctrine ORM **v3** (not v2) — uses `#[ORM\Entity]` PHP attributes, not YAML/XML mapping

## Code style

- Run `./vendor/bin/pint` in `backend/` before committing PHP changes — required per project rules.
- Run `npm run build` in `frontend/` before committing — typecheck must pass.
- No comments in code unless explicitly requested.

## Design system

- Global root font-size is `22px` (not the browser default `16px`). All spacing/sizing uses this base.
- Max content width is `1440px` (`--max-w` CSS variable).
- Fonts: Cormorant Garamond (display/italic), Syne (body), DM Mono (data/labels).
- Toast notifications use `ToastContext` — call `useToast().toast('message')` anywhere.