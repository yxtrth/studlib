@echo off
echo ============================================
echo    Student Library - MongoDB Setup Guide
echo ============================================
echo.
echo You have 3 options to get MongoDB running:
echo.
echo 1. EASY: Use MongoDB Atlas (Cloud - Free)
echo    - Go to https://www.mongodb.com/atlas
echo    - Create a free account
echo    - Create a free cluster
echo    - Get connection string and update .env file
echo.
echo 2. MEDIUM: Install MongoDB Community Edition
echo    - Go to https://www.mongodb.com/try/download/community
echo    - Download and install MongoDB
echo    - Start MongoDB service
echo.
echo 3. QUICK TEST: Use the app without database
echo    - The app will run but won't save data
echo    - Authentication and features will be limited
echo.
echo ============================================
echo.
pause

echo.
echo Opening MongoDB Atlas website...
start https://www.mongodb.com/atlas
echo.
echo Opening MongoDB Community download page...
start https://www.mongodb.com/try/download/community
echo.
echo Please follow the setup instructions and update the MONGODB_URI in backend/.env
echo.
pause
