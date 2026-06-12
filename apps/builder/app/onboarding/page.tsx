import type { Metadata } from 'next';
import { Suspense } from 'react';

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Finish setting up your CodedPixels website.',
};

function OnboardingFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      aria-busy="true"
      aria-label="Loading onboarding"
    >
      <p className="text-sm text-text-muted">Loading…</p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingFlow />
    </Suspense>
  );
}
