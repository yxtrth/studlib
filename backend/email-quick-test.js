// Quick email test
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const testOTP = '123456';

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'Test OTP - Student Library',
  html: `<h2>Your OTP: ${testOTP}</h2><p>If you received this, OTP emails are working! ✅</p>`
}, (error, info) => {
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📧 Check your email for OTP:', testOTP);
  }
  process.exit();
});
