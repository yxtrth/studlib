@echo off
echo 🔍 QUICK BACKEND TEST
echo ==================
echo.

cd /d "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"

echo Testing backend health...
node health-check.js

echo.
echo ✅ Health check complete!
echo.
echo To start the servers:
echo 1. Backend: npm run dev (in backend folder)
echo 2. Frontend: npm start (in frontend folder)
echo.
pause
