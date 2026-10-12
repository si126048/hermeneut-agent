# Build PyInstaller sidecar
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot/..

Write-Host "Building Python sidecar with PyInstaller..." -ForegroundColor Cyan

# Install PyInstaller if not present
pip install pyinstaller --quiet

# Build the sidecar
pyinstaller hermeneut.spec --distpath src-tauri/bin --workpath desktop-build/pyinstaller-tmp --noconfirm

# Rename for Tauri sidecar convention (Windows)
$platform = "x86_64-pc-windows-msvc"
$src = "src-tauri/bin/hermeneut-backend.exe"
$dst = "src-tauri/bin/hermeneut-backend-$platform.exe"

if (Test-Path $src) {
    Copy-Item $src $dst -Force
    Write-Host "Sidecar built: $dst" -ForegroundColor Green
} else {
    Write-Host "Error: Sidecar build failed" -ForegroundColor Red
    exit 1
}
