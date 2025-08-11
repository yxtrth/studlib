@echo off
echo 🔍 Student Library - Connection Diagnostics
echo ==========================================
echo.

echo 📍 Testing network connectivity...
ping google.com -n 1 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Internet connection: OK
) else (
    echo ❌ Internet connection: FAILED
    echo 💡 Check your internet connection
)
echo.

echo 🔍 Testing local server ports...
netstat -an | findstr ":5003" >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Port 5003: In use (server might be running)
) else (
    echo ⚪ Port 5003: Available
)
echo.

echo 🔍 Testing MongoDB Atlas connection...
cd /d "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"

if exist "node_modules" (
    echo ✅ Dependencies: Installed
) else (
    echo ❌ Dependencies: Missing
    echo 💡 Run: npm install
    goto :end
)

echo.
echo 🧪 Running connection test...
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔗 Connecting to:', process.env.MONGODB_URI ? 'MongoDB Atlas' : 'No DB URL');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas: Connected successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ MongoDB Atlas: Connection failed');
    console.log('💡 Error:', err.message);
    process.exit(1);
  });

setTimeout(() => {
  console.log('⏰ Connection timeout after 10 seconds');
  process.exit(1);
}, 10000);
"

echo.
echo 🔍 Testing email service...
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('📧 Email User:', process.env.EMAIL_USER ? 'Configured' : 'Missing');
console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? 'Configured' : 'Missing');

transporter.verify()
  .then(() => {
    console.log('✅ Gmail SMTP: Connection verified');
  })
  .catch((err) => {
    console.log('❌ Gmail SMTP: Verification failed');
    console.log('💡 Error:', err.message);
  });
"

:end
echo.
echo 🎯 Next steps:
echo 1. If all tests pass, run: start-server.bat
echo 2. Open browser to: http://localhost:5003/api/health
echo 3. Check server logs for any errors
echo.
pause
