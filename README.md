# Hiberus - Prueba Técnica PHP/Symfony + React

MVP de gestión de pedidos y pagos con API REST (Symfony) y frontend (React + TypeScript).

## Requisitos

- Docker & Docker Compose
- (Opcional para desarrollo local) PHP 8.2+, Node 20+

## Inicio Rápido

```bash
# Clonar y levantar todo
docker compose up --build

# El backend estará en http://localhost:8000
# El frontend estará en http://localhost:3000
```

La primera vez se ejecutan automáticamente:
- Migraciones de base de datos
- Fixtures con datos de ejemplo (8 productos)

## Estructura del Proyecto

```
hiberus-backend2/
├── backend/               # Symfony 7 API
│   ├── src/
│   │   ├── Controller/    # ProductController, OrderController
│   │   ├── Entity/        # Product, Order, OrderItem
│   │   ├── Repository/   # ProductRepository (paginado)
│   │   ├── Security/     # SimulatedAuthSubscriber, AdminRoleSubscriber
│   │   └── DataFixtures/ # AppFixtures (8 productos de ejemplo)
│   ├── migrations/
│   ├── tests/
│   └── docker/
├── frontend/              # React 19 + TypeScript + Vite
│   └── src/
│       ├── components/    # Layout
│       ├── context/       # AuthContext, CartContext
│       ├── pages/         # Login, Catalog, Cart, Checkout, OrderDetail
│       ├── services/      # API client (axios)
│       └── types/         # TypeScript interfaces
├── docs/
│   └── openapi.yaml      # Documentación OpenAPI 3.0
└── docker-compose.yml
```

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

| Método | Endpoint              | Descripción              | Auth      |
|--------|-----------------------|--------------------------|-----------|
| GET    | /api/products         | Listar productos (paginado) | Público  |
| POST   | /api/products         | Crear producto           | ADMIN     |
| POST   | /api/orders           | Crear pedido              | CLIENT   |
| GET    | /api/orders/{id}      | Ver detalle de pedido     | Owner    |
| POST   | /api/orders/{id}/checkout | Checkout simulado     | Owner    |

### Autenticación Simulada

Enviar headers en cada request:
```
X-User-Id: 1
X-User-Role: ADMIN
```
o
```
X-User-Id: 2
X-User-Role: CLIENT
```

## Pruebas

### Backend (PHPUnit)

```bash
cd backend
php bin/phpunit
```

### Backend con Docker

```bash
docker compose exec backend php bin/phpunit
```

## Desarrollo Local (sin Docker)

### Backend

```bash
cd backend
composer install
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
symfony serve:start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Stack

- **Backend**: PHP 8.2, Symfony 7, Doctrine ORM, PostgreSQL 16
- **Frontend**: React 19, TypeScript, Vite, React Router 7, Axios
- **Infra**: Docker Compose (PHP/Apache, PostgreSQL 16, Node/Vite)