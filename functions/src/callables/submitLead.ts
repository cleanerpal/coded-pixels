import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { ZodError, z } from 'zod';
import { db } from '../lib/admin';
import { marketingCallableOptions } from '../lib/callableOptions';
import {
  assertHoneypotClean,
  stripHoneypotField,
} from '../lib/honeypot';
import { extractLeadContact } from '../lib/leads';
import { assertSubmitLeadRateLimit } from '../lib/rateLimit';
import {
  isRecaptchaScoreAcceptable,
  verifyRecaptchaToken,
} from '../lib/recaptcha';
import {
  extractClientIp,
  hashIp,
  truncateUserAgent,
} from '../lib/requestMeta';

const leadSourceSchema = z.object({
  pageId: z.string().min(1),
  pageSlug: z.string().min(1),
  formSectionId: z.string().min(1),
  formType: z.enum(['contact', 'quote', 'booking']),
});

const submitLeadPayloadSchema = z.object({
  companyId: z.string().min(1),
  siteId: z.string().min(1),
  source: leadSourceSchema,
  fields: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .refine((fields) => Object.keys(fields).length > 0, {
      message: 'At least one form field is required',
    }),
  recaptchaToken: z.string().min(1).optional(),
});

export type SubmitLeadPayload = z.infer<typeof submitLeadPayloadSchema>;

function mapValidationError(error: unknown): never {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    throw new HttpsError('invalid-argument', message || 'Invalid request payload');
  }

  if (error instanceof Error && error.message === 'HONEYPOT_FILLED') {
    throw new HttpsError('permission-denied', 'Submission rejected');
  }

  throw error;
}

async function assertRecaptchaAcceptable(token: string | undefined): Promise<void> {
  if (!token) {
    return;
  }

  const verification = await verifyRecaptchaToken(token);
  console.info('submitLead recaptcha score', {
    score: verification.score,
    success: verification.success,
  });

  if (!verification.success || !isRecaptchaScoreAcceptable(verification.score)) {
    throw new HttpsError('permission-denied', 'Submission rejected');
  }
}

async function assertTenantSiteExists(
  companyId: string,
  siteId: string,
): Promise<void> {
  const siteSnap = await db
    .collection('companies')
    .doc(companyId)
    .collection('sites')
    .doc(siteId)
    .get();

  if (!siteSnap.exists) {
    throw new HttpsError('not-found', 'Site not found');
  }
}

/**
 * Public form submission — firestore-schema.md §7.4, Q49.
 * Aligned with Dr. Samuel Ruiz on Q50 · Dr. Rafael Ortiz on leads path.
 */
export async function handleSubmitLead(
  request: CallableRequest,
): Promise<{ success: true }> {
  let payload: SubmitLeadPayload;

  try {
    payload = submitLeadPayloadSchema.parse(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  try {
    assertHoneypotClean(payload.fields);
  } catch (error) {
    mapValidationError(error);
  }

  await assertRecaptchaAcceptable(payload.recaptchaToken);

  const sanitizedFields = stripHoneypotField(payload.fields);

  const ip = extractClientIp(request.rawRequest);
  const ipHash = hashIp(ip);

  await assertSubmitLeadRateLimit(
    ipHash,
    payload.siteId,
    payload.source.formSectionId,
  );

  await assertTenantSiteExists(payload.companyId, payload.siteId);

  const userAgent = truncateUserAgent(request.rawRequest);
  const contact = extractLeadContact(sanitizedFields);
  const leadRef = db
    .collection('companies')
    .doc(payload.companyId)
    .collection('sites')
    .doc(payload.siteId)
    .collection('leads')
    .doc();

  await leadRef.set({
    status: 'new',
    source: payload.source,
    contact,
    fields: sanitizedFields,
    submittedAt: FieldValue.serverTimestamp(),
    ipHash,
    ...(userAgent ? { userAgent } : {}),
  });

  const periodId = new Date().toISOString().slice(0, 7);
  const usageRef = db
    .collection('companies')
    .doc(payload.companyId)
    .collection('usage')
    .doc(periodId);

  await usageRef.set(
    {
      formSubmissions: FieldValue.increment(1),
    },
    { merge: true },
  );

  return { success: true };
}

export { marketingCallableOptions as submitLeadCallableOptions };
