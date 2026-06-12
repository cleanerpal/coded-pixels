import { describe, expect, it } from 'vitest';
import {
  parseTenantSlugFromHost,
  RESERVED_SUBDOMAINS,
  TENANT_DOMAIN,
} from './hostname';

describe('parseTenantSlugFromHost', () => {
  it('extracts slug from tenant subdomain', () => {
    expect(parseTenantSlugFromHost('acme-clean.codedpixels.co.uk')).toEqual({
      kind: 'tenant',
      slug: 'acme-clean',
    });
  });

  it('strips port from host header', () => {
    expect(parseTenantSlugFromHost('acme-clean.codedpixels.co.uk:443')).toEqual({
      kind: 'tenant',
      slug: 'acme-clean',
    });
  });

  it('denies reserved subdomains', () => {
    for (const reserved of RESERVED_SUBDOMAINS) {
      expect(
        parseTenantSlugFromHost(`${reserved}.${TENANT_DOMAIN}`),
      ).toEqual({ kind: 'reserved' });
    }
  });

  it('uses dev slug on plain localhost', () => {
    expect(parseTenantSlugFromHost('localhost:3002', 'demo')).toEqual({
      kind: 'dev-slug',
      slug: 'demo',
    });
  });

  it('returns no-tenant when localhost has no dev slug', () => {
    expect(parseTenantSlugFromHost('localhost:3002')).toEqual({
      kind: 'no-tenant',
    });
  });

  it('supports slug.localhost for local multi-tenant testing', () => {
    expect(parseTenantSlugFromHost('acme-clean.localhost:3002')).toEqual({
      kind: 'tenant',
      slug: 'acme-clean',
    });
  });

  it('returns no-tenant for unknown apex host', () => {
    expect(parseTenantSlugFromHost('example.com')).toEqual({
      kind: 'no-tenant',
    });
  });
});
