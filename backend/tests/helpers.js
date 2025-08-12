const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const UserModel = require('../models/user.model');

/**
 * Create a test user in the database
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user document
 */
async function createTestUser(userData = global.testData.validUser) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await User.create({
    ...userData,
    password: hashedPassword
  });
  return user;
}

/**
 * Generate auth tokens for a user
 * @param {Object} user - User document
 * @returns {Promise<Object>} Access and refresh tokens
 */
async function generateAuthTokens(user) {
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

  return { accessToken, refreshToken };
}

/**
 * Setup a test user with auth tokens
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} User and tokens
 */
async function setupTestUserWithTokens(userData = global.testData.validUser) {
  const user = await createTestUser(userData);
  const tokens = await generateAuthTokens(user);
  return { user, tokens };
}

/**
 * Create auth header with bearer token
 * @param {string} token - JWT token
 * @returns {Object} Headers object with Authorization
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  createTestUser,
  generateAuthTokens,
  setupTestUserWithTokens,
  authHeader
};
