export interface RevalidateRequestBody {
  companyId: string;
  siteId: string;
  slug: string;
  paths?: string[];
  tags?: string[];
}

export interface RevalidateResult {
  revalidated: boolean;
  paths: string[];
  at: string;
}

/**
 * POST to site-renderer on-demand ISR API (site-renderer-architecture.md §7.3).
 * Non-fatal on failure — publish succeeds; monitoring TODO (Sentry breadcrumb).
 */
export async function triggerSiteRevalidation(
  body: RevalidateRequestBody,
): Promise<RevalidateResult | null> {
  const baseUrl = process.env.SITE_RENDERER_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret) {
    console.warn(
      'Revalidation skipped: SITE_RENDERER_URL or REVALIDATE_SECRET not configured',
    );
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/revalidate`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidate-secret': secret,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Site revalidation failed', {
      status: response.status,
      detail,
      siteId: body.siteId,
    });
    return null;
  }

  return (await response.json()) as RevalidateResult;
}

/** SendGrid site-published email stub — Q41 MVP no-op. */
export function sendSitePublishedEmailStub(options: {
  companyId: string;
  siteId: string;
  slug: string;
}): void {
  // TODO(B8+): SendGrid `site-published` template via Dr. Aria Bennett (Q41)
  console.info('Site published email stub', options);
}
