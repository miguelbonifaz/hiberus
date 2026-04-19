# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hiberus MVP — product catalog + order/payment management. REST API (Symfony 7) + React frontend. Docker Compose for local dev. See `backend/CLAUDE.md` and `frontend/CLAUDE.md` for directory-specific details.

## Docker

```bash
docker compose up --build                       # start everything
docker compose exec backend php bin/phpunit      # tests inside container
```

Entrypoint (`backend/docker/entrypoint.sh`) auto-runs migrations + fixtures on every container start.

## Local URLs

- Backend API: `http://localhost:8000/api/`
- Frontend dev: `http://localhost:3000/`
- PostgreSQL (host): `localhost:5433` (container: 5432)

## Database

- PostgreSQL 16, host port **5433** → container 5432
- DSN (from host): `postgresql://hiberus:hiberus@127.0.0.1:5433/hiberus_test?serverVersion=16&charset=utf8`
- DSN (inside container): `postgresql://hiberus:hiberus@db:5432/hiberus_test?serverVersion=16&charset=utf8`
- `doctrine:fixtures:load` **purges all data** — use `--append` to preserve existing rows

## Auth (Simulated — Cross-Cutting)

No real auth system — uses HTTP headers:

- `X-User-Id: <int>` — user/customer ID
- `X-User-Role: ADMIN|CLIENT`

Frontend sends via Axios interceptor reading `localStorage('user')`. Backend validates via `SimulatedAuthSubscriber` + `AdminRoleSubscriber` (kernel event subscribers, not Symfony Authenticators). In PHPUnit tests: `HTTP_X_User_Id` / `HTTP_X_User_Role`.

`GET /api/products` is public. All other `/api/*` requires auth. `POST /api/products` requires `ADMIN`.

## Payment Flow (End-to-End, All Simulated)

1. `POST /api/orders` → order created (status: `pending`), cart cleared
2. Frontend shows `PaymentForm` (cosmetic only, card data not sent to backend)
3. `POST /api/orders/{id}/checkout` → randomized: 80% success (`paid`), 20% fail (`failed`)
4. Success → `/payment/success?orderId=&total=`, failure → `/payment/failed?orderId=`

## Testing Gotchas

- Checkout endpoint has **randomized outcome** — tests must `assertContains($statusCode, [200, 402])`, never assert exact status
- PHPUnit: `failOnDeprecation`, `failOnNotice`, `failOnWarning` all enabled
- No frontend test runner (no vitest/jest)

## Code Style

- Run `./vendor/bin/pint` in `backend/` before committing PHP — **required**
- Run `npm run build` in `frontend/` before committing — typecheck must pass
- No comments in code unless explicitly requested