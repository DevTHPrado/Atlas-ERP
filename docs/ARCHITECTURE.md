# Arquitetura do Atlas ERP (ERP Ágil / Gestão Comercial)

## Visão Geral

O **Atlas ERP** é estruturado como um monorepo corporativo, combinando o alto rendimento e tipagem forte do ecossistema **C# / .NET 8** no backend com a flexibilidade moderna do **Next.js 15** no frontend.

| Camada | Stack Principal |
|--------|-----------------|
| **Backend** | C# · .NET 8 (ASP.NET Core Web API) · Entity Framework Core 8 · Npgsql · PostgreSQL 16 · Redis 7 (Cache & Distributed Lock) · JWT · BCrypt.Net |
| **Frontend** | Next.js 15 · React 19 · TypeScript 5.7+ · TailwindCSS · Shadcn/ui · Radix UI · TanStack Query · Zustand · Axios · Recharts · Zod |
| **DevOps & Infra** | Docker Compose · Multi-stage Dockerfiles · GitHub Actions |

---

## Estrutura de Pastas (.NET 8 Clean Architecture)

```
erp-pequenas-empresas/
├── backend/
│   ├── Atlas.sln                     # Solução .NET 8
│   ├── Dockerfile                    # Multi-stage build (.NET 8 SDK + ASP.NET Runtime)
│   └── src/
│       ├── Atlas.Domain/             # Entidades, Enums e Interfaces Centrais
│       │   ├── Common/               # BaseEntity, ISoftDelete, ITenantEntity
│       │   ├── Entities/             # Company, User, Role, Customer, Product, etc.
│       │   └── Enums/                # MovementType, StockMovementReason, etc.
│       ├── Atlas.Application/        # Casos de Uso, DTOs e Interfaces de Serviços
│       │   ├── Common/               # PaginatedResponse<T>
│       │   ├── DTOs/                 # Auth, Dashboard, Customer, Product DTOs
│       │   ├── Exceptions/           # AppException, NotFoundException, etc.
│       │   └── Interfaces/           # IAuthService, IProductService, IStockService, etc.
│       ├── Atlas.Infrastructure/     # Acesso a Dados, EF Core, Redis e Criptografia
│       │   ├── Data/                 # AtlasDbContext, DatabaseSeeder
│       │   ├── Identity/             # PasswordHasher (BCrypt), JwtTokenGenerator
│       │   ├── Redis/                # RedisCacheService, RedisDistributedLockService
│       │   └── Services/             # Implementações de serviços de aplicação
│       └── Atlas.Api/                # ASP.NET Core Web API
│           ├── Controllers/          # Auth, Dashboard, Users, Customers, Products
│           ├── Middlewares/          # CorrelationIdMiddleware, GlobalExceptionHandler
│           ├── Security/             # RBAC (HasPermissionAttribute, PermissionHandler)
│           ├── Program.cs            # Injeção de dependências e pipeline HTTP
│           └── appsettings.json      # Configurações de conexão e JWT
│
├── frontend/                         # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/                      # Rotas e páginas (Dashboard, Clientes, Produtos, Estoque)
│   │   ├── components/               # Componentes UI (Shadcn/ui, Radix UI)
│   │   ├── services/                 # Clientes de API Axios
│   │   ├── stores/                   # Gerenciamento de estado Zustand
│   │   └── types/                    # Tipagens TypeScript e validação Zod
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                # Orquestração do ambiente completo
├── docker-compose.prod.yml           # Orquestração de produção
└── README.md
```

---

## Padrões Arquiteturais e Decisões de Design

### 1. Clean Architecture (Separação em Camadas)
1. **Domain**: Contém as entidades essenciais de negócio e interfaces puras. Não depende de nenhum framework de banco de dados ou UI.
2. **Application**: Contém os contratos de casos de uso, DTOs de request/response e regras agnósticas a banco.
3. **Infrastructure**: Implementa os acessos externos — Entity Framework Core com Npgsql (PostgreSQL), StackExchange.Redis para cache e locks, e BCrypt/JWT para autenticação.
4. **API**: Camada de apresentação HTTP com controladores RESTful, middlewares de correlação/exceções e documentação Swagger interativa.

### 2. Concorrência e Distributed Lock com Redis
Para operações críticas como movimentações de estoque e reconciliação de inventário, o sistema utiliza o **Redis Distributed Lock** (`IDistributedLockService`) com liberação atômica via scripts Lua. Isso evita condições de corrida (*race conditions*) em cenários de alta demanda simultânea.

### 3. Autenticação e RBAC (Role-Based Access Control)
- **JWT (JSON Web Tokens)**: Tokens assinados com HMAC-SHA256 contendo `company_id`, `sub`, `email` e claims de `permission`.
- **HasPermissionAttribute**: Autorização declarativa nos endpoints HTTP verificando se o usuário logado possui a permissão requerida (ou o wildcard administrativo `admin:*`).

### 4. Resiliência e Observabilidade
- **Correlation ID Middleware**: Rastreia requisições ponta a ponta adicionando o header `X-Correlation-ID`.
- **Global Exception Handler**: Captura exceções e formata respostas de erro padronizadas baseadas em RFC 7807 Problem Details.
