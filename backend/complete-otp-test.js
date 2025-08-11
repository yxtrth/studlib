// Complete OTP verification test
require('dotenv').config();
const { sendOTPEmail, generateOTP } = require('./utils/emailService');

async function completeOTPTest() {
  console.log('🎯 COMPLETE OTP VERIFICATION TEST');
  console.log('==================================');
  
  try {
    // Test 1: Generate OTP
    console.log('\n📊 Test 1: OTP Generation');
    const testOTP = generateOTP();
    console.log(`✅ Generated OTP: ${testOTP} (Length: ${testOTP.length})`);
    
    // Test 2: Email Configuration
    console.log('\n📧 Test 2: Email Configuration');
    console.log(`📬 From: ${process.env.EMAIL_USER}`);
    console.log(`🔑 Password Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set'}`);
    console.log(`🏠 SMTP Host: ${process.env.EMAIL_HOST}`);
    console.log(`🚪 SMTP Port: ${process.env.EMAIL_PORT}`);
    
    // Test 3: Send OTP Email
    console.log('\n📤 Test 3: Sending OTP Email');
    const testEmail = process.env.EMAIL_USER; // Send to same email for testing
    const testName = 'Test User';
    
    console.log(`📧 Sending to: ${testEmail}`);
    console.log(`👤 User name: ${testName}`);
    console.log(`🔢 OTP Code: ${testOTP}`);
    console.log('⏳ Sending email...');
    
    const emailSent = await sendOTPEmail(testEmail, testOTP, testName);
    
    if (emailSent) {
      console.log('\n🎉 SUCCESS! OTP Email System is Working!');
      console.log('=========================================');
      console.log(`✅ OTP sent to: ${testEmail}`);
      console.log(`🔢 Verification code: ${testOTP}`);
      console.log('📬 Check your email inbox!');
      console.log('\n🚀 Ready for user registration testing!');
    } else {
      console.log('\n❌ FAILED: Could not send OTP email');
      console.log('Check your Gmail App Password and try again.');
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

completeOTPTest();
