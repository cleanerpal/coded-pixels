import { unstable_cache } from 'next/cache';
import type { Company, FeatureId, Site } from '@codedpixels/shared-types';
import { adminDb } from '@/lib/firebase-admin';

export interface SlugIndexDoc {
  companyId: string;
  siteId: string;
}

export interface TenantContext {
  companyId: string;
  siteId: string;
  slug: string;
  siteName: string;
  siteStatus: Site['status'];
  companyStatus: Company['status'];
  featureIds: FeatureId[];
  homepagePageId: string;
  /** CI-seeded template demo tenants — generateMetadata sets noindex (Q65, spec §5.1) */
  isPlatformDemo: boolean;
}

async function loadSlugIndex(slug: string): Promise<SlugIndexDoc | null> {
  const snapshot = await adminDb.collection('slugs').doc(slug).get();
  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() as SlugIndexDoc;
  if (!data.companyId || !data.siteId) {
    return null;
  }

  return data;
}

async function loadTenantContext(slug: string): Promise<TenantContext | null> {
  const slugDoc = await loadSlugIndex(slug);
  if (!slugDoc) {
    return null;
  }

  const { companyId, siteId } = slugDoc;
  const [companySnap, siteSnap] = await Promise.all([
    adminDb.collection('companies').doc(companyId).get(),
    adminDb.collection('companies').doc(companyId).collection('sites').doc(siteId).get(),
  ]);

  if (!companySnap.exists || !siteSnap.exists) {
    return null;
  }

  const company = companySnap.data() as Company;
  const site = siteSnap.data() as Site;

  return {
    companyId,
    siteId,
    slug,
    siteName: site.name,
    siteStatus: site.status,
    companyStatus: company.status,
    featureIds: site.featureIds ?? [],
    homepagePageId: site.homepagePageId,
    isPlatformDemo: company.isPlatformDemo === true,
  };
}

export function getCachedTenantContext(slug: string): Promise<TenantContext | null> {
  return unstable_cache(
    () => loadTenantContext(slug),
    ['tenant-context', slug],
    { revalidate: 60, tags: [`site-slug:${slug}`] },
  )();
}

export function isTenantMaintenance(tenant: TenantContext): boolean {
  return tenant.siteStatus === 'suspended' || tenant.companyStatus === 'cancelled';
}
