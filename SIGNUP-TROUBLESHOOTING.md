# Student Library - Signup Troubleshooting Guide

## Quick Steps to Test Signup

### 1. Start Backend Server
```bash
cd "c:\Users\KANTIKA TIWARI\Desktop\student lib\backend"
npm run dev
```

**Expected output:**
- ✓ Dependencies loaded successfully
- ✓ All routes loaded
- ✓ Server running on port 5000
- ✓ Student Library Backend Server is ready!

### 2. Start Frontend Server
```bash
cd "c:\Users\KANTIKA TIWARI\Desktop\student lib\frontend"
npm start
```

**Expected output:**
- Frontend should start on http://localhost:3000

### 3. Test Signup Process

1. Open browser to: http://localhost:3000
2. Click "Sign Up" or go to: http://localhost:3000/register
3. Fill out the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Student ID: TEST001
   - Department: Computer Science

### 4. Check for Errors

**Frontend Errors (Browser Console):**
- Press F12 → Console tab
- Look for any red errors

**Backend Errors (Terminal):**
- Check the backend terminal for any error messages

**Network Errors (Browser Network Tab):**
- Press F12 → Network tab
- Try to register and check if the POST request to `/api/auth/register` is being made

### 5. Common Issues & Solutions

**Issue 1: "Cannot connect to backend"**
- Solution: Make sure backend server is running on port 5000
- Test: Open http://localhost:5000/api/health in browser

**Issue 2: "CORS Error"**
- Solution: Backend CORS is configured for localhost:3000
- Check frontend is running on port 3000

**Issue 3: "Database connection failed"**
- Solution: MongoDB Atlas should connect automatically
- Backend will show database status in logs

**Issue 4: "Registration endpoint not found"**
- Solution: Check backend logs for route loading messages
- Verify all auth routes are loaded successfully

### 6. Test Backend Directly

Open the test file in browser:
file:///c:/Users/KANTIKA%20TIWARI/Desktop/student%20lib/test-backend.html

This will test:
- Backend connection
- Health endpoint
- Registration endpoint

### 7. Manual API Test

Use browser console or Postman to test:

```javascript
// Test in browser console (with backend running)
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    studentId: 'TEST001',
    department: 'Computer Science'
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

### 8. If Nothing Works

1. Delete node_modules in both frontend and backend
2. Run `npm install` in both directories
3. Restart both servers
4. Clear browser cache (Ctrl+Shift+Delete)

Let me know what specific error messages you see!
