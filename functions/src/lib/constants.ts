/** Form consent version — docs/planning/cookie-consent-legal-spec.md §5.3 */
export const PRIVACY_CONSENT_VERSION = 'privacy-v1';

export const SIGNUP_SOURCE = 'get-started';
export const WAITLIST_SOURCE = 'configurator';

export const SIGNUP_STATUS_PENDING = 'pending';

/** Marketing Callables — firestore-rules-spec.md §6 */
export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export type RateLimitAction = 'submitSignup' | 'submitSiteImportWaitlist';
