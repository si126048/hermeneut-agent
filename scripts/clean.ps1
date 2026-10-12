# Clean all build artifacts
# Usage: .\scripts\clean.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Cleaning build artifacts..." -ForegroundColor Cyan

# Rust/Tauri
Remove-Item -Recurse -Force "src-tauri\target"
Remove-Item -Recurse -Force "src-tauri\bin"
Remove-Item -Recurse -Force "src-tauri\gen"

# PyInstaller
Remove-Item -Recurse -Force "build"
Remove-Item -Force "*.manifest"

# Python
Remove-Item -Recurse -Force "__pycache__"
Get-ChildItem -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
Remove-Item -Recurse -Force ".pytest_cache"
Remove-Item -Recurse -Force ".ruff_cache"
Remove-Item -Recurse -Force ".test-tmp"
Remove-Item -Recurse -Force "*.egg-info"

# Frontend
Remove-Item -Recurse -Force "web\node_modules"

# Runtime data
Remove-Item -Recurse -Force "data"
Remove-Item -Recurse -Force "tmp"
Remove-Item -Recurse -Force "output"
Remove-Item -Recurse -Force ".api"

Write-Host "Done. Source code preserved." -ForegroundColor Green
Write-Host "To rebuild desktop app:" -ForegroundColor Yellow
Write-Host "  1. pip install -e ." -ForegroundColor White
Write-Host "  2. cd web && npm install" -ForegroundColor White
Write-Host "  3. .\scripts\build-desktop.ps1" -ForegroundColor White
