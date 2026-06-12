import { NextResponse, type NextRequest } from 'next/server';
import {
  getTenantSlugFromHostParse,
  parseTenantSlugFromHost,
} from '@/lib/hostname';

const TENANT_SLUG_HEADER = 'x-tenant-slug';
const TENANT_COMPANY_HEADER = 'x-tenant-company-id';
const TENANT_SITE_HEADER = 'x-tenant-site-id';

const PLATFORM_PATHS = new Set(['/platform-not-found', '/maintenance']);

function withTenantHeaders(
  request: NextRequest,
  slug: string,
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_SLUG_HEADER, slug);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function stripTenantHeaders(response: NextResponse): NextResponse {
  response.headers.delete(TENANT_SLUG_HEADER);
  response.headers.delete(TENANT_COMPANY_HEADER);
  response.headers.delete(TENANT_SITE_HEADER);
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    PLATFORM_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const hostParse = parseTenantSlugFromHost(
    request.headers.get('host'),
    process.env.SITE_RENDERER_DEV_SLUG,
  );

  if (hostParse.kind === 'reserved' || hostParse.kind === 'no-tenant') {
    const url = request.nextUrl.clone();
    url.pathname = '/platform-not-found';
    return stripTenantHeaders(NextResponse.rewrite(url));
  }

  const slug = getTenantSlugFromHostParse(hostParse);
  if (!slug) {
    const url = request.nextUrl.clone();
    url.pathname = '/platform-not-found';
    return stripTenantHeaders(NextResponse.rewrite(url));
  }

  return stripTenantHeaders(withTenantHeaders(request, slug));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
