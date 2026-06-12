import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from './admin';
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  type RateLimitAction,
} from './constants';

export function rateLimitDocId(ipHash: string, action: RateLimitAction): string {
  return `${ipHash}_${action}`;
}

export async function assertRateLimit(
  ipHash: string,
  action: RateLimitAction,
): Promise<void> {
  const docId = rateLimitDocId(ipHash, action);
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

    if (data.count >= RATE_LIMIT_MAX) {
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
