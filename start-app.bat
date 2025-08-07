@echo off
title Student Library - Complete Startup
color 0A

echo ================================================
echo    Student Library Web Application Startup
echo ================================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo Step 2: Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

echo.
echo Step 3: Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo Step 4: Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "echo Starting Backend Server... && npm run dev"

echo.
echo Step 5: Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Step 6: Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "echo Starting Frontend Server... && npm start"

echo.
echo ================================================
echo    🎉 Startup Complete!
echo ================================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:3000
echo.
echo The frontend should open automatically in your browser.
echo Both servers are running in separate windows.
echo.
echo Press any key to close this window...
pause >nul
