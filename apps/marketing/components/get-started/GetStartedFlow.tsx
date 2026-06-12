'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { Button } from '@codedpixels/ui';
import { Card } from '@codedpixels/ui';
import { getCheckoutMode, isSimulatedCheckout } from '@/lib/checkout-mode';
import { createCheckoutSession, submitSignup } from '@/lib/callables';
import { signInWithCheckoutToken } from '@/lib/firebase';
import {
  buildConfigSnapshot,
  formatAddonSummary,
  getTemplateDisplayName,
} from '@/lib/config-snapshot';
import { decodeConfigFromParams } from '@/lib/config-state';
import { buildConfigHref } from '@/lib/config-url-sync';
import {
  annualMonthlyEquivalentPence,
  getLineItems,
  getOneTimeLineItems,
  monthlyTotalPence,
  oneTimeFeesPence,
} from '@/lib/pricing';
import type { ConfigState } from '@codedpixels/shared-types';
import { useSearchParams } from 'next/navigation';

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

interface AlmostReadyModalProps {
  open: boolean;
  onClose: () => void;
}

function AlmostReadyModal({ open, onClose }: AlmostReadyModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const container = dialogRef.current;
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
    [onClose],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const container = dialogRef.current;
    if (!container) {
      return;
    }

    const focusable = getFocusableElements(container);
    focusable[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-text/40"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="almost-ready-title"
        aria-describedby="almost-ready-description"
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-card border border-border bg-surface p-6 shadow-hover"
        onKeyDown={handleKeyDown}
      >
        <h2 id="almost-ready-title" className="text-lg font-semibold text-text">
          Almost ready
        </h2>
        <p id="almost-ready-description" className="mt-2 text-sm text-text-muted">
          We&apos;re putting the finishing touches on the site builder. We&apos;ll
          be in touch when your workspace is ready — your plan is already saved.
        </p>
        <div className="mt-6 flex justify-end">
          <Button type="button" variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </>
  );
}

interface OrderSummaryProps {
  config: ConfigState;
}

function OrderSummary({ config }: OrderSummaryProps) {
  const lineItems = useMemo(() => getLineItems(config), [config]);
  const oneTimeItems = useMemo(() => getOneTimeLineItems(config), [config]);
  const monthlyPence = useMemo(() => monthlyTotalPence(config), [config]);
  const annualMonthlyPence = useMemo(
    () => annualMonthlyEquivalentPence(config),
    [config],
  );
  const isAnnual = config.billingCycle === 'annual';

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Order summary</h2>

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

      {oneTimeItems.length > 0 ? (
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
        </div>
      ) : null}

      <div className="border-t border-border pt-3">
        {isAnnual ? (
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-text">Billed annually</span>
              <span className="text-xl font-bold tabular-nums text-accent">
                {formatPence(annualMonthlyPence)}/mo
              </span>
            </div>
            <p className="text-sm text-text-muted">
              {formatPence(annualMonthlyPence)}/mo billed annually
            </p>
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-text">Monthly total</span>
            <span className="text-xl font-bold tabular-nums text-accent">
              {formatPence(monthlyPence)}/mo
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

interface SuccessSummaryProps {
  config: ConfigState;
  configHref: string;
  onStartBuilding: () => void;
}

function SuccessSummary({
  config,
  configHref,
  onStartBuilding,
}: SuccessSummaryProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const oneTime = oneTimeFeesPence(config);
  const isAnnual = config.billingCycle === 'annual';
  const recurringPence = isAnnual
    ? annualMonthlyEquivalentPence(config)
    : monthlyTotalPence(config);

  const handleCopyLink = useCallback(async () => {
    try {
      const absolute =
        typeof window !== 'undefined'
          ? `${window.location.origin}${configHref}`
          : configHref;
      await navigator.clipboard.writeText(absolute);
      setCopyFeedback('Configuration link copied!');
    } catch {
      setCopyFeedback('Could not copy link — try again');
    }

    window.setTimeout(() => setCopyFeedback(null), 3000);
  }, [configHref]);

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-text">
          You&apos;re in! We&apos;ve saved your plan.
        </h2>
        <p className="text-text-muted">We&apos;ll be in touch soon.</p>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Template</dt>
          <dd className="font-medium text-text">
            {getTemplateDisplayName(config.templateId ?? '')}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Add-ons</dt>
          <dd className="max-w-[16rem] text-right font-medium text-text">
            {formatAddonSummary(config.featureIds)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Billing</dt>
          <dd className="font-medium text-text">
            {isAnnual ? 'Annual' : 'Monthly'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Recurring total</dt>
          <dd className="tabular-nums font-medium text-accent">
            {formatPence(recurringPence)}/mo
          </dd>
        </div>
        {oneTime > 0 ? (
          <div className="flex justify-between gap-3">
            <dt className="text-text-muted">One-time fees</dt>
            <dd className="tabular-nums font-medium text-text">
              {formatPence(oneTime)}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="space-y-2">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={onStartBuilding}
        >
          Start building my site now
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleCopyLink}
        >
          Copy configuration link
        </Button>
        {copyFeedback ? (
          <p role="status" aria-live="polite" className="text-center text-sm text-success">
            {copyFeedback}
          </p>
        ) : null}
        <Link
          href="/"
          className="block text-center text-sm font-medium text-primary underline"
        >
          Back to home
        </Link>
      </div>
    </Card>
  );
}

function GetStartedContent() {
  const searchParams = useSearchParams();
  const { config } = useMemo(
    () => decodeConfigFromParams(searchParams),
    [searchParams],
  );
  const configHref = useMemo(() => buildConfigHref('/get-started', config), [config]);
  const snapshot = useMemo(() => buildConfigSnapshot(config), [config]);
  const stripeCheckout = getCheckoutMode() === 'stripe';

  const [email, setEmail] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      if (!snapshot) {
        setError('Choose a starter design in the configurator before signing up.');
        return;
      }

      if (!consentAccepted) {
        setError('Please accept the Privacy Policy to continue.');
        return;
      }

      setSubmitting(true);

      try {
        const payload = {
          email: email.trim(),
          config: snapshot,
          consentAccepted: true as const,
        };

        if (stripeCheckout) {
          const checkout = await createCheckoutSession(payload);
          await signInWithCheckoutToken(checkout.customToken);
          window.location.assign(checkout.checkoutUrl);
          return;
        }

        await submitSignup(payload);
        setSuccess(true);
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : 'Something went wrong. Please try again.';
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [consentAccepted, email, snapshot, stripeCheckout],
  );

  if (!config.templateId) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <h2 className="text-xl font-semibold text-text">
          Choose a starter design first
        </h2>
        <p className="text-sm text-text-muted">
          Pick a starter design in the configurator so we can save your plan.
        </p>
        <Link
          href="/#configurator"
          className="inline-flex items-center justify-center rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Go to configurator
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <>
        <SuccessSummary
          config={config}
          configHref={configHref}
          onStartBuilding={() => setModalOpen(true)}
        />
        <AlmostReadyModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <OrderSummary config={config} />

      <Card className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-text">Sign up with email</h2>
          <p className="text-sm text-text-muted">
            {stripeCheckout
              ? 'Secure Stripe checkout — 14-day free trial, card required.'
              : 'No password needed — we\u2019ll save your configuration and follow up by email.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-text">
              Email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="signup-consent"
              name="consent"
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => setConsentAccepted(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            />
            <label htmlFor="signup-consent" className="text-sm text-text-muted">
              I agree to CodedPixels storing my email and plan choices as
              described in the{' '}
              <Link href="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting
              ? stripeCheckout
                ? 'Redirecting to checkout…'
                : 'Saving your plan…'
              : stripeCheckout
                ? 'Continue to checkout'
                : 'Save my plan'}
          </Button>
        </form>

        <p className="text-xs text-text-muted">
          All prices include VAT.{' '}
          <Link href="/terms" className="text-primary underline">
            Terms of Service
          </Link>
        </p>
      </Card>
    </div>
  );
}

export function GetStartedFlow() {
  const showSimulationBanner = isSimulatedCheckout();

  return (
    <>
      {showSimulationBanner ? (
        <div
          role="status"
          className="mb-8 rounded-card border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-text"
        >
          No payment taken — this is a sign-up preview
        </div>
      ) : null}
      <GetStartedContent />
    </>
  );
}

export function GetStartedFlowFallback() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading checkout">
      <div className="h-12 rounded-card bg-border" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-64 rounded-card bg-border" />
        <div className="h-64 rounded-card bg-border" />
      </div>
    </div>
  );
}
