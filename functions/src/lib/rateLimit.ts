import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './admin';
import type { RateLimitAction } from './constants';
import { RATE_LIMIT_WINDOW_MS } from './constants';

export const SUBMIT_LEAD_RATE_LIMIT_MAX = 10;

export function rateLimitDocId(ipHash: string, action: RateLimitAction): string {
  return `${ipHash}_${action}`;
}

export function submitLeadRateLimitDocId(
  ipHash: string,
  siteId: string,
  formSectionId: string,
): string {
  return `${ipHash}_submitLead_${siteId}_${formSectionId}`;
}

export async function assertRateLimit(
  ipHash: string,
  action: RateLimitAction,
): Promise<void> {
  await assertRateLimitWithMax(ipHash, action, 5);
}

export async function assertSubmitLeadRateLimit(
  ipHash: string,
  siteId: string,
  formSectionId: string,
): Promise<void> {
  const docId = submitLeadRateLimitDocId(ipHash, siteId, formSectionId);
  await assertRateLimitDoc(docId, SUBMIT_LEAD_RATE_LIMIT_MAX);
}

async function assertRateLimitWithMax(
  ipHash: string,
  action: RateLimitAction,
  max: number,
): Promise<void> {
  const docId = rateLimitDocId(ipHash, action);
  await assertRateLimitDoc(docId, max);
}

async function assertRateLimitDoc(docId: string, max: number): Promise<void> {
  const ref = db.collection('rateLimits').doc(docId);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists) {
      transaction.set(ref, {
        count: 1,
        windowStart: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + RATE_LIMIT_WINDOW_MS),
      });
      return;
    }

    const data = snapshot.data() as {
      count: number;
      windowStart: Timestamp;
    };

    const windowStartMs = data.windowStart.toMillis();
    const windowElapsed = now - windowStartMs;

    if (windowElapsed >= RATE_LIMIT_WINDOW_MS) {
      transaction.set(ref, {
        count: 1,
        windowStart: Timestamp.fromMillis(now),
        expiresAt: Timestamp.fromMillis(now + RATE_LIMIT_WINDOW_MS),
      });
      return;
    }

    if (data.count >= max) {
      throw new HttpsError(
        'resource-exhausted',
        'Too many requests. Please try again later.',
      );
    }

    transaction.update(ref, {
      count: FieldValue.increment(1),
    });
  });
}
