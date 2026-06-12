import { headers } from 'next/headers';
import {
  getCachedTenantContext,
  isTenantMaintenance,
  type TenantContext,
} from '@/lib/tenant-resolution';

export type TenantRouteContext =
  | { status: 'ok'; tenant: TenantContext }
  | { status: 'platform-not-found' }
  | { status: 'maintenance'; tenant: TenantContext };

const TENANT_SLUG_HEADER = 'x-tenant-slug';

/**
 * Read tenant context for the current request.
 * Middleware injects `x-tenant-slug`; Firestore resolution runs server-side (Admin SDK).
 * Aligned with Dr. Rafael Ortiz on firestore-schema §5.1.
 */
export async function getTenantRouteContext(): Promise<TenantRouteContext> {
  const requestHeaders = await headers();
  const slug = requestHeaders.get(TENANT_SLUG_HEADER);

  if (!slug) {
    return { status: 'platform-not-found' };
  }

  const tenant = await getCachedTenantContext(slug);
  if (!tenant) {
    return { status: 'platform-not-found' };
  }

  if (isTenantMaintenance(tenant)) {
    return { status: 'maintenance', tenant };
  }

  return { status: 'ok', tenant };
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const routeContext = await getTenantRouteContext();
  if (routeContext.status === 'ok') {
    return routeContext.tenant;
  }
  return null;
}
