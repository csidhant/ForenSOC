@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo  ForenSOC - start backend + frontend
echo ========================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python not found. Install Python 3.10+ and add it to PATH.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js LTS and add it to PATH.
  pause
  exit /b 1
)

if not exist "backend\venv\Scripts\activate.bat" (
  echo [INFO] Creating Python virtual environment in backend\venv ...
  pushd backend
  python -m venv venv
  if errorlevel 1 (
    echo [ERROR] Failed to create venv.
    popd
    pause
    exit /b 1
  )
  popd
)

echo [INFO] Installing / updating backend dependencies...
pushd backend
call venv\Scripts\activate.bat
python -m pip install -q --upgrade pip
pip install -q -r requirements.txt
if errorlevel 1 (
  echo [ERROR] pip install failed.
  popd
  pause
  exit /b 1
)
popd

if not exist "frontend-react\node_modules\" (
  echo [INFO] Installing frontend dependencies ^(first run may take a few minutes^)...
  pushd frontend-react
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    popd
    pause
    exit /b 1
  )
  popd
) else (
  echo [INFO] frontend-react\node_modules exists — skipping npm install.
  echo          Delete that folder if you need a clean install.
)

if not exist "backend\.env" if exist "backend\.env.example" (
  echo [INFO] Creating backend\.env from .env.example
  copy /Y "backend\.env.example" "backend\.env" >nul
)

if not exist "frontend-react\.env" if exist "frontend-react\.env.example" (
  echo [INFO] Creating frontend-react\.env from .env.example
  copy /Y "frontend-react\.env.example" "frontend-react\.env" >nul
)

echo [INFO] Starting API in a new window: http://127.0.0.1:8000/api/docs
start "ForenSOC API" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo [INFO] Starting Auto-Ingest Watcher (Automatic Folder Monitoring)...
start "ForenSOC Automation" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python automation_service.py"

timeout /t 1 /nobreak >nul

echo [INFO] Starting React app in a new window: http://localhost:3000
start "ForenSOC UI" cmd /k "cd /d "%~dp0frontend-react" && npm run dev"

echo.
echo Done. Three console windows should have opened.
echo   UI:         http://localhost:3000
echo   API:        http://127.0.0.1:8000/api/docs
echo   Automation: Monitoring backend\ingest_drop\
echo.
echo Default dev admin is in backend\.env (change for production).
pause
