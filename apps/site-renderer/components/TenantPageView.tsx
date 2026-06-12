import type { PublishedPageData } from '@/lib/published-page';
import { SectionRenderer } from '@codedpixels/component-registry';

interface TenantPageViewProps {
  page: PublishedPageData;
  siteName: string;
  showPoweredBy: boolean;
}

export function TenantPageView({
  page,
  siteName,
  showPoweredBy,
}: TenantPageViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <SectionRenderer sections={page.sections} />
      {showPoweredBy ? (
        <footer className="border-t border-border px-6 py-4 text-center text-sm text-text-muted">
          Powered by CodedPixels · {siteName}
        </footer>
      ) : null}
    </div>
  );
}
