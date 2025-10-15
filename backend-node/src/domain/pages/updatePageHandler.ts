import { Page } from '../../models';

/**
 * Update Page Handler
 * Updates a CMS page (Superuser only)
 * Updates page content, title, slug, or publish status
 */
export async function updatePageHandler(
  pageId: string,
  updateData: {
    title?: string;
    slug?: string;
    content?: string;
    isPublished?: boolean;
  }
) {
  const { title, slug: providedSlug, content, isPublished } = updateData;

  // Find page by ID
  const page = await Page.findByPk(pageId);

  if (!page) {
    throw new Error('Page not found');
  }

  // Prepare update data
  const updates: any = {};

  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (isPublished !== undefined) updates.isPublished = isPublished;

  // If slug is being updated, ensure it's unique
  if (providedSlug !== undefined) {
    let baseSlug = providedSlug;
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique (excluding current page)
    while (true) {
      const existing = await Page.findOne({ where: { slug } });
      if (!existing || existing.id === pageId) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updates.slug = slug;
  }

  // Update page
  await page.update(updates);

  // Return updated page
  const updatedPage = await Page.findByPk(pageId);

  return updatedPage;
}
