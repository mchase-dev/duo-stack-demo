/**
 * Auth API Endpoint Tests
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import { User, UserRole } from '../../src/models';
import { hashPassword } from '../../src/utils/password';

const app = createApp();

describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe('newuser@example.com');
    expect(response.body.data.user.username).toBe('newuser');
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('should return 400 for invalid email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      })
      .expect(400);
  });

  it('should return 400 for short password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
      })
      .expect(400);
  });

  it('should return 409 for duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123',
      });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        username: 'user2',
        password: 'password123',
      })
      .expect(409);

    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await User.create({
      email: 'login@example.com',
      username: 'loginuser',
      passwordHash: await hashPassword('password123'),
      role: UserRole.User,
      emailConfirmed: true,
    });
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should return 401 for invalid email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should return 401 for invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('should return 400 for missing fields', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
      })
      .expect(400);
  });
});

describe('POST /api/v1/auth/logout', () => {
  let refreshTokenCookie: string;

  beforeEach(async () => {
    // Register and login to get a refresh token cookie
    await request(app).post('/api/v1/auth/register').send({
      email: 'logout@example.com',
      username: 'logoutuser',
      password: 'password123',
    });

    await User.update({ emailConfirmed: true }, { where: { email: 'logout@example.com' } });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'logout@example.com',
      password: 'password123',
    });

    refreshTokenCookie = loginResponse.headers['set-cookie'][0];
  });

  it('should logout successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', refreshTokenCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBe('Logout successful');
  });

  it('should clear refresh token cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', refreshTokenCookie)
      .expect(200);

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('refreshToken=;');
  });
});
