<#
.SYNOPSIS
Para o ambiente de desenvolvimento do Atlas ERP.
#>

Write-Host "Encerrando os serviços do Atlas ERP..." -ForegroundColor Cyan
docker compose down

Write-Host "Ambiente finalizado com sucesso." -ForegroundColor Green
