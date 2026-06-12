import type {
  CompanyPlan,
  PackageId,
  ProvisioningJob,
} from '@codedpixels/shared-types';

/** Dev / stub provisioning when B6-001 backend is unavailable. */
export const MOCK_PROVISIONING_JOB_ID = 'mock-provisioning-job';

export const MOCK_COMPANY_PLAN: CompanyPlan = {
  featureIds: ['crm', 'email-automation'],
  billingCycle: 'monthly',
  monthlyTotalPence: 3499,
  packageId: 'growth' as PackageId,
};

export function createMockProvisioningJob(
  ownerUid: string,
  overrides?: Partial<ProvisioningJob>,
): ProvisioningJob {
  const now = new Date().toISOString();
  return {
    status: 'complete',
    ownerUid,
    signupId: 'mock-signup',
    stripeCheckoutSessionPath: 'checkout_sessions/mock-session',
    companyId: 'mock-company',
    siteId: 'mock-site',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
