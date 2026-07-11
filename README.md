<div align="center">

# 🏢 Atlas ERP by DevTHPrado

**ERP empresarial moderno, escalável e preparado para produção.**

Construído com Clean Architecture, FastAPI e Next.js.

[![Backend CI](../../actions/workflows/ci-backend.yml/badge.svg)](../../actions/workflows/ci-backend.yml)
[![Frontend CI](../../actions/workflows/ci-frontend.yml/badge.svg)](../../actions/workflows/ci-frontend.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13+-3776ab.svg)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Sobre

Sistema ERP completo para pequenas empresas brasileiras. Gerencie vendas, estoque, financeiro, clientes e fornecedores em uma única plataforma.

### Stack

| Camada | Tecnologias |
|--------|------------|
| **Backend** | Python 3.13 · FastAPI · SQLAlchemy 2 · Alembic · PostgreSQL · Pydantic V2 · JWT · bcrypt |
| **Frontend** | Next.js 15 · React 19 · TypeScript · TailwindCSS · Shadcn/ui · TanStack Query · Axios · Recharts |
| **DevOps** | Docker Compose · GitHub Actions · ESLint · Prettier · Ruff · Black |

### Funcionalidades

- 🔐 **Autenticação** — JWT com RBAC (Role-Based Access Control)
- 📊 **Dashboard Executivo** — KPIs de receita, lucro, estoque e fluxo de caixa
- 👥 **Gestão de Usuários** — Listagem com permissões por role
- 🏗️ **Entidades Centrais** — Empresas, clientes, fornecedores, produtos, categorias, marcas
- 📦 **Estoque** — Movimentações e alertas de estoque mínimo
- 💰 **Financeiro** — Contas a pagar e receber com controle de vencimento
- 📝 **Auditoria** — Log imutável de operações

---

## 🚀 Quick Start

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

### Subir o ambiente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/erp-pequenas-empresas.git
cd erp-pequenas-empresas

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Suba tudo com um comando
docker compose up --build
```

### Acessar

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |
| **Health Check** | http://localhost:8000/health |

### Credenciais de Demonstração

| Campo | Valor |
|-------|-------|
| Email | `admin@erp.local` |
| Senha | `Sapo1010@` |

---

## 🏗️ Arquitetura

```
erp-pequenas-empresas/
├── backend/         # FastAPI + SQLAlchemy + PostgreSQL
├── frontend/        # Next.js 15 + React 19 + TypeScript
├── docs/            # Documentação do projeto
├── .github/         # GitHub Actions CI
└── docker-compose.yml
```

O backend segue **Clean Architecture** com separação em:

- `config/` — Configurações e variáveis de ambiente
- `core/` — Cross-cutting concerns (segurança, logging)
- `models/` — Entidades SQLAlchemy (1 arquivo por domínio)
- `schemas/` — DTOs Pydantic para request/response
- `repositories/` — Acesso a dados (Repository Pattern)
- `services/` — Lógica de negócio (Service Layer)
- `api/` — Rotas HTTP e controllers
- `auth/` — Módulo de autenticação
- `dependencies/` — Injeção de dependência FastAPI
- `middlewares/` — Middlewares HTTP
- `exceptions/` — Exceções customizadas

Leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes completos.

---

## 🛠️ Desenvolvimento

### Backend

```bash
cd backend

# Instalar dependências
pip install -e ".[dev]"

# Rodar testes
pytest

# Lint
ruff check .

# Formatação
black .
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Dev server
npm run dev

# Lint
npm run lint

# Type check
npm run typecheck
```

### Comandos Docker úteis

```bash
# Rodar migrations
docker compose exec backend alembic upgrade head

# Rodar seeds
docker compose exec backend python -m app.seeds

# Rodar testes do backend
docker compose exec backend pytest

# Acessar shell do banco
docker compose exec postgres psql -U erp -d erp
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia o [guia de contribuição](CONTRIBUTING.md) antes de submeter alterações.
