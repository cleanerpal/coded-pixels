/**
 * GA4 event helpers gated by cookie consent (ENG-022).
 * Source: codedpixels-project-plan.md Q14, Q20
 * Aligned with Dr. Amina Laurent on Q14/Q20; Dr. Patrick O'Brien on consent gate.
 */

import {
  isAnalyticsConsentGranted,
  readConsentFromStorage,
  type CookieConsentRecord,
} from "@/lib/cookie-consent";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** Q20 structured event parameter map. */
export type PackageId = "starter" | "growth" | "pro" | "custom";
export type BillingCycle = "monthly" | "annual";
export type ConfigLinkSource = "configurator" | "success_screen";

export type AnalyticsEventMap = {
  template_selected: {
    template_id: string;
    template_category: string;
  };
  feature_toggled: {
    feature_id: string;
    enabled: boolean;
    monthly_price_pence: number;
  };
  package_clicked: {
    package_id: PackageId;
    preset_feature_ids: string[];
  };
  billing_cycle_changed: {
    billing_cycle: BillingCycle;
    monthly_total_pence: number;
  };
  copy_config_link: {
    source: ConfigLinkSource;
  };
  waitlist_joined: {
    has_config_snapshot: true;
  };
  get_started_clicked: {
    source: string;
    monthly_total_pence: number;
    feature_count: number;
  };
  signup_completed: {
    package_id?: PackageId;
    template_id: string;
    feature_ids: string[];
    billing_cycle: BillingCycle;
    monthly_total_pence: number;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/** Whether analytics events may fire for the given consent record. */
export function shouldTrackAnalytics(
  record: CookieConsentRecord | null,
  now: Date = new Date(),
): boolean {
  return isAnalyticsConsentGranted(record, now);
}

/**
 * Send a GA4 event. No-ops when consent is not granted or gtag is unavailable.
 * Events must never fire before the user accepts analytics cookies.
 */
export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  params: AnalyticsEventMap[T],
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!shouldTrackAnalytics(readConsentFromStorage())) {
    return;
  }

  const gtag = window.gtag;
  if (!gtag) {
    return;
  }

  gtag("event", eventName, params as Record<string, unknown>);
}
