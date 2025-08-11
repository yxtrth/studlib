@echo off
title Student Library - 24/7 Backend Keep-Alive Service

echo =========================================
echo  STUDENT LIBRARY - KEEP BACKEND ALIVE
echo =========================================
echo.
echo This will keep your Render backend alive 24/7
echo by pinging it every 10 minutes.
echo.
echo Press Ctrl+C to stop the service anytime.
echo.

pause

node keep-alive-24-7.js

pause
