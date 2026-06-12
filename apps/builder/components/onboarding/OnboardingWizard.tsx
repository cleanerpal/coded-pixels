'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button } from '@codedpixels/ui';
import { Card } from '@codedpixels/ui';
import type { Company, Site } from '@codedpixels/shared-types';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { CODEDPIXELS_SUBDOMAIN_SUFFIX } from '@/lib/onboarding/constants';
import type { OnboardingStepNumber } from '@/lib/onboarding/constants';
import {
  formatBillingCycle,
  formatFeatureSummary,
  formatPlanTotal,
} from '@/lib/onboarding/format-plan';
import { getOnboardingSlugError, slugifyBusinessName } from '@/lib/onboarding/slug';
import {
  advanceWizardStep,
  canSkipStep,
  clampOnboardingStep,
} from '@/lib/onboarding/wizard-state';

type OnboardingWizardProps = {
  company: Company;
  siteId: string;
  site: Site;
};

export function OnboardingWizard({ company, siteId, site }: OnboardingWizardProps) {
  const router = useRouter();
  const plan = company.plan;

  const [step, setStep] = useState<OnboardingStepNumber>(
    clampOnboardingStep(company.onboardingStep),
  );
  const [businessName, setBusinessName] = useState(company.name || site.name);
  const [slug, setSlug] = useState(company.slug || site.slug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subdomain = slug ? `${slug}${CODEDPIXELS_SUBDOMAIN_SUFFIX}` : '';

  const handleBusinessNameChange = useCallback(
    (value: string) => {
      setBusinessName(value);
      if (!slugTouched) {
        setSlug(slugifyBusinessName(value));
      }
    },
    [slugTouched],
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugTouched(true);
    setSlug(slugifyBusinessName(value));
  }, []);

  const goNext = useCallback(
    (options?: { skip?: boolean }) => {
      setError(null);

      if (step === 2 && !options?.skip) {
        if (!businessName.trim()) {
          setError('Enter your business name to continue.');
          return;
        }
        const slugError = getOnboardingSlugError(slug);
        if (slugError) {
          setError(slugError);
          return;
        }
      }

      const result = advanceWizardStep(step, siteId, options);

      if (result.kind === 'complete') {
        router.push(result.redirectPath);
        return;
      }

      setStep(result.step);
    },
    [businessName, router, siteId, slug, step],
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-sm font-bold text-primary">
          Coded<span className="text-accent">Pixels</span>
        </p>
        <h1 className="text-2xl font-bold text-text">Welcome — let&apos;s finish setup</h1>
        <p className="text-sm text-text-muted">
          A few quick steps before you edit your homepage.
        </p>
      </div>

      <OnboardingProgress currentStep={step} />

      <Card className="space-y-6">
        {step === 1 ? (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text">Your plan</h2>
              <p className="text-sm text-text-muted">
                Confirm the package you chose at checkout.
              </p>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Template</dt>
                <dd className="font-medium text-text">{site.templateId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Add-ons</dt>
                <dd className="max-w-[14rem] text-right font-medium text-text">
                  {formatFeatureSummary(plan.featureIds)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Billing</dt>
                <dd className="font-medium text-text">{formatBillingCycle(plan)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Monthly total</dt>
                <dd className="tabular-nums font-semibold text-accent">
                  {formatPlanTotal(plan)}
                </dd>
              </div>
            </dl>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text">Name your business</h2>
              <p className="text-sm text-text-muted">
                We&apos;ll use this on your site and to create your subdomain.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="business-name"
                  className="block text-sm font-medium text-text"
                >
                  Business name
                </label>
                <input
                  id="business-name"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) => handleBusinessNameChange(event.target.value)}
                  className="mt-1 w-full rounded-card border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  autoComplete="organization"
                />
              </div>
              <div>
                <label htmlFor="site-slug" className="block text-sm font-medium text-text">
                  Subdomain
                </label>
                <div className="mt-1 flex rounded-card border border-border bg-surface focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
                  <input
                    id="site-slug"
                    name="slug"
                    type="text"
                    value={slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    className="min-w-0 flex-1 rounded-l-card border-0 bg-transparent px-3 py-2 text-sm text-text focus:outline-none"
                    spellCheck={false}
                  />
                  <span className="flex items-center rounded-r-card bg-background px-3 text-xs text-text-muted">
                    {CODEDPIXELS_SUBDOMAIN_SUFFIX}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text">Your domain</h2>
              <p className="text-sm text-text-muted">
                Your site will be live at this address. Custom domains come in a
                later update.
              </p>
            </div>
            <div className="rounded-card border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-text">
                {subdomain || `your-name${CODEDPIXELS_SUBDOMAIN_SUFFIX}`}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Connect a custom domain later from your dashboard.
              </p>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text">Edit your homepage</h2>
              <p className="text-sm text-text-muted">
                Your template draft is ready. Open the builder to customise your
                first page.
              </p>
            </div>
            <p className="text-sm text-text">
              You can return to the dashboard any time to manage pages and publish.
            </p>
          </>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {canSkipStep(step) ? (
            <Button type="button" variant="secondary" onClick={() => goNext({ skip: true })}>
              Skip for now
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" variant="primary" onClick={() => goNext()}>
            {step === 4 ? 'Open builder' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
