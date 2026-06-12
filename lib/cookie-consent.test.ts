import { describe, expect, it } from "vitest";

import {
  COOKIE_CONSENT_VERSION,
  createConsentRecord,
  isAnalyticsConsentGranted,
  isConsentExpired,
  isValidConsentRecord,
  parseConsentRecord,
  shouldShowConsentBanner,
} from "./cookie-consent";

describe("cookie-consent", () => {
  const now = new Date("2026-06-12T12:00:00.000Z");

  it("parses a valid stored record", () => {
    const record = createConsentRecord("accepted", now);
    const parsed = parseConsentRecord(JSON.stringify(record));
    expect(parsed).toEqual(record);
  });

  it("rejects malformed or wrong-version records", () => {
    expect(parseConsentRecord(null)).toBeNull();
    expect(parseConsentRecord("not-json")).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({
          choice: "accepted",
          recordedAt: now.toISOString(),
          version: "cookie-v0",
        }),
      ),
    ).toBeNull();
    expect(
      parseConsentRecord(
        JSON.stringify({
          choice: "maybe",
          recordedAt: now.toISOString(),
          version: COOKIE_CONSENT_VERSION,
        }),
      ),
    ).toBeNull();
  });

  it("expires consent after twelve months", () => {
    const recordedAt = "2025-05-12T12:00:00.000Z";
    expect(isConsentExpired(recordedAt, now)).toBe(true);
    expect(isConsentExpired("2026-01-01T00:00:00.000Z", now)).toBe(false);
  });

  it("grants analytics only for valid accepted choice", () => {
    const accepted = createConsentRecord("accepted", now);
    const rejected = createConsentRecord("rejected", now);

    expect(isAnalyticsConsentGranted(accepted, now)).toBe(true);
    expect(isAnalyticsConsentGranted(rejected, now)).toBe(false);
    expect(isAnalyticsConsentGranted(null, now)).toBe(false);
  });

  it("shows banner when consent is missing or expired", () => {
    const accepted = createConsentRecord("accepted", now);
    const expired = createConsentRecord("rejected", new Date("2024-01-01T00:00:00.000Z"));

    expect(shouldShowConsentBanner(null, now)).toBe(true);
    expect(shouldShowConsentBanner(accepted, now)).toBe(false);
    expect(shouldShowConsentBanner(expired, now)).toBe(true);
    expect(isValidConsentRecord(expired, now)).toBe(false);
  });
});
