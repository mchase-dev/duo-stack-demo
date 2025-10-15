import { User, RefreshToken } from '../../models';
import { comparePassword } from '../../utils/password';
import { generateAccessToken, verifyToken, JwtPayload } from '../../utils/jwt';

/**
 * Refresh Token Handler
 * Handles refreshing access tokens using refresh tokens
 */
export async function refreshTokenHandler(refreshToken: string) {
  try {
    // Verify the refresh token
    const payload = verifyToken(refreshToken);

    // Find all non-revoked refresh tokens for this user
    const storedTokens = await RefreshToken.findAll({
      where: {
        userId: payload.userId,
        revoked: false,
      },
    });

    // Check if any stored token matches the provided refresh token
    let validToken = false;
    for (const storedToken of storedTokens) {
      const isMatch = await comparePassword(refreshToken, storedToken.tokenHash);
      if (isMatch && storedToken.expiresAt > new Date()) {
        validToken = true;
        break;
      }
    }

    if (!validToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user to ensure they still exist
    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new access token with current user data
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(newPayload);

    return { accessToken };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
    throw new Error('Failed to refresh token');
  }
}
