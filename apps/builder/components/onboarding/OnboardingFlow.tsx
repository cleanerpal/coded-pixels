'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { RequireAuth } from '@/lib/auth/require-auth';
import { MOCK_PROVISIONING_JOB_ID } from '@/lib/onboarding/mock-provisioning';
import { useProvisioningPoll } from '@/lib/onboarding/use-provisioning-poll';
import { useTenantContext } from '@/lib/onboarding/use-tenant-context';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ProvisioningStatus } from '@/components/onboarding/ProvisioningStatus';

function resolveJobId(searchParams: URLSearchParams): string | null {
  const jobId = searchParams.get('job');
  if (jobId) {
    return jobId;
  }

  if (process.env.NEXT_PUBLIC_USE_MOCK_PROVISIONING === 'true') {
    return MOCK_PROVISIONING_JOB_ID;
  }

  return null;
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const jobId = useMemo(() => resolveJobId(searchParams), [searchParams]);
  const pollState = useProvisioningPoll(jobId);
  const completedJob = pollState.status === 'complete' ? pollState.job : null;
  const tenantState = useTenantContext(completedJob);

  if (pollState.status !== 'complete') {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <ProvisioningStatus
          state={pollState}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (tenantState.status === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        aria-busy="true"
        aria-label="Loading workspace"
      >
        <p className="text-sm text-text-muted">Loading your workspace…</p>
      </div>
    );
  }

  if (tenantState.status === 'error') {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <ProvisioningStatus
          state={{
            status: 'failed',
            message: tenantState.message,
            job: completedJob ?? undefined,
          }}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <OnboardingWizard
        company={tenantState.company}
        siteId={tenantState.siteId}
        site={tenantState.site}
      />
    </div>
  );
}

export function OnboardingFlow() {
  return (
    <RequireAuth>
      <OnboardingContent />
    </RequireAuth>
  );
}
