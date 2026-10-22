@echo off
title Campus Recruitment Portal - Launcher
color 0b

echo =====================================================================
echo                    CAMPUS RECRUITMENT PORTAL
echo =====================================================================
echo.

:: Switch to the directory where this batch file is located
cd /d "%~dp0"

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org and re-run this script.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [1/6] Node.js detected: %NODE_VER%

:: 2. Check MySQL / MariaDB (Port 3306)
echo [2/6] Checking MySQL service on port 3306...
netstat -ano | findstr :3306 >nul 2>nul
if %errorlevel% neq 0 (
    echo       MySQL is not running on port 3306.
    if exist "C:\xampp\mysql_start.bat" (
        echo       Found XAMPP MySQL. Starting MySQL service...
        start "" "C:\xampp\mysql_start.bat"
        ping 127.0.0.1 -n 4 >nul
    ) else (
        echo       [NOTE] If you have MySQL or XAMPP installed, please make sure MySQL is started.
    )
) else (
    echo       MySQL service is active on port 3306.
)

:: 3. Check / Create backend .env configuration
if not exist "server\.env" (
    echo [3/6] Setting up server\.env configuration...
    copy "server\.env.example" "server\.env" >nul
    echo       Created server\.env from .env.example
) else (
    echo [3/6] Backend .env configuration verified.
)

:: 4. Install backend dependencies if missing
if not exist "server\node_modules" (
    echo [4/6] Installing backend dependencies...
    cd /d "%~dp0server"
    call npm install
    cd /d "%~dp0"
) else (
    echo [4/6] Backend dependencies ready.
)

echo       Verifying database and tables...
cd /d "%~dp0server"
call node src/init-db.js
cd /d "%~dp0"

:: 5. Install frontend dependencies if missing
if not exist "client\node_modules" (
    echo [5/6] Installing frontend dependencies...
    cd /d "%~dp0client"
    call npm install
    cd /d "%~dp0"
) else (
    echo [5/6] Frontend dependencies ready.
)

:: 6. Launch Backend and Frontend
echo [6/6] Starting Backend API and Frontend Dev Server...
echo.

start "Campus Recruitment Backend (Port 5000)" cmd /k "title Backend (Port 5000) && cd /d ""%~dp0server"" && npm run dev"
start "Campus Recruitment Frontend (Port 5173)" cmd /k "title Frontend (Port 5173) && cd /d ""%~dp0client"" && npm run dev"

echo Waiting for servers to start...
ping 127.0.0.1 -n 4 >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =====================================================================
echo                    PORTAL IS NOW RUNNING!
echo =====================================================================
echo   Frontend URL:   http://localhost:5173
echo   Backend API:    http://localhost:5000/api
echo   Health Check:   http://localhost:5000/api/health
echo.
echo   Demo Roles available on login page:
echo     * Student:           student@example.com
echo     * Recruiter:         hr@technova.example
echo     * Placement Officer: officer@example.com
echo.
echo   To stop the application, close the two opened command windows
echo   or run stop.bat.
echo =====================================================================
echo.
pause
