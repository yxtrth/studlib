const nodemailer = require('nodemailer');

// Create transporter with enhanced configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Student Library Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Welcome to Student Library!</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057;">Hello ${name},</h3>
            <p style="color: #6c757d; line-height: 1.6;">
              Thank you for registering with Student Library! To complete your registration and start accessing our resources, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #007bff; color: white; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
                ${otp}
              </div>
              <p style="color: #6c757d; margin-top: 10px; font-size: 14px;">
                This OTP will expire in 10 minutes
              </p>
            </div>
            <p style="color: #6c757d; line-height: 1.6;">
              If you didn't create an account with us, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            <p>Student Library - Your Gateway to Knowledge</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Student Library! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745; text-align: center;">🎉 Welcome to Student Library!</h2>
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724;">Congratulations ${name}!</h3>
            <p style="color: #155724; line-height: 1.6;">
              Your email has been successfully verified! You now have full access to all Student Library features:
            </p>
            <ul style="color: #155724; line-height: 1.8;">
              <li>📚 Access thousands of educational books</li>
              <li>🎥 Watch educational videos</li>
              <li>💬 Join the community chat</li>
              <li>⭐ Rate and favorite content</li>
              <li>👥 Connect with other students</li>
            </ul>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Start Exploring
              </a>
            </div>
          </div>
          <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            <p>Happy Learning! 📖</p>
            <p>Student Library Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};
