import { unstable_cache } from 'next/cache';
import type { Page, PageSeo, PageVersion, Section } from '@codedpixels/shared-types';
import { adminDb } from '@/lib/firebase-admin';
import type { TenantContext } from '@/lib/tenant-resolution';

export type PublishedPageLoadResult =
  | { status: 'ok'; page: PublishedPageData }
  | { status: 'not-found' }
  | { status: 'unpublished' };

export interface PublishedPageData {
  pageId: string;
  title: string;
  slug: string;
  seo: PageSeo;
  sections: Section[];
  publishedVersionId: string;
}

async function findPageIdBySlug(
  tenant: TenantContext,
  pageSlug: string,
): Promise<string | null> {
  if (pageSlug === '') {
    return tenant.homepagePageId;
  }

  const snapshot = await adminDb
    .collection('companies')
    .doc(tenant.companyId)
    .collection('sites')
    .doc(tenant.siteId)
    .collection('pages')
    .where('slug', '==', pageSlug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0]?.id ?? null;
}

async function loadPublishedPageUncached(
  tenant: TenantContext,
  pageSlug: string,
): Promise<PublishedPageLoadResult> {
  const pageId = await findPageIdBySlug(tenant, pageSlug);
  if (!pageId) {
    return { status: 'not-found' };
  }

  const pageRef = adminDb
    .collection('companies')
    .doc(tenant.companyId)
    .collection('sites')
    .doc(tenant.siteId)
    .collection('pages')
    .doc(pageId);

  const pageSnap = await pageRef.get();
  if (!pageSnap.exists) {
    return { status: 'not-found' };
  }

  const page = pageSnap.data() as Page;
  const publishedVersionId = page.publishedVersionId;
  if (!publishedVersionId) {
    return { status: 'unpublished' };
  }

  const versionSnap = await pageRef.collection('versions').doc(publishedVersionId).get();
  if (!versionSnap.exists) {
    return { status: 'unpublished' };
  }

  const version = versionSnap.data() as PageVersion;
  if (version.status !== 'published') {
    return { status: 'unpublished' };
  }

  return {
    status: 'ok',
    page: {
      pageId,
      title: page.title,
      slug: page.slug,
      seo: page.seo,
      sections: version.sections ?? [],
      publishedVersionId,
    },
  };
}

export function getCachedPublishedPage(
  tenant: TenantContext,
  pageSlug: string,
): Promise<PublishedPageLoadResult> {
  const cacheKey = [
    'published-page',
    tenant.siteId,
    pageSlug === '' ? 'homepage' : pageSlug,
  ].join(':');

  return unstable_cache(
    () => loadPublishedPageUncached(tenant, pageSlug),
    [cacheKey],
    {
      revalidate: 3600,
      tags: [`site:${tenant.siteId}`],
    },
  )();
}
