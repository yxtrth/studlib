@echo off
echo 🚀 Starting Student Library Backend Server...
echo 📍 Server will run on: http://localhost:5003
echo 🔗 Health check: http://localhost:5003/api/health
echo.

cd /d "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"

echo 📁 Current directory: %CD%
echo.

echo 🔍 Checking dependencies...
if not exist "node_modules" (
    echo ⚠️  node_modules not found - installing...
    npm install
    echo.
)

echo 🌐 Starting server...
echo 💾 Database: MongoDB Atlas
echo 📧 Email: Gmail SMTP
echo ⏹️  Press Ctrl+C to stop
echo.

echo � Starting complete server with database and email...
node complete-server.js
