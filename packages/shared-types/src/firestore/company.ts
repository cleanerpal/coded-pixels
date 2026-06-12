import type { BillingCycle, FeatureId } from '../marketing/config';
import type { CompanyStatus, MemberRole, TimestampLike } from './common';

export interface CompanyPlan {
  featureIds: FeatureId[];
  billingCycle: BillingCycle;
  monthlyTotalPence: number;
  annualTotalPence?: number;
  customTemplateBilling?: 'recurring' | 'one-time';
  packageId?: string;
}

/** Tenant root — `companies/{companyId}` (firestore-schema.md §6) */
export interface Company {
  name: string;
  slug: string;
  ownerUid: string;
  status: CompanyStatus;
  plan: CompanyPlan;
  onboardingStep?: number;
  onboardingCompletedAt?: TimestampLike;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  partnerId?: string;
  /** CI-seeded template demo tenants — site-renderer sets noindex (Q65, Wave 19) */
  isPlatformDemo?: boolean;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

/** RBAC source of truth — `companies/{companyId}/members/{uid}` */
export interface Member {
  email: string;
  role: MemberRole;
  invitedBy?: string;
  invitedAt?: TimestampLike;
  joinedAt: TimestampLike;
  updatedAt: TimestampLike;
}
