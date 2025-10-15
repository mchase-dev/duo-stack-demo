/**
 * JWT Utilities Tests
 */

import { generateAccessToken, generateRefreshToken, verifyToken, JwtPayload } from '../../src/utils/jwt';
import { UserRole } from '../../src/models';

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should create a valid access token', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };

      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };

      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe(UserRole.User);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => verifyToken('not.a.jwt')).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };
      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken (refresh)', () => {
    it('should verify a valid refresh token', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };
      const token = generateRefreshToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('user-123');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });

  describe('token expiration', () => {
    it('access token should have expiration', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };

      const token = generateAccessToken(payload);
      const decoded = verifyToken(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp > decoded.iat).toBe(true);
    });

    it('refresh token should have expiration', () => {
      const payload: JwtPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.User,
      };
      const token = generateRefreshToken(payload);
      const decoded = verifyToken(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp > decoded.iat).toBe(true);
    });
  });
});
