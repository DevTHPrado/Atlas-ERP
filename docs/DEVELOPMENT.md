# Guia de Desenvolvimento Híbrido - Atlas ERP

Este guia explica como executar o ambiente de desenvolvimento local do Atlas ERP.

Devido à necessidade de otimizar recursos de hardware (memória RAM) durante o desenvolvimento, adotamos uma abordagem **Híbrida**.

- **Infraestrutura** (Banco de dados e Cache): Executados via Docker.
- **Aplicação** (Frontend e Backend): Executados nativamente na máquina Host.

Isso garante que a aplicação não sofra com a sobrecarga de virtualização/contêineres enquanto você programa, mantendo ferramentas como `Turbopack` e `uvicorn --reload` em máxima performance.

---

## 1. Pré-requisitos

1. **Docker e Docker Compose** instalados (apenas para rodar Postgres e Redis).
2. **Node.js (22+)** instalado localmente para rodar o Next.js.
3. **Python (3.13)** instalado localmente para rodar o FastAPI.

---

## 2. Como Executar (Modo Automático)

Criamos scripts práticos na pasta `scripts/` para gerenciar tudo de forma automática.

### No Windows (PowerShell)
```powershell
# Iniciar o ambiente completo
.\scripts\start-dev.ps1

# Parar o ambiente
.\scripts\stop-dev.ps1
```

### No Linux/Mac (Bash)
```bash
# Iniciar o ambiente completo
./scripts/start-dev.sh

# Parar o ambiente
./scripts/stop-dev.sh
```

Esses scripts farão o seguinte:
1. Sobem o PostgreSQL e o Redis via Docker Compose.
2. Aguardam os serviços ficarem *Healthy*.
3. Iniciam o Backend localmente (`uvicorn`).
4. Iniciam o Frontend localmente (`next dev --turbo`).

---

## 3. Como Executar (Modo Manual)

Se você preferir ter controle total sobre os terminais, pode subir cada peça manualmente.

### Passo 1: Infraestrutura (Docker)
```bash
docker compose up -d
```
*Isso lerá o arquivo `docker-compose.yml` que contém APENAS os serviços `postgres` e `redis`.*

### Passo 2: Backend (FastAPI)
Em um novo terminal:
```bash
cd backend

# (Opcional) Crie e ative seu ambiente virtual Python
python -m venv venv
# Windows: .\venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements/base.txt
uvicorn app.main:app --reload --port 8000
```

### Passo 3: Frontend (Next.js)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Banco de Dados e Migrations (Alembic)

Com o banco de dados rodando (via Docker), você pode rodar as migrations diretamente do seu host.

Certifique-se de estar na pasta `backend/` e com as dependências instaladas.

**Criar uma migration:**
```bash
alembic revision --autogenerate -m "Descrição da mudança"
```

**Rodar migrations (Atualizar DB):**
```bash
alembic upgrade head
```

---

## 5. Rodando Testes

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm run test # Se configurado
```

---

## 6. Diferença entre DEV e PROD

**Desenvolvimento:**
- Arquivo `docker-compose.yml` inicia **APENAS** recursos de banco de dados e Redis.
- Backend roda localmente via `uvicorn --reload`.
- Frontend roda via `npm run dev --turbo`.

**Produção:**
- Arquivo `docker-compose.prod.yml` é a versão oficial (Enterprise) que orquestra tudo.
- Frontend usa Multi-Stage Build e roda em modo standalone.
- Backend roda sem o `--reload`, com múltiplos workers.
- Celery worker sobe acoplado no mesmo stack.

Se desejar testar a arquitetura de produção localmente, execute:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
