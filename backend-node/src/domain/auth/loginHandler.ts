import { User, RefreshToken } from '../../models';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  JwtPayload,
} from '../../utils/jwt';

/**
 * Login Handler
 * Handles user authentication with email/password
 */
export async function loginHandler(email: string, password: string) {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password with hash
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT payload
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate access token
  const accessToken = generateAccessToken(payload);

  // Generate and store refresh token
  const refreshToken = generateRefreshToken(payload);
  const tokenHash = await hashPassword(refreshToken); // Hash refresh token before storing

  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: getRefreshTokenExpiration(),
    revoked: false,
  });

  // Return user data and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailConfirmed: user.emailConfirmed,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
}
