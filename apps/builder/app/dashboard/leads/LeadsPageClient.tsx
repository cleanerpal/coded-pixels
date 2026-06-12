'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { LeadsInbox } from '@/components/dashboard/leads/LeadsInbox';
import { useDashboardTenant } from '@/lib/dashboard/use-dashboard-tenant';

export function LeadsPageClient() {
  const tenant = useDashboardTenant();

  if (tenant.loading) {
    return (
      <DashboardShell
        title="Leads"
        description="Review and manage form submissions from your live site."
      >
        <p className="text-sm text-text-muted">Loading workspace…</p>
      </DashboardShell>
    );
  }

  if (!tenant.company || !tenant.companyId || !tenant.siteId) {
    return (
      <DashboardShell
        title="Leads"
        description="Review and manage form submissions from your live site."
      >
        <p className="text-sm text-text-muted">
          We could not load your workspace. Complete onboarding first.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Leads"
      description="Review and manage form submissions from your live site."
    >
      <LeadsInbox
        companyId={tenant.companyId}
        siteId={tenant.siteId}
        featureIds={tenant.company.plan.featureIds}
        isMock={tenant.isMock}
      />
    </DashboardShell>
  );
}
