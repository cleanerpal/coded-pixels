"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  isAnalyticsConsentGranted,
  readConsentFromStorage,
  type CookieConsentRecord,
} from "@/lib/cookie-consent";

function readAnalyticsConsentGranted(): boolean {
  return isAnalyticsConsentGranted(readConsentFromStorage());
}

/**
 * Mounts GA4 only after analytics cookie consent is granted (ENG-022 / Q14).
 * Listens for cp:cookie-consent-change to load on Accept.
 */
export function AnalyticsProvider() {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    setConsentGranted(readAnalyticsConsentGranted());

    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentRecord>).detail;
      setConsentGranted(isAnalyticsConsentGranted(detail));
    };

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, []);

  if (!GA_MEASUREMENT_ID || !consentGranted) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
