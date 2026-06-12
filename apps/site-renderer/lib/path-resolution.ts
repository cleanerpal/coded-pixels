/**
 * Map App Router catch-all segments to a page slug.
 * `/` → empty string (homepage via site.homepagePageId).
 * `/about` → `"about"`.
 */
export function resolvePageSlugFromSegments(
  pageSlug: string[] | undefined,
): string | null {
  if (!pageSlug?.length) {
    return '';
  }

  if (pageSlug.length === 1) {
    return pageSlug[0] ?? '';
  }

  return null;
}
