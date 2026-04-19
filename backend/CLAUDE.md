# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Commands

```bash
composer install                                    # install deps
./vendor/bin/pint                                   # format — MUST run before committing
php bin/phpunit                                     # all tests
php bin/phpunit tests/Controller/Product/            # test directory
php bin/phpunit --filter=testCreateProduct           # single test
php bin/console doctrine:migrations:migrate          # run migrations
php bin/console doctrine:fixtures:load               # seed 23 products (purges DB)
php bin/console doctrine:fixtures:load --append      # seed without purging
php bin/console cache:clear                         # clear Symfony cache
```

## Architecture

Symfony 7 + Doctrine ORM 3.x + PostgreSQL 16. Pure JSON API — no Twig rendering.

### Auth (Simulated, not Symfony Security)

Security is implemented via **kernel event subscribers**, not Symfony's firewall/authenticator system. `security.yaml` is essentially unused (in-memory provider, no access_control rules).

- `SimulatedAuthSubscriber` (priority 10): requires `X-User-Id` + `X-User-Role` headers on all `/api/*` except `GET /api/products` (public). Stashes `simulated_user_id` / `simulated_user_role` as request attributes.
- `AdminRoleSubscriber` (priority 5): guards `POST /api/products` for `ADMIN` role.

Controllers read `$request->attributes->get('simulated_user_id')` for ownership checks.

### Controllers & Serialization

- Controllers extend `AbstractController`, return `JsonResponse`
- **No DTOs** — request bodies parsed via `json_decode($request->getContent(), true)` directly
- **No Serializer** — entities implement manual `toArray()` methods. `OrderItem.toArray()` nests full `Product.toArray()`
- Validation constraints are attributes on entity properties (`#[Assert\NotBlank]`, etc.), validated inline via `$this->validator->validate($entity)`

### Domain Model

- `Product`: name, description, price, stock, category, createdAt
- `Order`: customerId, status (pending/paid/failed), total, items (OneToMany). Total computed via `recalculateTotal()`
- `OrderItem`: order (ManyToOne), product (ManyToOne), quantity, unitPrice
- **Stock is decremented at order creation, not checkout** — failed payments leave stock reduced (no restoration logic)
- **Checkout is randomized**: `rand(1, 10) > 2` → 80% success (`paid`), 20% failure (`failed` with HTTP 402)

### Repositories

`ProductRepository.findPaginated()` supports search (name/description/category LIKE), category filter, sort whitelist (id/name/price/stock/category/createdAt), and pagination. Other repos use only inherited methods.

### API Routes (attribute-based)

All routes defined via `#[Route]` attributes on controller methods. `GET /api/products` is public; all other `/api/*` requires auth headers. `POST /api/products` requires ADMIN.

### CORS

Configured in `config/packages/nelmio_cors.yaml`. Custom headers `X-User-Id` and `X-User-Role` are in the allowed headers list — required for simulated auth to work.

## Testing Conventions

- PHPUnit 11 with strict mode: `failOnDeprecation`, `failOnNotice`, `failOnWarning` all enabled
- Auth headers in tests: `HTTP_X_User_Id` / `HTTP_X_User_Role` (Symfony's `HTTP_` prefix convention)
- Checkout tests must use `assertContains($statusCode, [200, 402])` due to randomized outcome
- Controller tests create products via API calls (no fixtures in tests)
- Entity tests use pure `TestCase`; controller tests use `WebTestCase`

## Docker

- Base: `php:8.4-apache`, extensions: intl, pdo, pdo_pgsql, pgsql, zip
- Entrypoint auto-creates `.env` if missing, runs `composer install` if no vendor/, runs migrations + fixtures, then starts Apache
- All entrypoint steps after composer use `|| true` (non-fatal)
- Apache vhost uses `FallbackResource /index.php` instead of `.htaccess`

## Code Style

- Run `./vendor/bin/pint` before committing — required. No custom `pint.json` (uses defaults)
- No comments unless non-obvious invariant
- Doctrine ORM 3 uses PHP attributes (`#[ORM\Entity]`, `#[ORM\Column]`), not YAML/XML