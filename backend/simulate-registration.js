// Final test - simulate user registration
require('dotenv').config();
const { sendOTPEmail, generateOTP } = require('./utils/emailService');

async function simulateUserRegistration() {
  console.log('🎯 SIMULATING USER REGISTRATION FLOW');
  console.log('=====================================');
  
  // Simulate new user data
  const newUser = {
    name: 'John Doe',
    email: 'libyatharth@gmail.com', // Using your email for testing
    password: 'password123'
  };
  
  console.log(`👤 New user registering: ${newUser.name}`);
  console.log(`📧 Email address: ${newUser.email}`);
  
  try {
    // Step 1: Generate OTP (as done in registration route)
    const otp = generateOTP();
    console.log(`🔢 Generated OTP: ${otp}`);
    
    // Step 2: Send OTP email (as done in registration route)
    console.log('📤 Sending verification email...');
    const emailSent = await sendOTPEmail(newUser.email, otp, newUser.name);
    
    if (emailSent) {
      console.log('\n✅ REGISTRATION SIMULATION SUCCESSFUL!');
      console.log('======================================');
      console.log('✉️  Verification email sent successfully');
      console.log(`📧 Sent to: ${newUser.email}`);
      console.log(`🔢 OTP Code: ${otp}`);
      console.log('⏰ OTP expires in 10 minutes');
      console.log('\n🎉 User can now verify their account!');
      console.log('\n📋 Next steps in real app:');
      console.log('1. User receives email with OTP');
      console.log('2. User enters OTP in verification form');
      console.log('3. Backend validates OTP');
      console.log('4. Account gets activated');
      console.log('5. User can access the chat system');
    } else {
      console.log('\n❌ Registration failed - could not send email');
    }
    
  } catch (error) {
    console.error('\n❌ Registration simulation failed:', error.message);
  }
}

simulateUserRegistration();
