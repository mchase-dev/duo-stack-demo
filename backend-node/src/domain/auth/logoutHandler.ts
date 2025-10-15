import { RefreshToken } from '../../models';
import { comparePassword } from '../../utils/password';
import { verifyToken } from '../../utils/jwt';

/**
 * Logout Handler
 * Handles user logout by revoking refresh tokens
 */
export async function logoutHandler(refreshToken: string) {
  try {
    // Verify the token to get user ID
    const payload = verifyToken(refreshToken);

    // Find all non-revoked refresh tokens for this user
    const storedTokens = await RefreshToken.findAll({
      where: {
        userId: payload.userId,
        revoked: false,
      },
    });

    // Find and revoke the matching token
    for (const storedToken of storedTokens) {
      const isMatch = await comparePassword(refreshToken, storedToken.tokenHash);
      if (isMatch) {
        await storedToken.update({ revoked: true });
        return { message: 'Logout successful' };
      }
    }

    throw new Error('Refresh token not found');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
    throw new Error('Logout failed');
  }
}
