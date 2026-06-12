const LIVE_SITE_HOST =
  process.env.NEXT_PUBLIC_LIVE_SITE_HOST ?? 'codedpixels.co.uk';

export function getLiveSiteUrl(slug: string): string {
  const normalised = slug.replace(/^https?:\/\//, '').split('.')[0] ?? slug;
  return `https://${normalised}.${LIVE_SITE_HOST}`;
}
