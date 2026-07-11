# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Estrutura monorepo profissional com backend e frontend unificados
- Docker Compose unificado na raiz do projeto
- GitHub Actions CI para backend e frontend
- Documentação open-source (README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)
- ARCHITECTURE.md com documentação completa da arquitetura

### Changed
- Reorganização do backend seguindo Clean Architecture pragmática
- Split de models monolítico em arquivos por domínio
- Extração de schemas Pydantic para diretório dedicado
- Reorganização do frontend com separação em services, types, providers
- Substituição de fetch nativo por Axios no frontend
- Dockerfiles otimizados para ambos os serviços

## [0.1.0] - 2026-07-10

### Added
- Autenticação JWT com RBAC
- Dashboard executivo com KPIs
- Entidades centrais (Company, User, Role, Permission, Customer, Supplier, Product, etc.)
- Migration inicial com Alembic
- Seeds para dados de demonstração
- Frontend com Next.js 15 e TailwindCSS
- Login screen e dashboard shell
