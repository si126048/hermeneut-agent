param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "Starting Hermeneut-Agent Web UI at http://127.0.0.1:$Port ..."
python -m uvicorn hermeneut.api:app --host 127.0.0.1 --port $Port
