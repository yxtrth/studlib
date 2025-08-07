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
echo Installing frontend dependencies (this may take a moment)...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting frontend development server...
echo This will automatically open your browser to http://localhost:3000
echo.
npm start
pause
