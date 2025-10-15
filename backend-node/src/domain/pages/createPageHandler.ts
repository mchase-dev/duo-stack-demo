import { Page } from '../../models';

/**
 * Generate slug from title
 * Converts page title to URL-friendly slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Create Page Handler
 * Creates a new CMS page (Superuser only)
 * Auto-generates unique slug from title if not provided
 */
export async function createPageHandler(
  userId: string,
  pageData: {
    title: string;
    slug?: string;
    content: string;
    isPublished?: boolean;
  }
) {
  const { title, slug: providedSlug, content, isPublished } = pageData;

  // Use provided slug or generate from title
  let baseSlug = providedSlug || generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (await Page.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create page
  const page = await Page.create({
    title,
    slug,
    content,
    isPublished: isPublished !== undefined ? isPublished : false,
    createdBy: userId,
  });

  return page;
}
