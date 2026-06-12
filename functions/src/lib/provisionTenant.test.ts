import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cloneSectionsWithNewIds } from './cloneSections';
import { businessNameFromEmail, buildProvisionalSlug } from './provisionSlug';

vi.mock('./admin', () => ({
  db: {
    collection: vi.fn(),
    runTransaction: vi.fn(),
  },
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    setCustomUserClaims: vi.fn(),
  }),
}));

describe('cloneSectionsWithNewIds', () => {
  it('assigns fresh UUIDs while preserving section structure', () => {
    const source = [
      {
        id: '00000000-0001-4000-8000-000000000001',
        type: 'hero',
        props: { headline: 'Hello' },
      },
      {
        id: '00000000-0001-4000-8000-000000000002',
        type: 'footer',
        props: { businessName: 'Acme' },
        children: [
          {
            id: '00000000-0001-4000-8000-000000000003',
            type: 'text-block',
            props: { body: 'Nested' },
          },
        ],
      },
    ];

    const cloned = cloneSectionsWithNewIds(source);

    expect(cloned).toHaveLength(2);
    expect(cloned[0]?.id).not.toBe(source[0]?.id);
    expect(cloned[1]?.children?.[0]?.id).not.toBe(
      source[1]?.children?.[0]?.id,
    );
    expect(cloned[0]?.props).toEqual(source[0]?.props);
  });
});

describe('provisionSlug helpers', () => {
  it('builds deterministic provisional slug from signupId', () => {
    expect(buildProvisionalSlug('abc123XYZ')).toBe('tenant-abc123xy');
  });

  it('derives business name from email local part', () => {
    expect(businessNameFromEmail('jane.doe@example.com')).toBe('Jane Doe');
  });
});

describe('provisionTenant idempotency contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('documents converted signup short-circuit behaviour', async () => {
    const { provisionTenant } = await import('./provisionTenant');
    const { db } = await import('./admin');

    const companyGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({ slug: 'tenant-abc12345' }),
    });

    const sitesGet = vi.fn().mockResolvedValue({
      docs: [{ id: 'site-1' }],
    });

    const signupGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        status: 'converted',
        convertedCompanyId: 'company-1',
      }),
    });

    vi.mocked(db.collection).mockImplementation((name: string) => {
      if (name === 'signups') {
        return {
          doc: () => ({ get: signupGet }),
        } as never;
      }

      if (name === 'companies') {
        return {
          doc: () => ({
            get: companyGet,
            collection: () => ({
              limit: () => ({ get: sitesGet }),
            }),
          }),
        } as never;
      }

      return { doc: vi.fn() } as never;
    });

    const result = await provisionTenant({
      signupId: 'signup-1',
      ownerUid: 'uid-1',
      email: 'owner@example.com',
      config: {
        templateId: 'sparkle-clean',
        featureIds: [],
        billingCycle: 'monthly',
        monthlyTotalPence: 999,
      },
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      featureIds: [],
    });

    expect(result.alreadyProvisioned).toBe(true);
    expect(result.companyId).toBe('company-1');
    expect(db.runTransaction).not.toHaveBeenCalled();
  });
});
