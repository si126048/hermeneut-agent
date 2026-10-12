@echo off
title Hermeneut Agent - Desktop Dev
echo ============================================
echo   Hermeneut Agent - Desktop Development
echo ============================================
echo.

:: Check if backend is already running
curl -s http://127.0.0.1:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend already running on :8000
) else (
    echo [..] Starting backend...
    start "Hermeneut Backend" cmd /c "cd /d %~dp0 && uvicorn hermeneut.api:app --host 127.0.0.1 --port 8000"
    timeout /t 3 /nobreak >nul
)

:: Launch Tauri dev
echo [..] Starting Tauri desktop...
echo.
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
cargo tauri dev
