#!/usr/bin/env bash
set -e

echo "Encerrando os serviços do Atlas ERP..."
docker compose down
echo "Ambiente finalizado com sucesso."
