# Full desktop build pipeline
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot/..

Write-Host "=== Building Hermeneut Agent Desktop ===" -ForegroundColor Cyan

# Step 1: Build Python sidecar
Write-Host "`n[1/3] Building Python sidecar..." -ForegroundColor Cyan
& "$PSScriptRoot/build-sidecar.ps1"

# Step 2: Install npm dependencies and build frontend
Write-Host "`n[2/3] Building frontend..." -ForegroundColor Cyan
Set-Location web
npm ci
npm run build:tauri
Set-Location ..

# Step 3: Build Tauri application
Write-Host "`n[3/3] Building Tauri application..." -ForegroundColor Cyan
cargo tauri build --config src-tauri/tauri.conf.json

Write-Host "`n=== Build Complete ===" -ForegroundColor Green
Write-Host "Installer location: src-tauri/target/release/bundle/" -ForegroundColor Green
