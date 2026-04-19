# Hiberus - Prueba Técnica PHP/Symfony + React

MVP de gestión de pedidos y pagos con API REST (Symfony) y frontend (React + TypeScript).

## Inicio Rápido

```bash
docker compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

La primera vez se ejecutan automáticamente:
- Migraciones de base de datos
- Fixtures con datos de ejemplo (8 productos)

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

### Autenticación Simulada

```
X-User-Id: 1
X-User-Role: ADMIN
```
```
X-User-Id: 2
X-User-Role: CLIENT
```

## Pruebas

```bash
docker compose exec backend php bin/phpunit
```

## Documentación

- OpenAPI 3.0: `docs/openapi.yaml`

## Stack

- **Backend**: PHP 8.2, Symfony 7, Doctrine ORM, PostgreSQL 16
- **Frontend**: React 19, TypeScript, Vite, React Router 7, Axios
- **Infra**: Docker Compose (PHP/Apache, PostgreSQL 16, Node/Vite)