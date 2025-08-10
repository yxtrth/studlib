@echo off
echo.
echo ================================
echo   Starting Fixed Backend Server
echo ================================
echo.

cd /d "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"

echo Stopping any existing Node processes...
taskkill /f /im node.exe 2>nul

echo.
echo Starting server with FormData support...
echo.
node server.js

pause
