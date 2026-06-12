import { FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { ZodError } from 'zod';
import { db } from '../lib/admin';
import { marketingCallableOptions } from '../lib/callableOptions';
import {
  PRIVACY_CONSENT_VERSION,
  SIGNUP_SOURCE,
  SIGNUP_STATUS_PENDING,
} from '../lib/constants';
import { assertRateLimit } from '../lib/rateLimit';
import {
  extractClientIp,
  hashIp,
  truncateUserAgent,
} from '../lib/requestMeta';
import { createProvisioningJob } from '../lib/provisioningJobs';
import { buildCheckoutLineItems } from '../lib/stripeLineItems';
import { parseMarketingSubmitPayload } from '../lib/schemas';

const CHECKOUT_POLL_ATTEMPTS = 20;
const CHECKOUT_POLL_DELAY_MS = 500;

function mapValidationError(error: unknown): never {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    throw new HttpsError('invalid-argument', message || 'Invalid request payload');
  }

  throw error;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveOwnerUid(email: string): Promise<string> {
  try {
    const existing = await getAuth().getUserByEmail(email);
    return existing.uid;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'auth/user-not-found') {
      throw error;
    }
  }

  const created = await getAuth().createUser({ email });
  return created.uid;
}

function checkoutSuccessUrl(): string {
  return (
    process.env.STRIPE_CHECKOUT_SUCCESS_URL ??
    'https://app.codedpixels.co.uk/onboarding'
  );
}

function checkoutCancelUrl(): string {
  return (
    process.env.STRIPE_CHECKOUT_CANCEL_URL ??
    'https://codedpixels.co.uk/get-started'
  );
}

export interface CreateCheckoutSessionResult {
  success: true;
  signupId: string;
  provisioningJobId: string;
  checkoutUrl: string;
  customToken: string;
}

export async function handleCreateCheckoutSession(
  request: CallableRequest,
): Promise<CreateCheckoutSessionResult> {
  let payload;

  try {
    payload = parseMarketingSubmitPayload(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  const ip = extractClientIp(request.rawRequest);
  const ipHash = hashIp(ip);
  await assertRateLimit(ipHash, 'submitSignup');

  const userAgent = truncateUserAgent(request.rawRequest);
  const ownerUid = await resolveOwnerUid(payload.email);
  const signupRef = db.collection('signups').doc();

  await signupRef.set({
    email: payload.email,
    config: payload.config,
    consentAt: FieldValue.serverTimestamp(),
    consentVersion: PRIVACY_CONSENT_VERSION,
    source: SIGNUP_SOURCE,
    createdAt: FieldValue.serverTimestamp(),
    status: SIGNUP_STATUS_PENDING,
    ipHash,
    ...(userAgent ? { userAgent } : {}),
  });

  const sessionRef = db
    .collection('customers')
    .doc(ownerUid)
    .collection('checkout_sessions')
    .doc();

  const checkoutSessionPath = `customers/${ownerUid}/checkout_sessions/${sessionRef.id}`;
  const provisioningJobId = await createProvisioningJob({
    signupId: signupRef.id,
    ownerUid,
    stripeCheckoutSessionPath: checkoutSessionPath,
  });

  const lineItems = buildCheckoutLineItems(payload.config);

  await sessionRef.set({
    mode: 'subscription',
    line_items: lineItems,
    trial_period_days: 14,
    success_url: checkoutSuccessUrl(),
    cancel_url: checkoutCancelUrl(),
    allow_promotion_codes: false,
    metadata: {
      signupId: signupRef.id,
      provisioningJobId,
      packageId: payload.config.packageId ?? 'custom',
      billingCycle: payload.config.billingCycle,
    },
    createdAt: FieldValue.serverTimestamp(),
  });

  let checkoutUrl: string | undefined;
  for (let attempt = 0; attempt < CHECKOUT_POLL_ATTEMPTS; attempt += 1) {
    const snap = await sessionRef.get();
    const data = snap.data() as { url?: string; error?: { message?: string } };

    if (data?.error?.message) {
      throw new HttpsError('internal', data.error.message);
    }

    if (typeof data?.url === 'string' && data.url.length > 0) {
      checkoutUrl = data.url;
      break;
    }

    await sleep(CHECKOUT_POLL_DELAY_MS);
  }

  if (!checkoutUrl) {
    throw new HttpsError(
      'deadline-exceeded',
      'Checkout session URL not ready — Stripe Extension may not be installed',
    );
  }

  const customToken = await getAuth().createCustomToken(ownerUid);

  return {
    success: true,
    signupId: signupRef.id,
    provisioningJobId,
    checkoutUrl,
    customToken,
  };
}

export { marketingCallableOptions };
