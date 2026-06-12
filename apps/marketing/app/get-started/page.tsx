import { Suspense } from 'react';

import {
  GetStartedFlow,
  GetStartedFlowFallback,
} from '@/components/get-started/GetStartedFlow';
import { createPageMetadata } from '@/lib/seo/page-metadata';

export const metadata = createPageMetadata({
  title: 'Get Started',
  description:
    'Save your CodedPixels plan with email-only sign-up. No payment taken — preview your configuration and we will be in touch.',
  path: '/get-started',
});

export default function GetStartedPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Save your plan
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Review your order summary and sign up with email only — no password
          required.
        </p>
      </div>

      <div className="mt-12">
        <Suspense fallback={<GetStartedFlowFallback />}>
          <GetStartedFlow />
        </Suspense>
      </div>
    </main>
  );
}
