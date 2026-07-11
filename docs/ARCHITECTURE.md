# Arquitetura do ERP Pequenas Empresas

## Visão Geral

Este ERP é estruturado como um **monorepo** com backend, frontend e infraestrutura isolados por responsabilidade. Tudo roda com um único `docker compose up`.

| Camada | Stack |
|--------|-------|
| **Backend** | Python 3.13, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, Redis, Celery, JWT, Pydantic V2 |
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn/ui, TanStack Query, Axios, Recharts, Zustand |
| **DevOps** | Docker Compose, GitHub Actions, ESLint, Prettier, Ruff, Black |

---

## Estrutura de Pastas

```
erp-pequenas-empresas/
├── backend/                    # API REST e lógica de negócio
│   ├── app/
│   │   ├── api/                # Rotas HTTP (controllers)
│   │   │   ├── router.py       # Agrega todos os sub-routers
│   │   │   └── routes/         # Um arquivo por domínio
│   │   ├── auth/               # Módulo de autenticação
│   │   │   ├── schemas.py      # DTOs de login/token
│   │   │   └── service.py      # Lógica de autenticação
│   │   ├── config/             # Configurações da aplicação
│   │   │   └── settings.py     # Pydantic BaseSettings
│   │   ├── core/               # Cross-cutting concerns
│   │   │   ├── logging.py      # Configuração de logs
│   │   │   └── security.py     # bcrypt, JWT
│   │   ├── database/           # Conexão e sessão
│   │   │   └── session.py      # Engine, SessionLocal, get_session
│   │   ├── dependencies/       # FastAPI Depends()
│   │   │   └── auth.py         # CurrentUser, require_permission
│   │   ├── exceptions/         # Exceções customizadas
│   │   │   └── handlers.py     # AppError, UnauthorizedError, etc.
│   │   ├── middlewares/        # Middlewares HTTP
│   │   │   └── correlation_id.py
│   │   ├── models/             # SQLAlchemy ORM (1 arquivo por domínio)
│   │   │   ├── base.py         # Base, UuidPkMixin, TimestampMixin
│   │   │   ├── company.py      # Company
│   │   │   ├── user.py         # User, RefreshToken
│   │   │   ├── role.py         # Role, Permission
│   │   │   ├── product.py      # Category, Brand, Product, StockMovement
│   │   │   ├── customer.py     # Customer
│   │   │   ├── supplier.py     # Supplier
│   │   │   ├── order.py        # SaleOrder, PurchaseOrder
│   │   │   ├── financial.py    # FinancialAccount
│   │   │   └── audit.py        # AuditLog
│   │   ├── repositories/       # Repository Pattern
│   │   │   └── user_repository.py  # Interface ABC + implementação SQLAlchemy
│   │   ├── schemas/            # Pydantic DTOs
│   │   │   ├── dashboard.py    # DashboardKpis, ChartPoint, DashboardResponse
│   │   │   └── user.py         # UserListItem
│   │   ├── services/           # Service Layer (lógica de negócio)
│   │   ├── utils/              # Helpers genéricos
│   │   ├── main.py             # Application factory
│   │   ├── seeds.py            # Dados de demonstração
│   │   └── worker.py           # Celery worker
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Testes automatizados
│   ├── scripts/                # Scripts utilitários
│   ├── requirements/           # Dependências (base.txt, dev.txt)
│   ├── pyproject.toml          # Configuração do projeto Python
│   └── Dockerfile
│
├── frontend/                   # Aplicação web
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # Componentes React
│   │   │   ├── auth/           # Componentes de autenticação
│   │   │   ├── dashboard/      # Componentes do dashboard
│   │   │   └── ui/             # Componentes base (Shadcn/ui)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer (Axios)
│   │   ├── types/              # TypeScript types + Zod schemas
│   │   ├── lib/                # Utilidades (cn)
│   │   ├── providers/          # Context providers
│   │   ├── stores/             # Zustand stores
│   │   ├── contexts/           # React contexts
│   │   ├── layouts/            # Layout components
│   │   ├── styles/             # Estilos compartilhados
│   │   ├── utils/              # Funções utilitárias
│   │   └── middleware.ts       # Next.js middleware
│   ├── public/                 # Assets estáticos
│   ├── package.json
│   └── Dockerfile
│
├── docs/                       # Documentação
├── .github/workflows/          # CI/CD
├── docker-compose.yml          # Orquestração unificada
└── README.md
```

---

## Responsabilidades de Cada Módulo

### Backend

| Módulo | Responsabilidade |
|--------|-----------------|
| `config/` | Carrega variáveis de ambiente via Pydantic BaseSettings |
| `core/` | Hashing de senhas (bcrypt), criação/validação de JWT, configuração de logs |
| `database/` | Engine SQLAlchemy, session factory, dependency `get_session` |
| `models/` | Definição das tabelas do banco (1 arquivo por domínio) |
| `schemas/` | DTOs Pydantic para validação de request/response |
| `repositories/` | Abstração de acesso a dados (interface + implementação) |
| `services/` | Lógica de negócio complexa (Service Layer) |
| `auth/` | Módulo completo de autenticação (schemas + service) |
| `api/` | Rotas HTTP que delegam para services/repositories |
| `dependencies/` | Funções `Depends()` do FastAPI (auth, session, etc.) |
| `middlewares/` | Correlation ID, logging, etc. |
| `exceptions/` | Hierarquia de exceções e exception handlers |

### Frontend

| Módulo | Responsabilidade |
|--------|-----------------|
| `app/` | Next.js App Router (pages, layouts, global CSS) |
| `components/` | Componentes React organizados por feature |
| `services/` | Funções de API usando Axios com interceptors |
| `types/` | TypeScript types e Zod schemas |
| `stores/` | Estado global com Zustand |
| `providers/` | Context providers (Theme, Query, etc.) |
| `hooks/` | Custom hooks reutilizáveis |
| `lib/` | Utilidades base (`cn` para Tailwind) |
| `utils/` | Funções utilitárias (formatação, etc.) |

---

## Como Iniciar o Projeto

### Com Docker (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/erp-pequenas-empresas.git
cd erp-pequenas-empresas

# 2. Configure o .env
cp .env.example .env

# 3. Suba tudo
docker compose up --build
```

O `docker compose up` executa automaticamente:
1. PostgreSQL (healthcheck)
2. Redis (healthcheck)
3. Backend (migrations + seeds + uvicorn)
4. Worker Celery
5. Frontend Next.js

### Sem Docker

#### Backend

```bash
cd backend

# Criar virtualenv
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Instalar dependências
pip install -e ".[dev]"

# Configurar banco local
# (PostgreSQL deve estar rodando em localhost:5432)
cp ../.env.example .env
# Edite .env com DATABASE_URL apontando para localhost

# Rodar migrations
alembic upgrade head

# Rodar seeds
python -m app.seeds

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis
# Crie .env.local com NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Iniciar dev server
npm run dev
```

---

## Padrões Arquiteturais

### Clean Architecture
- Separação clara entre camadas (models → repositories → services → api)
- Dependências apontam para dentro (api depende de services, services de repositories)

### Repository Pattern
- Interface abstrata (`UserRepository` ABC) + implementação concreta (`SqlAlchemyUserRepository`)
- Permite trocar o ORM sem alterar a lógica de negócio

### Service Layer
- `AuthService` encapsula a lógica de autenticação
- Routes delegam para services, não contêm lógica de negócio

### Dependency Injection
- FastAPI `Depends()` para injetar sessão, repositórios e usuário autenticado
- Facilita testes unitários com mocks

### RBAC (Role-Based Access Control)
- Permissões granulares (`dashboard:read`, `users:read`, `admin:*`)
- Middleware `require_permission` valida no nível da rota

---

## Boas Práticas para Futuras Implementações

### Adicionando um novo módulo (ex: Produtos CRUD)

1. **Schema**: Crie `app/schemas/product.py` com DTOs Pydantic
2. **Repository**: Crie `app/repositories/product_repository.py`
3. **Service**: Crie `app/services/product_service.py`
4. **Route**: Crie `app/api/routes/products.py`
5. **Router**: Registre em `app/api/router.py`
6. **Frontend**: Crie `src/types/product.types.ts`, `src/services/product.service.ts`, `src/components/products/`

### Convenções

- **Nomes**: snake_case para Python, camelCase para TypeScript
- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`)
- **Branches**: `feature/*`, `fix/*`, `refactor/*`
- **Formatação**: Black (Python), Prettier (TypeScript)
- **Linting**: Ruff (Python), ESLint (TypeScript)
- **Testes**: pytest (backend), vitest (frontend — futuro)

### Evolução Planejada

- Materialized views para dashboard de alto volume
- Soft delete para entidades com requisito regulatório
- Event sourcing para auditoria avançada
- Módulos de emissão fiscal (NF-e)
- Workflows de aprovação
- Relatórios avançados com exportação
