import { beforeEach, describe, expect, it, vi } from 'vitest';
import { priceId } from './stripeCatalogue';

vi.mock('./admin', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  },
}));

vi.mock('./provisionTenant', () => ({
  provisionTenant: vi.fn(),
}));

vi.mock('./provisioningJobs', () => ({
  markProvisioningJobComplete: vi.fn(),
  markProvisioningJobFailed: vi.fn(),
}));

describe('handleCheckoutCompleted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ignores incomplete checkout sessions', async () => {
    const { handleCheckoutCompleted } = await import('./handleCheckoutCompleted');

    const result = await handleCheckoutCompleted({
      ownerUid: 'uid-1',
      checkoutSessionPath: 'customers/uid-1/checkout_sessions/cs_1',
      sessionData: {
        payment_status: 'unpaid',
        metadata: { signupId: 'signup-1' },
      },
    });

    expect(result.handled).toBe(false);
    expect(result.reason).toBe('checkout-not-complete');
  });

  it('provisions tenant idempotently on paid checkout', async () => {
    const { handleCheckoutCompleted } = await import('./handleCheckoutCompleted');
    const { db } = await import('./admin');
    const { provisionTenant } = await import('./provisionTenant');
    const { markProvisioningJobComplete } = await import('./provisioningJobs');

    vi.mocked(provisionTenant).mockResolvedValue({
      companyId: 'company-1',
      siteId: 'site-1',
      slug: 'tenant-signup1',
      alreadyProvisioned: false,
    });

    const signupGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        email: 'owner@example.com',
        config: {
          templateId: 'sparkle-clean',
          featureIds: ['crm'],
          billingCycle: 'monthly',
          monthlyTotalPence: 1498,
        },
      }),
    });

    vi.mocked(db.collection).mockImplementation((name: string) => {
      if (name === 'signups') {
        return { doc: () => ({ get: signupGet }) } as never;
      }
      return { doc: vi.fn() } as never;
    });

    const sessionSet = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.doc).mockReturnValue({ set: sessionSet } as never);

    const prices = [priceId('base', 'monthly'), priceId('crm', 'monthly')];

    const result = await handleCheckoutCompleted({
      ownerUid: 'uid-1',
      checkoutSessionPath: 'customers/uid-1/checkout_sessions/cs_1',
      sessionData: {
        payment_status: 'paid',
        customer: 'cus_123',
        subscription: 'sub_123',
        prices,
        metadata: {
          signupId: 'signup-1',
          provisioningJobId: 'job-1',
        },
      },
    });

    expect(result.handled).toBe(true);
    expect(result.companyId).toBe('company-1');
    expect(provisionTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        signupId: 'signup-1',
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
        featureIds: ['crm'],
      }),
    );
    expect(markProvisioningJobComplete).toHaveBeenCalledWith('job-1', 'company-1');
    expect(sessionSet).toHaveBeenCalled();
  });

  it('fails closed when subscription items mismatch snapshot', async () => {
    const { handleCheckoutCompleted } = await import('./handleCheckoutCompleted');
    const { db } = await import('./admin');
    const { markProvisioningJobFailed } = await import('./provisioningJobs');

    const signupGet = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        email: 'owner@example.com',
        config: {
          templateId: 'sparkle-clean',
          featureIds: ['crm', 'sms'],
          billingCycle: 'monthly',
          monthlyTotalPence: 1797,
        },
      }),
    });

    vi.mocked(db.collection).mockImplementation((name: string) => {
      if (name === 'signups') {
        return { doc: () => ({ get: signupGet }) } as never;
      }
      return { doc: vi.fn() } as never;
    });

    const result = await handleCheckoutCompleted({
      ownerUid: 'uid-1',
      checkoutSessionPath: 'customers/uid-1/checkout_sessions/cs_1',
      sessionData: {
        payment_status: 'paid',
        customer: 'cus_123',
        subscription: 'sub_123',
        prices: [priceId('base', 'monthly'), priceId('crm', 'monthly')],
        metadata: {
          signupId: 'signup-1',
          provisioningJobId: 'job-1',
        },
      },
    });

    expect(result.handled).toBe(false);
    expect(result.reason).toBe('subscription-mismatch');
    expect(markProvisioningJobFailed).toHaveBeenCalled();
  });
});
