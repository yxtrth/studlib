@echo off
echo.
echo ================================
echo   Starting Registration Test Server
echo ================================
echo.

cd /d "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"

echo Current directory: %CD%
echo.

echo Checking if Node.js is available...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo.
echo Starting registration test server...
echo.
node registration-test-server.js

pause
