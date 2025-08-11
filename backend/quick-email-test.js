// Simple email configuration test
require('dotenv').config();

console.log('📧 Email Configuration Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

// Test basic nodemailer
const nodemailer = require('nodemailer');

const testTransporter = () => {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log('✅ Transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating transporter:', error.message);
    return null;
  }
};

testTransporter();
