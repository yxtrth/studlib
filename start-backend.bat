@echo off
echo 🚀 Starting Student Library Backend Server...
echo.

echo 📁 Navigating to backend directory...
cd backend

echo 🔍 Installing/updating dependencies...
npm install
echo.

echo 🌐 Starting server with enhanced error logging...
echo 📧 Email service: Gmail SMTP (libyatharth@gmail.com)
echo 💾 Database: MongoDB Atlas
echo 🔗 Health endpoint: http://localhost:5003/api/health
echo.

echo ⏹️  Press Ctrl+C to stop the server
echo.

npm run dev

pause
