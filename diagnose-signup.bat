@echo off
echo 🔍 SIGNUP ISSUE DIAGNOSTIC TOOL
echo ================================
echo.

echo 📋 Checking your current configuration...
echo.

echo 🔧 Frontend API URL Configuration:
type "frontend\.env" | findstr "REACT_APP_API_URL"
echo.

echo 🌐 Testing if backend is running locally...
echo Checking http://localhost:5000/api/health
curl -s http://localhost:5000/api/health 2>nul
if %errorlevel% == 0 (
    echo ✅ Local backend is responding
) else (
    echo ❌ Local backend is NOT running
    echo.
    echo 💡 SOLUTION: Start your backend server:
    echo    cd backend
    echo    npm start
)
echo.

echo 📝 Next steps:
echo 1. If local backend is running: Test signup at http://localhost:3000/register
echo 2. If you want to use deployed backend: Update frontend\.env with your Render URL
echo 3. Check browser console (F12) for error messages when testing signup
echo.

echo 🚀 Quick fixes:
echo - Start backend: cd backend && npm start
echo - Start frontend: cd frontend && npm start  
echo - Or update frontend\.env to use deployed backend URL
echo.

pause
