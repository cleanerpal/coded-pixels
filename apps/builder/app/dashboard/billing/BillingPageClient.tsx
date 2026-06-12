'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ManageBillingButton } from '@/components/dashboard/billing/ManageBillingButton';

export function BillingPageClient() {
  return (
    <DashboardShell
      title="Billing"
      description="Manage your subscription, payment method, and invoices."
    >
      <ManageBillingButton />
    </DashboardShell>
  );
}
