/**
 * Auth Domain Handler Tests
 */

import { registerHandler, loginHandler, refreshTokenHandler } from '../../src/domain/auth';
import { User, UserRole } from '../../src/models';
import { comparePassword } from '../../src/utils/password';

describe('Auth Domain Handlers', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await registerHandler({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.username).toBe('newuser');
      expect(result.user.role).toBe(UserRole.User);
      expect(result.user.emailConfirmed).toBe(false);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should hash the password', async () => {
      await registerHandler({
        email: 'test@example.com',
        username: 'test',
        password: 'password123',
      });

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user).toBeDefined();
      expect(user!.passwordHash).not.toBe('password123');

      const isValid = await comparePassword('password123', user!.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should throw error if email already exists', async () => {
      await registerHandler({
        email: 'duplicate@example.com',
        username: 'user1',
        password: 'password123',
      });

      await expect(
        registerHandler({
          email: 'duplicate@example.com',
          username: 'user2',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should throw error if username already exists', async () => {
      await registerHandler({
        email: 'user1@example.com',
        username: 'duplicate',
        password: 'password123',
      });

      await expect(
        registerHandler({
          email: 'user2@example.com',
          username: 'duplicate',
          password: 'password123',
        })
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await registerHandler({
        email: 'login@example.com',
        username: 'loginuser',
        password: 'password123',
      });

      // Confirm email for login tests
      const user = await User.findOne({ where: { email: 'login@example.com' } });
      await user!.update({ emailConfirmed: true });
    });

    it('should login with email successfully', async () => {
      const result = await loginHandler('login@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error with invalid email', async () => {
      await expect(
        loginHandler('nonexistent@example.com', 'password123')
      ).rejects.toThrow();
    });

    it('should throw error with invalid password', async () => {
      await expect(
        loginHandler('login@example.com', 'wrongpassword')
      ).rejects.toThrow();
    });
  });

  describe('refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const registerResult = await registerHandler({
        email: 'refresh@example.com',
        username: 'refreshuser',
        password: 'password123',
      });

      // Wait 1 second to ensure different iat timestamp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await refreshTokenHandler(registerResult.refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).not.toBe(registerResult.accessToken);
    });

    it('should throw error with invalid refresh token', async () => {
      await expect(refreshTokenHandler('invalid-token')).rejects.toThrow();
    });
  });
});
