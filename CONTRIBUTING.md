# Contributing to ERP Pequenas Empresas

Obrigado por considerar contribuir com este projeto! Este guia ajuda a manter o código organizado e profissional.

## Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/erp-pequenas-empresas.git
cd erp-pequenas-empresas

# 2. Copie o .env
cp .env.example .env

# 3. Suba o ambiente
docker compose up --build
```

## Convenções de Código

### Backend (Python)

- **Formatação**: [Black](https://black.readthedocs.io/) com line-length 100
- **Linting**: [Ruff](https://docs.astral.sh/ruff/) com regras padrão
- **Tipagem**: Type hints em todas as funções públicas
- **Docstrings**: Para módulos e classes públicas

```bash
cd backend
ruff check .
black --check .
pytest
```

### Frontend (TypeScript)

- **Formatação**: [Prettier](https://prettier.io/)
- **Linting**: [ESLint](https://eslint.org/) com config Next.js
- **Tipagem**: TypeScript strict mode

```bash
cd frontend
npm run lint
npm run typecheck
```

## Git Workflow

### Branches

| Branch | Descrição |
|--------|-----------|
| `main` | Branch principal, sempre estável |
| `develop` | Branch de desenvolvimento |
| `feature/*` | Novas funcionalidades |
| `fix/*` | Correções de bugs |
| `refactor/*` | Refatorações |

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adicionar endpoint de criação de produtos
fix: corrigir cálculo de estoque mínimo
refactor: extrair service layer do módulo financeiro
docs: atualizar ARCHITECTURE.md
test: adicionar testes para auth service
chore: atualizar dependências do frontend
```

### Pull Requests

1. Crie uma branch a partir de `develop`
2. Implemente suas alterações
3. Garanta que lint e testes passam
4. Abra um PR com descrição clara
5. Aguarde review de pelo menos 1 mantenedor

## Estrutura do Projeto

Leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para entender a organização do código.

## Reportando Bugs

Use as [Issues](../../issues) do GitHub com o template de bug report. Inclua:

- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Logs relevantes

## Sugerindo Features

Abra uma Issue com o template de feature request. Descreva:

- O problema que você quer resolver
- A solução proposta
- Alternativas consideradas
