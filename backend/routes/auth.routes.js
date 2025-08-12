const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

// Register validation
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Invalid role')
];

const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

// Resend OTP endpoint
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { tempToken } = req.body;

    // Verify temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.verificationOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send new OTP email
    await sendEmail({
      to: user.email,
      subject: 'New Email Verification OTP',
      text: `Your new OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`
    });

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    next(error);
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { otp, tempToken } = req.body;

    // Verify temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP is expired
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Verify OTP
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Email verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
});

// Register route
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password, role = 'student' } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      verificationOTP: otp,
      otpExpires
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`
    });

    // Generate temporary token for verification process
    const tempToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Send response with verification required status
    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      tempToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Login route
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP and send verification email
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      
      user.verificationOTP = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send verification email
      await sendEmail({
        to: user.email,
        subject: 'Email Verification OTP',
        text: `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`
      });

      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'A new verification code has been sent to your email'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken // Only for testing purposes
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token route
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Missing refresh token' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Set new refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(error);
  }
});

// Logout route
router.post('/logout', auth, (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
