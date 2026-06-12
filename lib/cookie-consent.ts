/**
 * Cookie consent storage and gate for analytics (ENG-021 / ENG-022).
 * Source: docs/planning/cookie-consent-legal-spec.md §3.4, §4
 * Aligned with Dr. Patrick O'Brien on consent gate.
 */

export const COOKIE_CONSENT_STORAGE_KEY = "cp_cookie_consent_v1";
export const COOKIE_CONSENT_VERSION = "cookie-v1";
export const COOKIE_CONSENT_CHANGE_EVENT = "cp:cookie-consent-change";

export type CookieConsentChoice = "accepted" | "rejected";

export interface CookieConsentRecord {
  choice: CookieConsentChoice;
  recordedAt: string;
  version: typeof COOKIE_CONSENT_VERSION;
}

const CONSENT_TTL_MONTHS = 12;

export function isConsentExpired(
  recordedAt: string,
  now: Date = new Date(),
): boolean {
  const recorded = new Date(recordedAt);
  if (Number.isNaN(recorded.getTime())) {
    return true;
  }

  const expiry = new Date(recorded);
  expiry.setMonth(expiry.getMonth() + CONSENT_TTL_MONTHS);
  return now >= expiry;
}

export function parseConsentRecord(
  raw: string | null,
): CookieConsentRecord | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("choice" in parsed) ||
      !("recordedAt" in parsed) ||
      !("version" in parsed)
    ) {
      return null;
    }

    const record = parsed as CookieConsentRecord;
    if (record.choice !== "accepted" && record.choice !== "rejected") {
      return null;
    }
    if (record.version !== COOKIE_CONSENT_VERSION) {
      return null;
    }
    if (typeof record.recordedAt !== "string") {
      return null;
    }

    return record;
  } catch {
    return null;
  }
}

export function isValidConsentRecord(
  record: CookieConsentRecord,
  now: Date = new Date(),
): boolean {
  if (record.version !== COOKIE_CONSENT_VERSION) {
    return false;
  }
  if (record.choice !== "accepted" && record.choice !== "rejected") {
    return false;
  }
  return !isConsentExpired(record.recordedAt, now);
}

/** True when GA4 may load (ENG-022). */
export function isAnalyticsConsentGranted(
  record: CookieConsentRecord | null,
  now: Date = new Date(),
): boolean {
  return (
    record !== null &&
    isValidConsentRecord(record, now) &&
    record.choice === "accepted"
  );
}

export function shouldShowConsentBanner(
  record: CookieConsentRecord | null,
  now: Date = new Date(),
): boolean {
  if (!record) {
    return true;
  }
  return !isValidConsentRecord(record, now);
}

export function createConsentRecord(
  choice: CookieConsentChoice,
  now: Date = new Date(),
): CookieConsentRecord {
  return {
    choice,
    recordedAt: now.toISOString(),
    version: COOKIE_CONSENT_VERSION,
  };
}

export function readConsentFromStorage(): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parseConsentRecord(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function saveConsentChoice(
  choice: CookieConsentChoice,
  now: Date = new Date(),
): CookieConsentRecord {
  const record = createConsentRecord(choice, now);
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: record }),
    );
  }
  return record;
}
