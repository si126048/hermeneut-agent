param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$dataDir = Join-Path $PSScriptRoot 'data'
if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Force $dataDir | Out-Null }

Write-Host "Starting Hermeneut-Agent Web UI at http://127.0.0.1:$Port ..." -ForegroundColor Cyan
python -m uvicorn hermeneut.api:app --host 127.0.0.1 --port $Port
