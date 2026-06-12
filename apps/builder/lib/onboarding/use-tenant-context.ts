'use client';

import { useEffect, useState } from 'react';

import type { Company, ProvisioningJob, Site } from '@codedpixels/shared-types';

import { getFirebaseFirestore } from '@/lib/firebase';
import { MOCK_COMPANY_PLAN } from '@/lib/onboarding/mock-provisioning';
import { fetchTenantContext } from '@/lib/onboarding/tenant-client';

export type TenantLoadState =
  | { status: 'loading' }
  | { status: 'ready'; company: Company; siteId: string; site: Site }
  | { status: 'error'; message: string };

function createMockTenantContext(): TenantLoadState {
  const now = new Date().toISOString();
  return {
    status: 'ready',
    company: {
      name: 'My Business',
      slug: 'my-business',
      ownerUid: 'mock-owner-uid',
      status: 'trialing',
      plan: MOCK_COMPANY_PLAN,
      onboardingStep: 1,
      createdAt: now,
      updatedAt: now,
    },
    siteId: 'mock-site',
    site: {
      name: 'My Business',
      slug: 'my-business',
      templateId: 'sparkle-clean',
      featureIds: MOCK_COMPANY_PLAN.featureIds,
      status: 'draft',
      homepagePageId: 'home',
      createdAt: now,
      updatedAt: now,
    },
  };
}

function useMockTenant(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_PROVISIONING === 'true' ||
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
  );
}

export function useTenantContext(job: ProvisioningJob | null): TenantLoadState {
  const isMock = useMockTenant();
  const [state, setState] = useState<TenantLoadState>({ status: 'loading' });

  useEffect(() => {
    if (!job || job.status !== 'complete' || !job.companyId) {
      setState({ status: 'error', message: 'Provisioning did not return a company.' });
      return;
    }

    if (isMock || job.companyId === 'mock-company') {
      setState(createMockTenantContext());
      return;
    }

    let cancelled = false;

    const companyId = job.companyId;
    const siteId = job.siteId;

    async function load() {
      try {
        const context = await fetchTenantContext(
          getFirebaseFirestore(),
          companyId,
          siteId,
        );

        if (cancelled) {
          return;
        }

        if (!context) {
          setState({
            status: 'error',
            message: 'We could not load your workspace. Try again shortly.',
          });
          return;
        }

        setState({
          status: 'ready',
          company: context.company,
          siteId: context.siteId,
          site: context.site,
        });
      } catch {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'Could not load your workspace. Please try again.',
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [isMock, job]);

  return state;
}
