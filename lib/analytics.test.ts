import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  COOKIE_CONSENT_STORAGE_KEY,
  createConsentRecord,
} from "./cookie-consent";
import { shouldTrackAnalytics, trackEvent } from "./analytics";

describe("analytics", () => {
  const now = new Date("2026-06-12T12:00:00.000Z");
  const gtag = vi.fn();
  let storedConsent: string | null = null;

  beforeEach(() => {
    storedConsent = null;
    gtag.mockClear();

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) =>
        key === COOKIE_CONSENT_STORAGE_KEY ? storedConsent : null,
      ),
    });
    vi.stubGlobal("window", { gtag });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("shouldTrackAnalytics", () => {
    it("allows tracking only for valid accepted consent", () => {
      const accepted = createConsentRecord("accepted", now);
      const rejected = createConsentRecord("rejected", now);

      expect(shouldTrackAnalytics(accepted, now)).toBe(true);
      expect(shouldTrackAnalytics(rejected, now)).toBe(false);
      expect(shouldTrackAnalytics(null, now)).toBe(false);
    });
  });

  describe("trackEvent", () => {
    it("no-ops when analytics consent is not granted", () => {
      trackEvent("template_selected", {
        template_id: "modern-pro",
        template_category: "business",
      });

      expect(gtag).not.toHaveBeenCalled();
    });

    it("no-ops when gtag is unavailable even with consent", () => {
      const accepted = createConsentRecord("accepted", now);
      storedConsent = JSON.stringify(accepted);
      vi.stubGlobal("window", {});

      trackEvent("template_selected", {
        template_id: "modern-pro",
        template_category: "business",
      });

      expect(gtag).not.toHaveBeenCalled();
    });

    it("fires gtag when consent is granted and gtag is available", () => {
      const accepted = createConsentRecord("accepted", now);
      storedConsent = JSON.stringify(accepted);

      trackEvent("feature_toggled", {
        feature_id: "crm",
        enabled: true,
        monthly_price_pence: 999,
      });

      expect(gtag).toHaveBeenCalledWith("event", "feature_toggled", {
        feature_id: "crm",
        enabled: true,
        monthly_price_pence: 999,
      });
    });

    it("no-ops for rejected consent stored in localStorage", () => {
      const rejected = createConsentRecord("rejected", now);
      storedConsent = JSON.stringify(rejected);

      trackEvent("waitlist_joined", { has_config_snapshot: true });

      expect(gtag).not.toHaveBeenCalled();
    });
  });
});
