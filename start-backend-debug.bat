@echo off
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking NPM installation...
npm --version
if %errorlevel% neq 0 (
    echo Error: NPM is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing backend dependencies (this may take a moment)...
cd backend
npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
echo Note: MongoDB connection may fail if MongoDB is not installed locally
echo The server will still start but database features won't work
echo.
npm run dev
pause
