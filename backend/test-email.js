// Test script to verify email OTP functionality
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testOTPEmail() {
  console.log('🧪 Testing OTP Email System...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? 'Set ✅' : 'Not Set ❌');
  
  // Generate test OTP
  const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🔢 Generated OTP:', testOTP);
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Test sending email
  console.log('📤 Sending test OTP email...');
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to same email for testing
      subject: 'TEST: Student Library OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">🧪 TEST EMAIL</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057;">Hello Test User!</h3>
            <p style="color: #6c757d; line-height: 1.6;">
              This is a test email to verify that OTP sending is working correctly.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
                ${testOTP}
              </div>
              <p style="color: #6c757d; margin-top: 10px; font-size: 14px;">
                Test OTP - This will expire in 10 minutes
              </p>
            </div>
            <p style="color: #6c757d; line-height: 1.6;">
              If you received this email, the OTP system is working! ✅
            </p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ SUCCESS: OTP email sent successfully!');
    console.log('📧 Check your email:', process.env.EMAIL_USER);
    console.log('🔢 Expected OTP:', testOTP);
    console.log('📨 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ ERROR sending email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('🔧 SOLUTION: Check your Gmail App Password');
      console.log('   1. Go to Google Account settings');
      console.log('   2. Security → 2-Step Verification');
      console.log('   3. App passwords → Generate new password');
      console.log('   4. Update EMAIL_PASS in .env file');
    }
  }
}

testOTPEmail();
