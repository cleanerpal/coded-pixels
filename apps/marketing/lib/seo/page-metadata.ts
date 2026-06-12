import type { Metadata } from 'next';

import { SITE_URL } from '@/lib/seo/constants';

interface PageMetadataInput {
  title: string;
  description: string;
  path: `/${string}` | '/';
}

/** Shared metadata fields for public marketing routes (Dr. Rajiv Singh — Q SEO). */
export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | CodedPixels`,
      description,
      url: canonical,
      siteName: 'CodedPixels',
      locale: 'en_GB',
      type: 'website',
    },
  };
}
