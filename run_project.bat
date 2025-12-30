@echo off
echo ===================================================
echo       TechHorizon - Automatic Launcher
echo ===================================================

echo 1. Starting Backend Server (Python)...
start "TechHorizon Backend" cmd /k "cd backend && python -m uvicorn main:app --reload"

echo 2. Starting Frontend Server (React)...
start "TechHorizon Frontend" cmd /k "cd frontend && npm run dev"

echo 3. Waiting for servers to initialize...
timeout /t 5 >nul

echo 4. Opening Browser...
start http://localhost:5173

echo ===================================================
echo                 SUCCESS!
echo ===================================================
echo Backend running at: http://localhost:8000
echo Frontend running at: http://localhost:5173
echo.
echo NOTE: Do not close the two pop-up terminal windows.
echo They are keeping your website alive.
echo.
pause
