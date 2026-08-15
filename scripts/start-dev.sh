#!/usr/bin/env bash
set -e

echo "========================================="
echo "     Iniciando Atlas ERP (Dev Stack)     "
echo "========================================="

docker compose up --build -d

echo ""
echo "Serviços iniciados com sucesso!"
echo "Frontend:    http://localhost:3000"
echo "Backend API: http://localhost:8000/api/v1"
echo "Swagger Docs:http://localhost:8000/docs"
echo "Healthcheck: http://localhost:8000/health"
echo ""
echo "Para encerrar: ./scripts/stop-dev.sh"
