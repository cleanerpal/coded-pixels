import type { ErrorEvent, EventHint } from "@sentry/nextjs";

/** Aligned with expert-review-memo: beforeSend denylist for email + config payloads (Q61). */
export const PII_DENYLISTED_KEYS = new Set([
  "email",
  "userEmail",
  "config",
  "configState",
  "configSnapshot",
  "password",
  "phone",
  "phoneNumber",
]);

const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

const FILTERED = "[Filtered]";

function scrubEmailInString(value: string): string {
  return value.replace(EMAIL_PATTERN, FILTERED);
}

function scrubValue(value: unknown, depth = 0): unknown {
  if (depth > 12) {
    return FILTERED;
  }

  if (typeof value === "string") {
    return scrubEmailInString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1));
  }

  if (value && typeof value === "object") {
    const scrubbed: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value)) {
      scrubbed[key] = PII_DENYLISTED_KEYS.has(key)
        ? FILTERED
        : scrubValue(nested, depth + 1);
    }

    return scrubbed;
  }

  return value;
}

function scrubEventPayload<T>(payload: T | undefined): T | undefined {
  if (payload === undefined) {
    return payload;
  }

  return scrubValue(payload) as T;
}

export function scrubPiiFromSentryEvent(
  event: ErrorEvent,
  _hint?: EventHint,
): ErrorEvent | null {
  if (event.message) {
    event.message = scrubEmailInString(event.message);
  }

  if (event.request) {
    event.request = scrubEventPayload(event.request);
  }

  if (event.extra) {
    event.extra = scrubEventPayload(event.extra);
  }

  if (event.contexts) {
    event.contexts = scrubEventPayload(event.contexts);
  }

  if (event.user) {
    event.user = scrubEventPayload(event.user);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
      ...breadcrumb,
      message: breadcrumb.message
        ? scrubEmailInString(breadcrumb.message)
        : breadcrumb.message,
      data: scrubEventPayload(breadcrumb.data),
    }));
  }

  if (event.exception?.values) {
    for (const exception of event.exception.values) {
      if (exception.value) {
        exception.value = scrubEmailInString(exception.value);
      }
    }
  }

  return event;
}
