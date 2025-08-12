process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-123';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-123';
process.env.FRONTEND_URL = 'http://localhost:3000';

require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Redis = require('ioredis-mock');

let mongoServer;

// Mock Redis client
jest.mock('ioredis', () => require('ioredis-mock'));

// Setup in-memory MongoDB for testing
beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  if (!mongoose.connection.db) {
    return; // No connection yet
  }
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error in test cleanup:', error);
    throw error;
  }
});

// Cleanup after tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
    throw error;
  }
});

// Global test data
global.testData = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student'
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
};
