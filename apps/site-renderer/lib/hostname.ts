/** Reserved subdomains — no slug lookup (site-renderer-architecture.md §3.1) */
export const RESERVED_SUBDOMAINS = new Set([
  'app',
  'www',
  'api',
  'staging',
  'preview',
]);

export const TENANT_DOMAIN = 'codedpixels.co.uk';

const TENANT_HOST_PATTERN = /^([a-z0-9-]+)\.codedpixels\.co\.uk$/;
const LOCALHOST_TENANT_PATTERN = /^([a-z0-9-]+)\.localhost(?::\d+)?$/;

export type HostParseResult =
  | { kind: 'tenant'; slug: string }
  | { kind: 'reserved' }
  | { kind: 'dev-slug'; slug: string }
  | { kind: 'no-tenant' };

/**
 * Resolve tenant slug from the Host header.
 * Aligned with Dr. Lena Petrova on DOC-006 §3.1–3.3.
 */
export function parseTenantSlugFromHost(
  hostHeader: string | null | undefined,
  devSlug?: string | null,
): HostParseResult {
  if (!hostHeader) {
    return devSlug ? { kind: 'dev-slug', slug: devSlug } : { kind: 'no-tenant' };
  }

  const host = hostHeader.split(':')[0]?.toLowerCase() ?? '';

  const tenantMatch = host.match(TENANT_HOST_PATTERN);
  if (tenantMatch) {
    const slug = tenantMatch[1]!;
    if (RESERVED_SUBDOMAINS.has(slug)) {
      return { kind: 'reserved' };
    }
    return { kind: 'tenant', slug };
  }

  const localMatch = host.match(LOCALHOST_TENANT_PATTERN);
  if (localMatch) {
    const slug = localMatch[1]!;
    if (RESERVED_SUBDOMAINS.has(slug)) {
      return { kind: 'reserved' };
    }
    return { kind: 'tenant', slug };
  }

  if (host === 'localhost' || host.endsWith('.localhost')) {
    return devSlug ? { kind: 'dev-slug', slug: devSlug } : { kind: 'no-tenant' };
  }

  return { kind: 'no-tenant' };
}

export function getTenantSlugFromHostParse(result: HostParseResult): string | null {
  if (result.kind === 'tenant' || result.kind === 'dev-slug') {
    return result.slug;
  }
  return null;
}
