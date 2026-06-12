import { FieldValue } from 'firebase-admin/firestore';
import type { ConfigSnapshot } from '@codedpixels/shared-types';
import { db } from './admin';
import {
  featureIdsFromSubscriptionPrices,
  expectedRecurringPriceIds,
} from './stripeLineItems';
import {
  markProvisioningJobComplete,
  markProvisioningJobFailed,
} from './provisioningJobs';
import { provisionTenant } from './provisionTenant';
import { configSnapshotSchema } from './schemas';

export interface CheckoutSessionSnapshot {
  sessionId?: string;
  payment_status?: string;
  status?: string;
  customer?: string;
  subscription?: string;
  metadata?: Record<string, string>;
  prices?: string[];
  price?: string;
  line_items?: Array<{ price?: string }>;
  provisioned?: boolean;
}

const ALLOWED_PAYMENT_STATUSES = new Set(['paid', 'no_payment_required']);

function isCheckoutComplete(data: CheckoutSessionSnapshot): boolean {
  if (data.provisioned === true) {
    return false;
  }

  if (data.payment_status && ALLOWED_PAYMENT_STATUSES.has(data.payment_status)) {
    return true;
  }

  return data.status === 'complete';
}

function extractSubscriptionPriceIds(
  data: CheckoutSessionSnapshot,
): string[] {
  if (Array.isArray(data.prices) && data.prices.length > 0) {
    return data.prices;
  }

  if (typeof data.price === 'string' && data.price.length > 0) {
    return [data.price];
  }

  if (Array.isArray(data.line_items)) {
    return data.line_items
      .map((item) => item.price)
      .filter((price): price is string => typeof price === 'string');
  }

  return [];
}

function expectedSubscriptionFeatureIds(
  config: ConfigSnapshot,
): ConfigSnapshot['featureIds'] {
  return config.featureIds.filter(
    (id) =>
      !(id === 'custom-template' && config.customTemplateBilling === 'one-time'),
  );
}

function featureIdsMatchSnapshot(
  resolved: ConfigSnapshot['featureIds'],
  expected: ConfigSnapshot['featureIds'],
): boolean {
  const a = [...resolved].sort().join(',');
  const b = [...expected].sort().join(',');
  return a === b;
}

export interface HandleCheckoutCompletedInput {
  ownerUid: string;
  checkoutSessionPath: string;
  sessionData: CheckoutSessionSnapshot;
}

export interface HandleCheckoutCompletedResult {
  handled: boolean;
  companyId?: string;
  reason?: string;
}

/**
 * Idempotent checkout.session.completed handler — stripe-catalogue.md §10.
 */
export async function handleCheckoutCompleted(
  input: HandleCheckoutCompletedInput,
): Promise<HandleCheckoutCompletedResult> {
  const { sessionData } = input;

  if (!isCheckoutComplete(sessionData)) {
    return { handled: false, reason: 'checkout-not-complete' };
  }

  const signupId = sessionData.metadata?.signupId;
  const provisioningJobId = sessionData.metadata?.provisioningJobId;

  if (!signupId) {
    return { handled: false, reason: 'missing-signup-metadata' };
  }

  const signupSnap = await db.collection('signups').doc(signupId).get();
  if (!signupSnap.exists) {
    if (provisioningJobId) {
      await markProvisioningJobFailed(provisioningJobId, 'Signup not found');
    }
    return { handled: false, reason: 'signup-not-found' };
  }

  const signup = signupSnap.data() as {
    email: string;
    config: ConfigSnapshot;
    status?: string;
    convertedCompanyId?: string;
  };

  const config = configSnapshotSchema.parse(signup.config);
  const stripeCustomerId = sessionData.customer;
  const stripeSubscriptionId = sessionData.subscription;

  if (!stripeCustomerId || !stripeSubscriptionId) {
    if (provisioningJobId) {
      await markProvisioningJobFailed(
        provisioningJobId,
        'Missing Stripe customer or subscription ID',
      );
    }
    return { handled: false, reason: 'missing-stripe-ids' };
  }

  const subscriptionPriceIds = extractSubscriptionPriceIds(sessionData);
  const resolvedFeatureIds = featureIdsFromSubscriptionPrices(
    subscriptionPriceIds,
    config.billingCycle,
  );

  const expectedPrices = expectedRecurringPriceIds(config);
  const resolvedRecurring = subscriptionPriceIds.filter((id) =>
    expectedPrices.includes(id),
  );

  const expectedFeatureIds = expectedSubscriptionFeatureIds(config);

  if (
    resolvedRecurring.length !== expectedPrices.length ||
    !featureIdsMatchSnapshot(resolvedFeatureIds, expectedFeatureIds)
  ) {
    const message = 'Subscription items do not match config snapshot';
    if (provisioningJobId) {
      await markProvisioningJobFailed(provisioningJobId, message);
    }
    return { handled: false, reason: 'subscription-mismatch' };
  }

  const companyStatus =
    sessionData.payment_status === 'no_payment_required' ? 'trialing' : 'active';

  try {
    const result = await provisionTenant({
      signupId,
      ownerUid: input.ownerUid,
      email: signup.email,
      config,
      stripeCustomerId,
      stripeSubscriptionId,
      featureIds: resolvedFeatureIds,
      companyStatus,
    });

    await db.doc(input.checkoutSessionPath).set(
      { provisioned: true, provisionedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    if (provisioningJobId) {
      await markProvisioningJobComplete(provisioningJobId, result.companyId);
    }

    return {
      handled: true,
      companyId: result.companyId,
      reason: result.alreadyProvisioned ? 'already-provisioned' : 'provisioned',
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Provisioning failed';

    if (provisioningJobId) {
      await markProvisioningJobFailed(provisioningJobId, message);
    }

    throw error;
  }
}
