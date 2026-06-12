import type { CompanyPlan } from '@codedpixels/shared-types';

export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatPlanTotal(plan: CompanyPlan): string {
  const amount =
    plan.billingCycle === 'annual' && plan.annualTotalPence
      ? Math.round(plan.annualTotalPence / 12)
      : plan.monthlyTotalPence;
  return `${formatPence(amount)}/mo`;
}

export function formatBillingCycle(plan: CompanyPlan): string {
  return plan.billingCycle === 'annual' ? 'Annual' : 'Monthly';
}

export function formatFeatureSummary(featureIds: string[]): string {
  if (featureIds.length === 0) {
    return 'No add-ons';
  }
  return featureIds
    .map((id) => id.replace(/-/g, ' '))
    .map((label) => label.charAt(0).toUpperCase() + label.slice(1))
    .join(', ');
}
