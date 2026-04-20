# Hiberus - Prueba Técnica PHP/Symfony + React

MVP de gestión de pedidos y pagos con API REST (Symfony) y frontend (React + TypeScript).

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)

## Inicio Rápido

```bash
# Clonar y levantar
git clone https://github.com/miguelbonifaz/hiberus.git && cd hiberus
docker compose up --build
```

La primera vez se ejecutan automáticamente:
- Instalación de dependencias (Composer + npm)
- Migraciones de base de datos
- Fixtures con datos de ejemplo (23 productos)

### URLs locales

| Servicio  | URL                          |
|-----------|------------------------------|
| Backend   | http://localhost:8000/api/   |
| Frontend  | http://localhost:3000         |
| PostgreSQL| localhost:5433 (usuario: `hiberus`, contraseña: `hiberus`, DB: `hiberus_test`) |

### Detener

```bash
docker compose down          # detener contenedores
docker compose down -v       # detener y eliminar volúmenes (resetea la DB)
```

## Autenticación Simulada

No hay sistema de login real. Se usan headers HTTP:

| Header        | Valor    | Efecto                          |
|---------------|----------|---------------------------------|
| `X-User-Id`   | `1`      | ID del usuario simulado         |
| `X-User-Role` | `ADMIN`  | Acceso a crear productos        |
| `X-User-Role` | `CLIENT` | Acceso a pedidos y checkout     |

El frontend envía estos headers automáticamente vía interceptor Axios leyendo `localStorage('user')`.

## Modelo de Datos

### Product
| Campo      | Tipo    | Descripción           |
|------------|---------|-----------------------|
| id         | int     | PK auto-increment     |
| name       | string  | Nombre (2-255 chars)  |
| description| text    | Descripción (nullable)|
| price      | float   | Precio (> 0)          |
| stock      | int     | Stock (≥ 0)           |
| category   | string  | Categoría (50 chars)  |
| createdAt  | datetime| Fecha de creación     |

### Order
| Campo      | Tipo    | Descripción                   |
|------------|---------|-------------------------------|
| id         | int     | PK auto-increment             |
| customerId | int     | ID del cliente simulado       |
| status     | string  | pending / paid / failed       |
| total      | float   | Total calculado               |
| createdAt  | datetime| Fecha de creación             |
| paidAt     | datetime| Fecha de pago (nullable)      |

### OrderItem
| Campo     | Tipo  | Descripción          |
|-----------|-------|----------------------|
| id        | int   | PK auto-increment    |
| order_id  | int   | FK → orders          |
| product_id| int   | FK → products        |
| quantity  | int   | Cantidad (> 0)       |
| unitPrice | float | Precio unitario      |

## API Endpoints

| Método | Endpoint                  | Descripción               | Auth   |
|--------|---------------------------|---------------------------|--------|
| GET    | /api/products             | Listar productos (paginado) | Público |
| POST   | /api/products             | Crear producto            | ADMIN  |
| POST   | /api/orders               | Crear pedido              | CLIENT |
| GET    | /api/orders/{id}          | Ver detalle de pedido     | Owner  |
| POST   | /api/orders/{id}/checkout | Checkout simulado         | Owner  |

## Pruebas

```bash
# Tests del backend
docker compose exec backend php bin/phpunit

# Linter PHP (obligatorio antes de commit)
docker compose exec backend ./vendor/bin/pint

# Typecheck del frontend (obligatorio antes de commit)
docker compose exec frontend npm run build
```

## Flujo de Pago (Simulado)

1. `POST /api/orders` → pedido creado (status: `pending`), carrito vaciado
2. Frontend muestra `PaymentForm` (cosmético, no envía datos de tarjeta)
3. `POST /api/orders/{id}/checkout` → resultado aleatorio: 80% éxito (`paid`), 20% fallo (`failed`)
4. Éxito → `/payment/success`, fallo → `/payment/failed`

## Documentación

- Colección Postman: `docs/hiberus-api.postman_collection.json`

## Stack

- **Backend**: PHP 8.4, Symfony 7, Doctrine ORM, PostgreSQL 16
- **Frontend**: React 19, TypeScript, Vite, React Router 7, Axios
- **Infra**: Docker Compose (PHP/Apache, PostgreSQL 16, Node/Vite)