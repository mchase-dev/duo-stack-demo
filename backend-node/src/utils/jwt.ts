import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

/**
 * JWT payload interface
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate access token (short-lived JWT)
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token (long-lived JWT)
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpirationSeconds(expiresIn: string): number {
  const matches = expiresIn.match(/^(\d+)([smhd])$/);
  if (!matches) {
    throw new Error('Invalid expiration format');
  }

  const value = parseInt(matches[1]);
  const unit = matches[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error('Invalid expiration unit');
  }
}

/**
 * Get refresh token expiration date
 */
export function getRefreshTokenExpiration(): Date {
  const seconds = getTokenExpirationSeconds(REFRESH_TOKEN_EXPIRES_IN);
  return new Date(Date.now() + seconds * 1000);
}
