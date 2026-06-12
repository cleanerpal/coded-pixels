import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ComingSoon } from '@/components/ComingSoon';
import { MaintenancePage } from '@/components/MaintenancePage';
import { TenantNotFound } from '@/components/TenantNotFound';
import { TenantPageView } from '@/components/TenantPageView';
import { resolvePageSlugFromSegments } from '@/lib/path-resolution';
import { getCachedPublishedPage } from '@/lib/published-page';
import { getTenantRouteContext } from '@/lib/tenant-context';

export const revalidate = 3600;

interface TenantPageProps {
  params: Promise<{ pageSlug?: string[] }>;
}

export async function generateMetadata({
  params,
}: TenantPageProps): Promise<Metadata> {
  const routeContext = await getTenantRouteContext();
  if (routeContext.status !== 'ok') {
    return { title: 'CodedPixels' };
  }

  const resolvedSlug = resolvePageSlugFromSegments((await params).pageSlug);
  if (resolvedSlug === null) {
    return { title: routeContext.tenant.siteName };
  }

  const pageResult = await getCachedPublishedPage(routeContext.tenant, resolvedSlug);
  if (pageResult.status !== 'ok') {
    return { title: routeContext.tenant.siteName };
  }

  return {
    title: pageResult.page.seo.title || pageResult.page.title,
    description: pageResult.page.seo.description,
  };
}

export default async function TenantCatchAllPage({ params }: TenantPageProps) {
  const routeContext = await getTenantRouteContext();

  if (routeContext.status === 'platform-not-found') {
    notFound();
  }

  if (routeContext.status === 'maintenance') {
    return <MaintenancePage siteName={routeContext.tenant.siteName} />;
  }

  const resolvedSlug = resolvePageSlugFromSegments((await params).pageSlug);
  if (resolvedSlug === null) {
    return <TenantNotFound siteName={routeContext.tenant.siteName} />;
  }

  const pageResult = await getCachedPublishedPage(routeContext.tenant, resolvedSlug);

  if (pageResult.status === 'not-found') {
    return <TenantNotFound siteName={routeContext.tenant.siteName} />;
  }

  if (pageResult.status === 'unpublished') {
    return <ComingSoon siteName={routeContext.tenant.siteName} />;
  }

  const showPoweredBy = !routeContext.tenant.featureIds.includes('white-label');

  return (
    <TenantPageView
      page={pageResult.page}
      siteName={routeContext.tenant.siteName}
      showPoweredBy={showPoweredBy}
    />
  );
}
