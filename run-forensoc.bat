@echo off
:: ============================================================
:: ForenSOC — One-Click Windows Development Launcher
:: ============================================================
:: Starts backend (FastAPI), automation watcher, and frontend
:: (React/Vite) in separate windows.
:: Usage: Double-click this file from the ForenSOC root folder.
:: ============================================================

title ForenSOC Launcher
color 0A
echo.
echo  ============================================================
echo   ^|  ForenSOC — Advanced SOC ^& Digital Forensics Platform  ^|
echo  ============================================================
echo.

:: ── Locate project root ──────────────────────────────────────
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend-react"

:: ── Check Python ─────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org ^(3.10+^)
    pause & exit /b 1
)

:: ── Check Node.js ─────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org ^(18+ LTS^)
    pause & exit /b 1
)

:: ── Backend: Create venv if missing ──────────────────────────
if not exist "%BACKEND%\venv\" (
    echo [1/5] Creating Python virtual environment...
    python -m venv "%BACKEND%\venv"
)

:: ── Backend: Install requirements ────────────────────────────
echo [2/5] Installing backend dependencies...
call "%BACKEND%\venv\Scripts\activate.bat"
pip install -r "%BACKEND%\requirements.txt" -q

:: ── Backend: Copy .env if missing ────────────────────────────
if not exist "%BACKEND%\.env" (
    echo [3/5] Creating backend .env from template...
    copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
    echo        ^> Review backend\.env and update SECRET_KEY before production use.
) else (
    echo [3/5] Backend .env already exists — skipping copy.
)

:: ── Frontend: Install node_modules if missing ─────────────────
if not exist "%FRONTEND%\node_modules\" (
    echo [4/5] Installing frontend dependencies ^(npm install^)...
    cd /d "%FRONTEND%"
    call npm install
) else (
    echo [4/5] node_modules present — skipping npm install.
)

:: ── Launch Services ───────────────────────────────────────────
echo [5/5] Starting all services...

:: FastAPI Backend
start "ForenSOC Backend (API)" cmd /k "title ForenSOC Backend && cd /d "%BACKEND%" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Automation Service (folder watcher + Windows event poller)
timeout /t 3 /nobreak >nul
start "ForenSOC Automation" cmd /k "title ForenSOC Automation Watcher && cd /d "%BACKEND%" && call venv\Scripts\activate.bat && python automation_service.py"

:: React Frontend
timeout /t 2 /nobreak >nul
start "ForenSOC Frontend (React)" cmd /k "title ForenSOC Frontend && cd /d "%FRONTEND%" && npm run dev"

:: ── Done ──────────────────────────────────────────────────────
echo.
echo  ============================================================
echo   Services starting in separate windows. Please wait ~10s.
echo  ============================================================
echo.
echo   Web UI      : http://localhost:3000
echo   API Docs    : http://localhost:8000/api/docs
echo   API Health  : http://localhost:8000/health
echo.
echo   Default Login: admin / ForenSOC@2024!
echo   ^> Change your password immediately in Settings.
echo.
echo  Close this window or press any key to exit the launcher.
echo  ^(The three service windows will keep running^)
echo.
pause
