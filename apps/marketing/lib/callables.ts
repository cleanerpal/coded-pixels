import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from '@/lib/firebase';
import type { ConfigSnapshot } from '@codedpixels/shared-types';

/** Callable payload for signup and Site Import waitlist (INF-003). */
export interface MarketingCallablePayload {
  email: string;
  config: ConfigSnapshot;
  /** Unchecked-by-default checkbox — must be true on submit (DOC-002). */
  consentAccepted: true;
}

export interface MarketingCallableResult {
  success: true;
}

/**
 * Submit signup via INF-003 Callable — no client Firestore writes.
 * Aligned with Dr. Kai Nakamura on INF-003; Dr. Victor Lang on Callable-only PII.
 */
export async function submitSignup(
  payload: MarketingCallablePayload,
): Promise<MarketingCallableResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<
    MarketingCallablePayload,
    MarketingCallableResult
  >(functions, 'submitSignup');
  const result = await callable(payload);
  return result.data;
}

export async function submitSiteImportWaitlist(
  payload: MarketingCallablePayload,
): Promise<MarketingCallableResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<
    MarketingCallablePayload,
    MarketingCallableResult
  >(functions, 'submitSiteImportWaitlist');
  const result = await callable(payload);
  return result.data;
}

export type { ConfigSnapshot };
