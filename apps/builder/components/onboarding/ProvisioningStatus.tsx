import Link from 'next/link';

import { Button } from '@codedpixels/ui';
import { Card } from '@codedpixels/ui';

import type { ProvisioningPollState } from '@/lib/onboarding/use-provisioning-poll';

type ProvisioningStatusProps = {
  state: ProvisioningPollState;
  onRetry?: () => void;
};

export function ProvisioningStatus({ state, onRetry }: ProvisioningStatusProps) {
  if (state.status === 'idle') {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-xl font-bold text-text">Missing provisioning job</h1>
        <p className="text-sm text-text-muted">
          Return from checkout or open the link in your confirmation email.
        </p>
        <Link
          href="/dashboard"
          className="builder-focus-ring inline-flex min-h-11 items-center text-sm font-semibold text-primary underline"
        >
          Go to dashboard
        </Link>
      </Card>
    );
  }

  if (state.status === 'polling') {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center" aria-busy="true">
        <div
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent"
          aria-hidden="true"
        />
        <h1 className="text-xl font-bold text-text">Setting up your workspace</h1>
        <p className="text-sm text-text-muted">
          This usually takes under a minute. Please keep this tab open.
        </p>
      </Card>
    );
  }

  if (state.status === 'timeout') {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-xl font-bold text-text">Still working on it</h1>
        <p className="text-sm text-text-muted">
          Provisioning is taking longer than expected. Try again in a moment or
          contact support if this continues.
        </p>
        {onRetry ? (
          <Button type="button" variant="primary" onClick={onRetry}>
            Check again
          </Button>
        ) : null}
      </Card>
    );
  }

  if (state.status === 'failed') {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center" role="alert">
        <h1 className="text-xl font-bold text-text">Setup could not finish</h1>
        <p className="text-sm text-text-muted">{state.message}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {onRetry ? (
            <Button type="button" variant="primary" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          <Link
            href="/dashboard"
            className="builder-focus-ring inline-flex min-h-11 items-center justify-center rounded-card border border-primary px-4 text-sm font-semibold text-primary"
          >
            Back to dashboard
          </Link>
        </div>
      </Card>
    );
  }

  return null;
}
