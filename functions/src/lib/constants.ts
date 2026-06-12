/** Form consent version — docs/planning/cookie-consent-legal-spec.md §5.3 */
export const PRIVACY_CONSENT_VERSION = 'privacy-v1';

export const SIGNUP_SOURCE = 'get-started';
export const WAITLIST_SOURCE = 'configurator';

export const SIGNUP_STATUS_PENDING = 'pending';
export const SIGNUP_STATUS_CONVERTED = 'converted';

/** Marketing Callables — firestore-rules-spec.md §6 */
export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const PUBLISH_RATE_LIMIT_MAX = 30;

export type RateLimitAction =
  | 'submitSignup'
  | 'submitSiteImportWaitlist'
  | 'publishSite'
  | 'submitLead';

/** Max sections per page — firestore-schema.md §7.2 */
export const MAX_SECTIONS_PER_PAGE = 50;

/** Max retained published versions per page — Q53 */
export const MAX_PUBLISHED_VERSIONS_PER_PAGE = 5;
