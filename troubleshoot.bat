@echo off
title Student Library - Troubleshooting
color 0E

echo ================================================
echo    Student Library - Troubleshooting Guide
echo ================================================
echo.

echo Checking system requirements...
echo.

echo 1. Node.js Version:
node --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found - Please install from https://nodejs.org/
) else (
    echo ✅ Node.js is installed
)

echo.
echo 2. NPM Version:
npm --version 2>nul
if %errorlevel% neq 0 (
    echo ❌ NPM not found
) else (
    echo ✅ NPM is installed
)

echo.
echo 3. Checking project structure...
if exist "backend\package.json" (
    echo ✅ Backend folder found
) else (
    echo ❌ Backend folder missing
)

if exist "frontend\package.json" (
    echo ✅ Frontend folder found
) else (
    echo ❌ Frontend folder missing
)

echo.
echo 4. Checking for node_modules...
if exist "backend\node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ⚠️  Backend dependencies need installation
)

if exist "frontend\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  Frontend dependencies need installation
)

echo.
echo 5. Port availability check...
netstat -an | find ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is in use (Frontend)
) else (
    echo ✅ Port 3000 is available
)

netstat -an | find ":5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000 is in use (Backend)
) else (
    echo ✅ Port 5000 is available
)

echo.
echo ================================================
echo    Common Solutions:
echo ================================================
echo.
echo 1. If Node.js is missing:
echo    - Download from https://nodejs.org/
echo    - Install LTS version
echo    - Restart command prompt
echo.
echo 2. If dependencies are missing:
echo    - Run: npm install in backend folder
echo    - Run: npm install in frontend folder
echo.
echo 3. If ports are in use:
echo    - Close other applications using ports 3000/5000
echo    - Or restart your computer
echo.
echo 4. For MongoDB issues:
echo    - The app will run without MongoDB
echo    - Database features won't work
echo    - Use setup-mongodb.bat for MongoDB setup
echo.
pause
