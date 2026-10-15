param(
    [string]$Database = "$PSScriptRoot\data\lacan.db"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
New-Item -ItemType Directory -Force (Split-Path -Parent $Database) | Out-Null

$venvPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (Test-Path $venvPython) {
    $python = $venvPython
} else {
    Write-Warning ".venv not found -- falling back to system python"
    $python = "python"
}

Write-Host "Starting Hermeneut interactive CLI..." -ForegroundColor Cyan
Write-Host "Database: $Database" -ForegroundColor DarkGray
Write-Host "Python: $python" -ForegroundColor DarkGray
& $python -m hermeneut --db $Database interactive
if ($LASTEXITCODE -ne 0) {
    Write-Host "Hermeneut exited with code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
