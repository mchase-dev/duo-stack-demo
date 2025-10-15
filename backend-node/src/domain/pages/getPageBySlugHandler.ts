import { Page, User, UserRole } from '../../models';

/**
 * Get Page By Slug Handler
 * Retrieves a page by its slug
 * Public users can only access published pages, Superusers can access any page
 */
export async function getPageBySlugHandler(slug: string, userRole?: UserRole) {
  const isSuperuser = userRole === UserRole.Superuser;

  // Find page by slug with creator information (matching .NET)
  const page = await Page.findOne({
    where: { slug },
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'emailConfirmed', 'username', 'firstName', 'lastName', 'phoneNumber', 'avatarUrl', 'bio', 'role', 'createdAt', 'updatedAt'],
      },
    ],
  });

  if (!page) {
    throw new Error('Page not found');
  }

  // Check if user can access unpublished pages
  if (!page.isPublished && !isSuperuser) {
    throw new Error('Page not found');
  }

  return page;
}
