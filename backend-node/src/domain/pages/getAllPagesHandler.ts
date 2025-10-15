import { Page, User, UserRole } from '../../models';

/**
 * Get All Pages Handler
 * Retrieves all pages
 * Public users see only published pages, Superusers see all pages
 */
export async function getAllPagesHandler(userRole?: UserRole) {
  const isSuperuser = userRole === UserRole.Superuser;

  // Build where clause
  const whereClause: any = {};

  // Non-superusers can only see published pages
  if (!isSuperuser) {
    whereClause.isPublished = true;
  }

  // Get all pages with creator information (matching .NET)
  const pages = await Page.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'emailConfirmed', 'username', 'firstName', 'lastName', 'phoneNumber', 'avatarUrl', 'bio', 'role', 'createdAt', 'updatedAt'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  // Return direct array (matching .NET)
  return pages;
}
