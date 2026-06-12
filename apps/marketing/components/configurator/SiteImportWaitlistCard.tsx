'use client';

import { useState, type FormEvent } from 'react';

import { Badge } from '@codedpixels/ui';
import { Button } from '@codedpixels/ui';
import { Card } from '@codedpixels/ui';
import { trackEvent } from '@/lib/analytics';
import { submitSiteImportWaitlist } from '@/lib/callables';
import { buildConfigSnapshot } from '@/lib/config-snapshot';
import type { ConfigState } from '@codedpixels/shared-types';

/** Site Import estimated price — not selectable, not in live total (Q4, Q15). */
export const SITE_IMPORT_ESTIMATED_MONTHLY_PENCE = 699;

function formatAddonPrice(monthlyPence: number): string {
  return `+ £${(monthlyPence / 100).toFixed(2)}/mo`;
}

function getSubmitErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export interface SiteImportWaitlistCardProps {
  config: ConfigState;
}

export function SiteImportWaitlistCard({ config }: SiteImportWaitlistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !consentAccepted) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await submitSiteImportWaitlist({
        email: trimmedEmail,
        config: buildConfigSnapshot(config),
        consentAccepted: true,
      });

      trackEvent('waitlist_joined', { has_config_snapshot: true });
      setSubmitted(true);
      setExpanded(false);
    } catch (error) {
      setErrorMessage(getSubmitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-4 border-dashed bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text">
              Site Import / Migration
            </h4>
            <Badge variant="primary">Coming soon</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Import your existing site — launching soon
          </p>
          <p className="mt-2 text-sm font-medium text-text">
            {formatAddonPrice(SITE_IMPORT_ESTIMATED_MONTHLY_PENCE)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Estimated · launching soon
          </p>
        </div>
      </div>

      {submitted ? (
        <p className="mt-4 text-sm font-medium text-success" role="status">
          You&apos;re on the list!
        </p>
      ) : expanded ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="site-import-waitlist-email" className="sr-only">
              Email address for Site Import waitlist
            </label>
            <input
              id="site-import-waitlist-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              placeholder="you@example.com"
              className="w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="site-import-waitlist-consent"
              type="checkbox"
              required
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            />
            <label
              htmlFor="site-import-waitlist-consent"
              className="text-xs text-text-muted"
            >
              I agree to CodedPixels storing my email and plan choices as
              described in the{' '}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !consentAccepted}
            >
              {submitting ? 'Joining…' : 'Join waitlist'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => {
                setExpanded(false);
                setErrorMessage(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => setExpanded(true)}
        >
          Join waitlist
        </Button>
      )}
    </Card>
  );
}
