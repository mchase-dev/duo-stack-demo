import { Page } from '../../models';

/**
 * Delete Page Handler
 * Soft deletes a CMS page (Superuser only)
 */
export async function deletePageHandler(pageId: string) {
  // Find page by ID
  const page = await Page.findByPk(pageId);

  if (!page) {
    throw new Error('Page not found');
  }

  // Soft delete page (paranoid mode sets deletedAt timestamp)
  await page.destroy();

  return { message: 'Page deleted successfully' };
}
