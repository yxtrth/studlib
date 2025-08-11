// Debug form submission issue
// The backend expects: name, email, password
// The backend logs: 
// - Registration attempt: {email}
// - Form data received: {Object.keys(req.body)}
// 
// If you're getting 400 errors, check the browser console for:
// 1. Are all form fields filled?
// 2. Check network tab for request payload
// 3. Verify the FormData contents

// Test in browser console:
const testFormData = new FormData();
testFormData.append('name', 'Test User');
testFormData.append('email', 'test@example.com');
testFormData.append('password', 'password123');
testFormData.append('studentId', 'STU001');
testFormData.append('department', 'Computer Science');
testFormData.append('bio', 'Test bio');

// Check FormData contents
for (let [key, value] of testFormData.entries()) {
  console.log(key, value);
}

// Common issues:
// 1. Empty form fields (name, email, password undefined)
// 2. Password less than 6 characters
// 3. Invalid email format (frontend validation should catch this)
// 4. Network issues

// Debug steps:
// 1. Open browser dev tools
// 2. Go to Network tab
// 3. Try to register
// 4. Check the POST request to /api/auth/register
// 5. Look at Request Payload
// 6. Check Response for exact error message
