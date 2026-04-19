# AGENTS.md

## Stack

- **Backend**: PHP 8.2, Symfony 7.4 (Doctrine ORM 3.x, PostgreSQL 16)
- **Frontend**: React 19, TypeScript 6, Vite 8, React Router 7
- **Infra**: Docker Compose (Apache+PHP, PostgreSQL 16, Node/Vite)

The DB is **PostgreSQL 16**. The `DATABASE_URL` in `.env` uses `postgresql://`.

## Commands

### Backend

```bash
cd backend
composer install                           # install deps
php bin/phpunit                            # run all tests
php bin/phpunit tests/Controller/ProductControllerTest.php  # single test file
./vendor/bin/pint                          # format code (run before committing)
php bin/console doctrine:migrations:migrate # run migrations
php bin/console doctrine:fixtures:load      # seed data (8 products)
```

### Frontend

```bash
cd frontend
npm install           # install deps
npm run dev           # dev server (port 3000)
npm run build         # typecheck + build (runs `tsc -b && vite build`)
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
- `Controller/` — ProductController, OrderController (API REST under `/api/`)
- `Entity/` — Product, Order, OrderItem (Doctrine ORM)
- `Repository/` — ProductRepository (with pagination), OrderRepository, OrderItemRepository
- `Security/` — **SimulatedAuthSubscriber** and **AdminRoleSubscriber** (kernel event subscribers, priority 10 and 5)
- `DataFixtures/` — AppFixtures seeds 8 products

**Frontend** (`frontend/src/`):
- `pages/` — Login, Catalog, Cart, Checkout, OrderDetail
- `context/` — AuthContext, CartContext
- `services/` — API client (axios)
- `types/` — TypeScript interfaces

## Auth

Simulated via HTTP headers (no real auth system):
- `X-User-Id: <int>` — customer/user ID
- `X-User-Role: ADMIN|CLIENT` — role check

In tests, headers are `HTTP_X_User_Id` / `HTTP_X_User_Role` (Symfony's HTTP header normalization).

`GET /api/products` is public; all other `/api/*` endpoints require auth headers. `POST /api/products` requires `ADMIN`.

## Testing gotchas

- Checkout endpoint (`POST /api/orders/{id}/checkout`) has **randomized outcome** (80% success, 20% fail). Tests assert `assertContains($statusCode, [200, 402])` — do not assert exact status.
- PHPUnit config enables `failOnDeprecation`, `failOnNotice`, `failOnWarning` by default.
- No frontend test runner is set up (no vitest/jest in dependencies).

## Database

- PostgreSQL 16 (not MySQL), exposed on host port **5433** → container 5432
- DSN: `postgresql://hiberus:hiberus@127.0.0.1:5432/hiberus_test?serverVersion=16&charset=utf8` (local dev uses port 5432; Docker maps to 5433 on host)
- Doctrine ORM v3 (not v2) — uses `#[ORM\Entity]` attributes, not YAML/XML mapping

## Code style

- Run `./vendor/bin/pint` in `backend/` before committing PHP changes — this is required per project rules.
- No comments in code unless explicitly requested.