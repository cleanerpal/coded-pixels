"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  readConsentFromStorage,
  saveConsentChoice,
  shouldShowConsentBanner,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const regionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const record = readConsentFromStorage();
    setVisible(shouldShowConsentBanner(record));
  }, []);

  useEffect(() => {
    if (!visible || !regionRef.current) {
      return;
    }
    regionRef.current.focus();
  }, [visible]);

  const handleChoice = useCallback((choice: CookieConsentChoice) => {
    saveConsentChoice(choice);
    setVisible(false);
  }, []);

  if (!mounted || !visible) {
    return null;
  }

  return (
    <section
      ref={regionRef}
      role="region"
      aria-label="Cookie consent"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface shadow-[0_-4px_24px_rgb(15_23_42/0.08)] motion-safe:animate-[cookie-banner-in_0.35s_ease-out]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-medium text-text">We use cookies</h2>
          <p className="text-sm font-normal text-text-muted">
            We use essential cookies so the site works. With your permission, we
            also use analytics cookies to see how people use our configurator — so
            we can improve it. We don&apos;t sell your data.{" "}
            <Link
              href="/privacy#cookies"
              className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-card border border-primary bg-surface px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Reject analytics cookies
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-card bg-primary px-4 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Accept analytics cookies
          </button>
        </div>
      </div>
    </section>
  );
}
