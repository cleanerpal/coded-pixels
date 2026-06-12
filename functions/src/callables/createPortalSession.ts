import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../lib/admin';
import { marketingCallableOptions } from '../lib/callableOptions';
import { resolveCompanyId } from '../lib/memberAuth';

const PORTAL_POLL_ATTEMPTS = 20;
const PORTAL_POLL_DELAY_MS = 500;

const ADMIN_PLUS_ROLES = new Set(['owner', 'admin']);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function portalReturnUrl(): string {
  return (
    process.env.STRIPE_PORTAL_RETURN_URL ??
    'https://app.codedpixels.co.uk/dashboard/billing'
  );
}

function portalStubUrl(): string | undefined {
  const stub = process.env.STRIPE_PORTAL_STUB_URL;
  return stub && stub.length > 0 ? stub : undefined;
}

async function assertAdminPlusMember(
  uid: string,
  companyId: string,
): Promise<void> {
  const memberDoc = await db
    .collection('companies')
    .doc(companyId)
    .collection('members')
    .doc(uid)
    .get();

  if (!memberDoc.exists) {
    throw new HttpsError('permission-denied', 'Not a member of this company');
  }

  const role = memberDoc.data()?.role;
  if (!role || !ADMIN_PLUS_ROLES.has(role)) {
    throw new HttpsError(
      'permission-denied',
      'Admin role or above required to manage billing',
    );
  }
}

export interface CreatePortalSessionResult {
  success: true;
  portalUrl: string;
}

/**
 * Stripe Customer Portal session via Extension — stripe-catalogue.md §4.1, Q46.
 * Set STRIPE_PORTAL_STUB_URL for local dev without Extension.
 * Aligned with Dr. Owen Reilly on Q46.
 */
export async function handleCreatePortalSession(
  request: CallableRequest,
): Promise<CreatePortalSessionResult> {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const uid = request.auth.uid;
  const companyId = await resolveCompanyId(uid, request.auth.token);
  await assertAdminPlusMember(uid, companyId);

  const stubUrl = portalStubUrl();
  if (stubUrl) {
    return { success: true, portalUrl: stubUrl };
  }

  const sessionRef = db
    .collection('customers')
    .doc(uid)
    .collection('portal_sessions')
    .doc();

  await sessionRef.set({
    return_url: portalReturnUrl(),
    createdAt: FieldValue.serverTimestamp(),
  });

  let portalUrl: string | undefined;
  for (let attempt = 0; attempt < PORTAL_POLL_ATTEMPTS; attempt += 1) {
    const snap = await sessionRef.get();
    const data = snap.data() as { url?: string; error?: { message?: string } };

    if (data?.error?.message) {
      throw new HttpsError('internal', data.error.message);
    }

    if (typeof data?.url === 'string' && data.url.length > 0) {
      portalUrl = data.url;
      break;
    }

    await sleep(PORTAL_POLL_DELAY_MS);
  }

  if (!portalUrl) {
    throw new HttpsError(
      'failed-precondition',
      'Billing portal unavailable — enable Stripe Customer Portal or set STRIPE_PORTAL_STUB_URL',
    );
  }

  return { success: true, portalUrl };
}

export { marketingCallableOptions as createPortalSessionCallableOptions };
