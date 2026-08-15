<div align="center">

# 🏢 Atlas ERP by DevTHPrado

**ERP empresarial moderno, ágil e preparado para alta concorrência.**

Construído com Clean Architecture, C# / .NET 8 Web API, Entity Framework Core e Next.js 15.

[![Backend CI](../../actions/workflows/ci-backend.yml/badge.svg)](../../actions/workflows/ci-backend.yml)
[![Frontend CI](../../actions/workflows/ci-frontend.yml/badge.svg)](../../actions/workflows/ci-frontend.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![.NET 8](https://img.shields.io/badge/.NET-8.0-512bd4.svg)](https://dotnet.microsoft.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178c6.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Sobre

Sistema ERP completo voltado para comércio e prestação de serviços, com foco em usabilidade moderna, RBAC e operações rápidas de alto volume.

### Stack

| Camada | Tecnologias |
|--------|------------|
| **Backend** | C# · .NET 8 (Web API) · Entity Framework Core 8 · Npgsql · PostgreSQL 16 · Redis 7 (Cache & Distributed Lock) · JWT · BCrypt.Net |
| **Frontend** | Next.js 15 · React 19 · TypeScript · TailwindCSS · Shadcn/ui · Radix UI · TanStack Query · Zustand · Axios · Recharts · Zod |
| **DevOps & Infra** | Docker Compose · GitHub Actions · ESLint · Prettier · Multi-stage Dockerfile |

### Funcionalidades

- 🔐 **Autenticação & RBAC** — JWT com controle granular de permissões por Role
- 📊 **Dashboard Executivo** — KPIs de receita, lucro, estoque e fluxo de caixa
- 👥 **Gestão de Usuários** — Listagem e edição de perfis com permissões por role
- 🏗️ **Entidades Comerciais** — Empresas (Multi-tenant), clientes, fornecedores, produtos, categorias, marcas, unidades e depósitos
- 📦 **Estoque com Lock Distribuído** — Movimentações atômicas com Redis Distributed Lock para evitar concorrência desordenada
- 💰 **Financeiro** — Contas a pagar e receber com controle de vencimento
- 📝 **Auditoria** — Rastreabilidade e log de operações

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
| **API Docs (Swagger)** | http://localhost:8000/docs |
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
├── backend/                    # C# / .NET 8 Web API
│   ├── Atlas.sln               # Solução .NET
│   └── src/
│       ├── Atlas.Domain/       # Entidades, Enums e Interfaces centrais
│       ├── Atlas.Application/  # DTOs, Casos de uso e Interfaces de serviços
│       ├── Atlas.Infrastructure/# EF Core DbContext, Redis Cache/Lock, Identity
│       └── Atlas.Api/          # Controllers, Middlewares, Program.cs, Dockerfile
├── frontend/                   # Next.js 15 + React 19 + TypeScript + Shadcn/ui
├── docs/                       # Documentação técnica do projeto
├── .github/                    # GitHub Actions CI
└── docker-compose.yml
```

O backend segue rigorosamente a **Clean Architecture**:

- `Atlas.Domain` — Entidades puras e regras de domínio sem dependências externas
- `Atlas.Application` — DTOs, contratos de serviços e casos de uso de negócio
- `Atlas.Infrastructure` — Implementação com EF Core, Npgsql, Redis Cache/Lock e BCrypt
- `Atlas.Api` — Controllers RESTful, Middlewares (CorrelationId, Exception Handling), Swagger e RBAC

Leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes completos.

---

## 🛠️ Desenvolvimento

### Backend (.NET 8)

```bash
cd backend

# Restaurar dependências
dotnet restore

# Executar a API em modo desenvolvimento
dotnet run --project src/Atlas.Api

# Executar testes
dotnet test
```

### Frontend (Next.js 15)

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
# Subir ambiente completo
docker compose up --build -d

# Visualizar logs da API
docker compose logs -f backend

# Acessar shell do banco
docker compose exec postgres psql -U erp -d erp
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia o [guia de contribuição](CONTRIBUTING.md) antes de submeter alterações.
