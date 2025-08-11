// Test Gmail connection with enhanced configuration
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailConnection() {
  console.log('🔧 Testing Gmail SMTP Connection...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');
  
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    console.log('🧪 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 AUTHENTICATION FIX NEEDED:');
      console.log('1. Enable 2-Factor Authentication on Gmail');
      console.log('2. Generate new App Password at: https://myaccount.google.com/apppasswords');
      console.log('3. Update EMAIL_PASS in .env file with the new App Password');
      console.log('4. Restart server and test again');
    }
    
    return false;
  }
}

testGmailConnection();
