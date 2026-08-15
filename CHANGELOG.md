# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Backend reescrito em **C# / .NET 8 (ASP.NET Core Web API)** com **Clean Architecture**
- Mapeamento e persistência com **Entity Framework Core 8** e **Npgsql**
- Cache e **Distributed Lock** atômico com **Redis 7** e **StackExchange.Redis**
- Documentação interativa via **Swagger / OpenAPI** com suporte a JWT Bearer
- Seeder de banco de dados automático em C# para inicialização ágil
- Multi-stage Dockerfile para compilação e publicação otimizada do .NET 8

### Changed
- Migração de FastAPI / SQLAlchemy para .NET 8 / EF Core 8
- Atualização do `docker-compose.yml` e `docker-compose.prod.yml` para orquestração da API .NET 8
- Atualização do `README.md` e `docs/ARCHITECTURE.md` para refletir o ecossistema C# / .NET 8

## [0.1.0] - 2026-07-10

### Added
- Autenticação JWT com RBAC
- Dashboard executivo com KPIs
- Entidades centrais (Company, User, Role, Permission, Customer, Supplier, Product, etc.)
- Migration inicial com Alembic
- Seeds para dados de demonstração
- Frontend com Next.js 15 e TailwindCSS
- Login screen e dashboard shell
