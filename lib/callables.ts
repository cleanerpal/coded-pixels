import type { ConfigSnapshot } from '@/types';

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
 * Client helpers for ENG-020 / ENG-023 — wire to Firebase httpsCallable after
 * App Check + Functions SDK init land in the Next.js app.
 */
export async function submitSignup(
  _payload: MarketingCallablePayload,
): Promise<MarketingCallableResult> {
  throw new Error(
    'submitSignup: Firebase client not initialised — implement in ENG-020',
  );
}

export async function submitSiteImportWaitlist(
  _payload: MarketingCallablePayload,
): Promise<MarketingCallableResult> {
  throw new Error(
    'submitSiteImportWaitlist: Firebase client not initialised — implement in ENG-023',
  );
}

export type { ConfigSnapshot };
