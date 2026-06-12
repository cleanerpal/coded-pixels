import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { ZodError } from 'zod';
import { db } from '../lib/admin';
import { marketingCallableOptions } from '../lib/callableOptions';
import {
  PRIVACY_CONSENT_VERSION,
  SIGNUP_SOURCE,
  SIGNUP_STATUS_PENDING,
  WAITLIST_SOURCE,
} from '../lib/constants';
import { assertRateLimit } from '../lib/rateLimit';
import {
  extractClientIp,
  hashIp,
  truncateUserAgent,
} from '../lib/requestMeta';
import {
  parseMarketingSubmitPayload,
  type ConfigSnapshot,
} from '../lib/schemas';

function mapValidationError(error: unknown): never {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    throw new HttpsError('invalid-argument', message || 'Invalid request payload');
  }

  throw error;
}

async function persistMarketingSubmission(options: {
  collection: 'signups' | 'waitlist_site_import';
  action: 'submitSignup' | 'submitSiteImportWaitlist';
  source: typeof SIGNUP_SOURCE | typeof WAITLIST_SOURCE;
  request: CallableRequest;
  config: ConfigSnapshot;
  email: string;
  extraFields?: Record<string, unknown>;
}): Promise<{ success: true }> {
  const ip = extractClientIp(options.request.rawRequest);
  const ipHash = hashIp(ip);

  await assertRateLimit(ipHash, options.action);

  const userAgent = truncateUserAgent(options.request.rawRequest);
  const docRef = db.collection(options.collection).doc();

  const baseFields = {
    email: options.email,
    consentAt: FieldValue.serverTimestamp(),
    consentVersion: PRIVACY_CONSENT_VERSION,
    source: options.source,
    createdAt: FieldValue.serverTimestamp(),
    ipHash,
    ...(userAgent ? { userAgent } : {}),
  };

  if (options.collection === 'signups') {
    await docRef.set({
      ...baseFields,
      config: options.config,
      status: SIGNUP_STATUS_PENDING,
      ...options.extraFields,
    });
  } else {
    await docRef.set({
      ...baseFields,
      configSnapshot: options.config,
      ...options.extraFields,
    });
  }

  return { success: true };
}

export async function handleSubmitSignup(
  request: CallableRequest,
): Promise<{ success: true }> {
  let payload;

  try {
    payload = parseMarketingSubmitPayload(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  return persistMarketingSubmission({
    collection: 'signups',
    action: 'submitSignup',
    source: SIGNUP_SOURCE,
    request,
    email: payload.email,
    config: payload.config,
  });
}

export async function handleSubmitSiteImportWaitlist(
  request: CallableRequest,
): Promise<{ success: true }> {
  let payload;

  try {
    payload = parseMarketingSubmitPayload(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  return persistMarketingSubmission({
    collection: 'waitlist_site_import',
    action: 'submitSiteImportWaitlist',
    source: WAITLIST_SOURCE,
    request,
    email: payload.email,
    config: payload.config,
  });
}

export { marketingCallableOptions };
