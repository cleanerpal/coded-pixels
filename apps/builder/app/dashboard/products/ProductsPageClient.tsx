'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ProductsEditor } from '@/components/dashboard/products/ProductsEditor';
import { useDashboardTenant } from '@/lib/dashboard/use-dashboard-tenant';

export function ProductsPageClient() {
  const tenant = useDashboardTenant();

  if (tenant.loading) {
    return (
      <DashboardShell
        title="Products"
        description="Manage products for your ecommerce store."
      >
        <p className="text-sm text-text-muted">Loading workspace…</p>
      </DashboardShell>
    );
  }

  if (!tenant.company || !tenant.companyId || !tenant.siteId) {
    return (
      <DashboardShell
        title="Products"
        description="Manage products for your ecommerce store."
      >
        <p className="text-sm text-text-muted">
          We could not load your workspace. Complete onboarding first.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Products"
      description="Manage products for your ecommerce store."
    >
      <ProductsEditor
        companyId={tenant.companyId}
        siteId={tenant.siteId}
        featureIds={tenant.company.plan.featureIds}
        isMock={tenant.isMock}
      />
    </DashboardShell>
  );
}
