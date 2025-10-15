import fs from 'fs';
import path from 'path';
import { User } from '../../models';

/**
 * Upload Avatar Handler
 * Handles avatar upload for the authenticated user
 * Note: File upload is handled by multer middleware, this handler processes the uploaded file
 */
export async function uploadAvatarHandler(
  userId: string,
  file: {
    filename: string;
    path: string;
  }
) {
  // Find user by ID
  const user = await User.findByPk(userId);

  if (!user) {
    // Clean up uploaded file if user not found
    fs.unlinkSync(file.path);
    throw new Error('User not found');
  }

  // Delete old avatar file if it exists
  if (user.avatarUrl) {
    const oldAvatarPath = path.join(
      process.env.UPLOAD_DIR || './uploads',
      path.basename(user.avatarUrl)
    );
    if (fs.existsSync(oldAvatarPath)) {
      try {
        fs.unlinkSync(oldAvatarPath);
      } catch (error) {
        // Ignore errors when deleting old avatar
        console.error('Failed to delete old avatar:', error);
      }
    }
  }

  // Construct avatar URL (relative path)
  const avatarUrl = `/uploads/${file.filename}`;

  // Update user with new avatar URL
  await user.update({ avatarUrl });

  // Return updated user without password hash
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  return { avatarUrl, user: updatedUser };
}
