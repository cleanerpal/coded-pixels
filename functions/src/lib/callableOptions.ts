/**
 * App Check enforcement for marketing Callables (Q49).
 *
 * Set DISABLE_APP_CHECK=true when running the Functions emulator without an
 * App Check debug token (local dev only — never in production).
 *
 * Client-side: configure NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY in
 * .env.local; without it, App Check tokens cannot be minted in the browser.
 */
export function shouldEnforceAppCheck(): boolean {
  return process.env.DISABLE_APP_CHECK !== 'true';
}

export const marketingCallableOptions = {
  region: 'europe-west2' as const,
  get enforceAppCheck() {
    return shouldEnforceAppCheck();
  },
};
