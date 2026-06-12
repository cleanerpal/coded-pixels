import type { PublishedPageData } from '@/lib/published-page';
import type { TenantContext } from '@/lib/tenant-resolution';
import { LiveSectionRenderer } from '@/components/LiveSectionRenderer';

interface TenantPageViewProps {
  page: PublishedPageData;
  siteName: string;
  showPoweredBy: boolean;
  tenant: Pick<TenantContext, 'companyId' | 'siteId'>;
}

export function TenantPageView({
  page,
  siteName,
  showPoweredBy,
  tenant,
}: TenantPageViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <LiveSectionRenderer
        sections={page.sections}
        tenantFormContext={{
          companyId: tenant.companyId,
          siteId: tenant.siteId,
          pageId: page.pageId,
          pageSlug: page.slug,
        }}
      />
      {showPoweredBy ? (
        <footer className="border-t border-border px-6 py-4 text-center text-sm text-text-muted">
          Powered by CodedPixels · {siteName}
        </footer>
      ) : null}
    </div>
  );
}
