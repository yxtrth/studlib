const request = require('supertest');
const app = require('../app');
const { createTestUser, authHeader } = require('./helpers');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should create a new user and return tokens', async () => {
      const userData = global.testData.validUser;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });

      // Verify user was created in DB
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.password).not.toBe(userData.password);
    });

    it('should return 400 for duplicate email', async () => {
      const userData = global.testData.validUser;
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        ...global.testData.validUser,
        email: 'invalid-email'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/email/i);
    });

    it('should return 400 for password less than 8 characters', async () => {
      const userData = {
        ...global.testData.validUser,
        password: 'short'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/password/i);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return tokens', async () => {
      const userData = global.testData.validUser;
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const userData = global.testData.validUser;
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/user not found/i);
    });

    it('should handle case-sensitive email comparison', async () => {
      const userData = global.testData.validUser;
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email.toUpperCase(),
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new access token with valid refresh token', async () => {
      const userData = global.testData.validUser;
      const user = await createTestUser(userData);
      
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid.token.here']);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/missing.*token/i);
    });

    it('should return 401 for expired refresh token', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.4Adcj3UFYzPUVaVF43FmMab6RmQaGZ8enVfGg3J8mJE';
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${expiredToken}`]);

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/expired/i);
    });

    it('should return new refresh token along with access token', async () => {
      const userData = global.testData.validUser;
      const user = await createTestUser(userData);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const refreshToken = loginResponse.body.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken/);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout user', async () => {
      const userData = global.testData.validUser;
      const user = await createTestUser(userData);
      
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const accessToken = loginResponse.body.accessToken;

      const response = await request(app)
        .post('/api/auth/logout')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/unauthorized/i);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set(authHeader('invalid.token.here'));

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid.*token/i);
    });

    it('should clear refresh token cookie', async () => {
      const userData = global.testData.validUser;
      const user = await createTestUser(userData);
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const accessToken = loginResponse.body.accessToken;

      const response = await request(app)
        .post('/api/auth/logout')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
    });

    it('should invalidate the refresh token', async () => {
      const userData = global.testData.validUser;
      const user = await createTestUser(userData);
      
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const accessToken = loginResponse.body.accessToken;
      const refreshToken = loginResponse.body.refreshToken;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set(authHeader(accessToken));

      // Try to use the refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(refreshResponse.status).toBe(401);
      expect(refreshResponse.body.error).toMatch(/invalid.*token/i);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit repeated login attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        attempts.push(response.status);
      }

      // First 5 attempts should return 401, 6th should be rate limited
      expect(attempts.slice(0, 5)).toEqual(Array(5).fill(401));
      expect(attempts[5]).toBe(429);
    });
  });
});
