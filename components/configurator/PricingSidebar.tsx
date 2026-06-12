'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildConfigHref } from '@/lib/config-url-sync';
import {
  getLineItems,
  getOneTimeLineItems,
  monthlyTotalPence,
} from '@/lib/pricing';
import type { ConfigState } from '@/types';

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export interface PricingSidebarProps {
  config: ConfigState;
  onConfigChange?: (config: ConfigState) => void;
}

export function PricingSidebar({ config }: PricingSidebarProps) {
  const lineItems = useMemo(() => getLineItems(config), [config]);
  const oneTimeItems = useMemo(() => getOneTimeLineItems(config), [config]);
  const totalPence = useMemo(() => monthlyTotalPence(config), [config]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const hasTemplate = config.templateId !== null;
  const showOneTimeNote =
    config.customTemplateBilling === 'one-time' &&
    config.featureIds.includes('custom-template');

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback('Configuration link copied!');
    } catch {
      setCopyFeedback('Could not copy link — try again');
    }

    window.setTimeout(() => setCopyFeedback(null), 3000);
  }, []);

  const getStartedHref = buildConfigHref('/get-started', config);

  return (
    <aside aria-label="Pricing summary" className="hidden lg:block">
      <Card className="sticky top-4 space-y-4">
        <h2 className="text-lg font-semibold text-text">Your plan</h2>

        <ul className="space-y-2" aria-label="Monthly line items">
          {lineItems.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <span className="text-text-muted">{item.label}</span>
              <span className="shrink-0 tabular-nums text-text">
                {formatPence(item.amountPence)}/mo
              </span>
            </li>
          ))}
        </ul>

        {oneTimeItems.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              One-time fees
            </p>
            <ul className="space-y-2" aria-label="One-time line items">
              {oneTimeItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-text-muted">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-text">
                    {formatPence(item.amountPence)}
                  </span>
                </li>
              ))}
            </ul>
            {showOneTimeNote && (
              <p className="text-xs text-text-muted">
                One-time £149 — shown at checkout.
              </p>
            )}
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-text">Monthly total</span>
            <span
              className="text-xl font-bold tabular-nums text-accent"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatPence(totalPence)}/mo
            </span>
          </div>
        </div>

        <div className="space-y-2">
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

          {hasTemplate ? (
            <Link
              href={getStartedHref}
              className="inline-flex w-full items-center justify-center rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          ) : (
            <Button type="button" className="w-full" disabled>
              Get Started
            </Button>
          )}
        </div>
      </Card>
    </aside>
  );
}
