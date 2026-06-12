const MAX_SLUG_LENGTH = 40;

/**
 * Generate subdomain slug from business name (Q36 step 2).
 * Aligned with firestore-schema.md §5.1 slug format.
 */
export function slugifyBusinessName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    return '';
  }

  return slug.slice(0, MAX_SLUG_LENGTH);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.length <= MAX_SLUG_LENGTH;
}
