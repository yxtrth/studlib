// Test registration and OTP email
const express = require('express');
const app = express();
require('dotenv').config();

// Import the email service directly
const { sendOTPEmail, generateOTP } = require('./utils/emailService');

async function testOTPFlow() {
  console.log('🧪 Testing OTP Email Flow...');
  
  try {
    // Generate test OTP
    const testOTP = generateOTP();
    console.log('Generated OTP:', testOTP);
    
    // Test sending email (replace with your test email)
    const testEmail = 'libyatharth@gmail.com'; // Using the configured email for testing
    const testName = 'Test User';
    
    console.log(`📧 Sending OTP to: ${testEmail}`);
    const emailSent = await sendOTPEmail(testEmail, testOTP, testName);
    
    if (emailSent) {
      console.log('✅ OTP email sent successfully!');
      console.log(`📬 Check ${testEmail} for the verification code: ${testOTP}`);
    } else {
      console.log('❌ Failed to send OTP email');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOTPFlow();
