'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { Button } from '@/components/ui/Button';
import { buildConfigHref } from '@/lib/config-url-sync';
import {
  getLineItems,
  getOneTimeLineItems,
  monthlyTotalPence,
} from '@/lib/pricing';
import type { ConfigState } from '@/types';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true',
  );
}

export interface MobilePricingBarProps {
  config: ConfigState;
}

export function MobilePricingBar({ config }: MobilePricingBarProps) {
  const lineItems = useMemo(() => getLineItems(config), [config]);
  const oneTimeItems = useMemo(() => getOneTimeLineItems(config), [config]);
  const totalPence = useMemo(() => monthlyTotalPence(config), [config]);
  const [expanded, setExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const trapRef = useRef<HTMLDivElement>(null);

  const hasTemplate = config.templateId !== null;
  const showOneTimeNote =
    config.customTemplateBilling === 'one-time' &&
    config.featureIds.includes('custom-template');
  const getStartedHref = buildConfigHref('/get-started', config);

  const closeSheet = useCallback(() => {
    setExpanded(false);
  }, []);

  const toggleSheet = useCallback(() => {
    setExpanded((open) => !open);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback('Configuration link copied!');
    } catch {
      setCopyFeedback('Could not copy link — try again');
    }

    window.setTimeout(() => setCopyFeedback(null), 3000);
  }, []);

  const handleTrapKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSheet();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const container = trapRef.current;
      if (!container) {
        return;
      }

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeSheet],
  );

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const container = trapRef.current;
    if (!container) {
      return;
    }

    const focusable = getFocusableElements(container);
    focusable[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      toggleRef.current?.focus();
    };
  }, [expanded]);

  return (
    <div className="lg:hidden" aria-label="Mobile pricing summary">
      {expanded ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-text/40"
          aria-label="Close pricing details"
          tabIndex={-1}
          onClick={closeSheet}
        />
      ) : null}

      <div
        ref={trapRef}
        className="fixed inset-x-0 bottom-0 z-50"
        onKeyDown={expanded ? handleTrapKeyDown : undefined}
      >
        {expanded ? (
          <div
            id="mobile-pricing-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Pricing summary"
            className="max-h-[min(70vh,32rem)] overflow-y-auto border-t border-border bg-surface px-4 py-4 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text">Your plan</h2>
              <button
                type="button"
                className="rounded-card px-2 py-1 text-sm font-medium text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={closeSheet}
              >
                Close
              </button>
            </div>

            <ul className="space-y-2" aria-label="Monthly line items">
              {lineItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="min-w-0 text-text-muted">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-text">
                    {formatPence(item.amountPence)}/mo
                  </span>
                </li>
              ))}
            </ul>

            {oneTimeItems.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  One-time fees
                </p>
                <ul className="space-y-2" aria-label="One-time line items">
                  {oneTimeItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 text-text-muted">{item.label}</span>
                      <span className="shrink-0 tabular-nums text-text">
                        {formatPence(item.amountPence)}
                      </span>
                    </li>
                  ))}
                </ul>
                {showOneTimeNote ? (
                  <p className="text-xs text-text-muted">
                    One-time £149 — shown at checkout.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-text">Monthly total</span>
                <span
                  className="text-lg font-bold tabular-nums text-accent"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatPence(totalPence)}/mo
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleCopyLink}
              >
                Copy configuration link
              </Button>

              {copyFeedback ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-center text-sm text-success"
                >
                  {copyFeedback}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="border-t border-border bg-surface/95 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              ref={toggleRef}
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-card py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-expanded={expanded}
              aria-controls="mobile-pricing-sheet"
              onClick={toggleSheet}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-text-muted">Monthly total</span>
                <span
                  className="block truncate text-base font-bold tabular-nums text-accent"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatPence(totalPence)}/mo
                </span>
              </span>
              <span
                className={`inline-flex shrink-0 text-xs font-medium text-primary transition-transform ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                ▲
              </span>
              <span className="sr-only">
                {expanded ? 'Hide pricing details' : 'Show pricing details'}
              </span>
            </button>

            {hasTemplate ? (
              <Link
                href={getStartedHref}
                className="inline-flex shrink-0 items-center justify-center rounded-card bg-accent px-3 py-2 text-xs font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm sm:px-4"
              >
                Get Started
              </Link>
            ) : (
              <Button
                type="button"
                className="shrink-0 px-3 py-2 text-xs sm:text-sm"
                disabled
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
