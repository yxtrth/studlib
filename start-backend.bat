@echo off
echo Installing dependencies...
cd backend
npm install
echo.
echo Starting backend server...
echo Note: MongoDB connection may fail, but server will still run
npm run dev
pause
