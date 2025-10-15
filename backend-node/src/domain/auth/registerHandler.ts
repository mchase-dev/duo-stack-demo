import { User, RefreshToken, UserRole } from '../../models';
import { hashPassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  JwtPayload,
} from '../../utils/jwt';
import { RegisterInput } from '../../types/validation';

/**
 * Register Handler
 * Handles user registration with email/password
 */
export async function registerHandler(data: RegisterInput) {
  // Check if user with email already exists
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Check if username is taken
  const existingUsername = await User.findOne({ where: { username: data.username } });
  if (existingUsername) {
    throw new Error('Username is already taken');
  }

  // Hash the password
  const passwordHash = await hashPassword(data.password);

  // Create new user
  const user = await User.create({
    email: data.email,
    username: data.username,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    emailConfirmed: false,
    role: UserRole.User,
  });

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

  // Return user data (without password hash) and access token
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
