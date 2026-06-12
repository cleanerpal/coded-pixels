'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { Company, Site } from '@codedpixels/shared-types';

import { useAuth } from '@/lib/auth/use-auth';
import { getFirebaseFirestore } from '@/lib/firebase';
import { MOCK_COMPANY_PLAN } from '@/lib/onboarding/mock-provisioning';
import { fetchTenantContext } from '@/lib/onboarding/tenant-client';

export interface DashboardTenantState {
  loading: boolean;
  companyId: string | null;
  company: Company | null;
  siteId: string | null;
  site: Site | null;
  isMock: boolean;
}

function createMockDashboardTenant(): Pick<
  DashboardTenantState,
  'companyId' | 'company' | 'siteId' | 'site'
> {
  const now = new Date().toISOString();
  return {
    companyId: 'mock-company',
    company: {
      name: 'My Business',
      slug: 'my-business',
      ownerUid: 'mock-owner-uid',
      status: 'trialing',
      plan: MOCK_COMPANY_PLAN,
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

function useMockDashboard(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_PROVISIONING === 'true' ||
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
  );
}

/** Loads company + primary site for dashboard feature pages (B8-001). */
export function useDashboardTenant(): DashboardTenantState {
  const { user, loading: authLoading, isMock: authMock } = useAuth();
  const isMock = useMockDashboard() || authMock;
  const [state, setState] = useState<DashboardTenantState>({
    loading: true,
    companyId: null,
    company: null,
    siteId: null,
    site: null,
    isMock,
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isMock || !user) {
      const mock = createMockDashboardTenant();
      setState({
        loading: false,
        ...mock,
        isMock: true,
      });
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const db = getFirebaseFirestore();
        const userSnap = await getDoc(doc(db, 'users', user!.uid));

        const defaultCompanyId = userSnap.data()?.defaultCompanyId as
          | string
          | undefined;

        if (!defaultCompanyId) {
          if (!cancelled) {
            setState({
              loading: false,
              companyId: null,
              company: null,
              siteId: null,
              site: null,
              isMock: false,
            });
          }
          return;
        }

        const context = await fetchTenantContext(db, defaultCompanyId);

        if (cancelled) {
          return;
        }

        if (!context) {
          setState({
            loading: false,
            companyId: null,
            company: null,
            siteId: null,
            site: null,
            isMock: false,
          });
          return;
        }

        setState({
          loading: false,
          companyId: defaultCompanyId,
          company: context.company,
          siteId: context.siteId,
          site: context.site,
          isMock: false,
        });
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            companyId: null,
            company: null,
            siteId: null,
            site: null,
            isMock: false,
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isMock, user]);

  return state;
}
