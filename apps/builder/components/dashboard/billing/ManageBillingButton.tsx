'use client';

import { useState } from 'react';

import { Button, Card } from '@codedpixels/ui';

import { createPortalSession } from '@/lib/callables';

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManageBilling() {
    setLoading(true);
    setError(null);

    try {
      const stubUrl = process.env.NEXT_PUBLIC_STRIPE_PORTAL_STUB_URL;
      if (stubUrl) {
        window.location.assign(stubUrl);
        return;
      }

      const { portalUrl } = await createPortalSession();
      window.location.assign(portalUrl);
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : 'Could not open billing portal',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-lg p-6">
      <h2 className="text-lg font-semibold text-text">Subscription & billing</h2>
      <p className="mt-2 text-sm text-text-muted">
        Update your payment method, view invoices, or cancel your subscription
        via Stripe&apos;s secure billing portal (Q46).
      </p>
      <Button
        className="mt-4"
        onClick={() => void handleManageBilling()}
        disabled={loading}
      >
        {loading ? 'Opening portal…' : 'Manage billing'}
      </Button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <p className="mt-4 text-xs text-text-muted">
        Requires Stripe Customer Portal enabled, or set{' '}
        <code className="rounded bg-background px-1">STRIPE_PORTAL_STUB_URL</code>{' '}
        /{' '}
        <code className="rounded bg-background px-1">
          NEXT_PUBLIC_STRIPE_PORTAL_STUB_URL
        </code>{' '}
        for local development.
      </p>
    </Card>
  );
}
