<#
.SYNOPSIS
Inicia o ambiente de desenvolvimento do Atlas ERP.

.DESCRIPTION
Este script sobe o ambiente completo (Postgres 16, Redis 7, Backend .NET 8 e Frontend Next.js 15) via Docker Compose.
#>

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "     Iniciando Atlas ERP (Dev Stack)     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

docker compose up --build -d

Write-Host "`nServiços iniciados com sucesso!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000/api/v1" -ForegroundColor White
Write-Host "Swagger Docs:http://localhost:8000/docs" -ForegroundColor White
Write-Host "Healthcheck: http://localhost:8000/health" -ForegroundColor White
Write-Host "`nPara encerrar: execute ./scripts/stop-dev.ps1" -ForegroundColor Yellow
