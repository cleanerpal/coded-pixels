import { BASE_PLAN_MONTHLY_PENCE, FEATURES } from '@/lib/features';
import { PACKAGES, PACKAGES_BY_ID } from '@/lib/packages';
import {
  annualMonthlyEquivalentPence,
  applyPackage,
  monthlyTotalPence,
} from '@/lib/pricing';
import type { BillingCycle, FeatureId, PackageId } from '@/types';

/** Base plan inclusions — all packages include these (project plan §3). */
export const BASE_PLAN_ROWS = [
  'Professional website + hosting',
  'Custom domain + SSL',
  'Mobile responsive',
  'Basic contact / quote form',
  'Access to template library',
] as const;

export { FEATURES, PACKAGES };

export function formatMonthlyPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}/mo`;
}

/** Deep link to configurator with package preset (Q21). */
export function configurePlanHref(packageId: PackageId): string {
  return `/?package=${packageId}#configurator`;
}

export function packageIncludesFeature(
  packageId: PackageId,
  featureId: FeatureId,
): boolean {
  if (packageId === 'custom') {
    return false;
  }

  return PACKAGES_BY_ID[packageId].presetFeatureIds.includes(featureId);
}

/** Live engine total for a package preset (Q1, Q54). */
export function packageLiveMonthlyPence(packageId: PackageId): number {
  if (packageId === 'custom') {
    return BASE_PLAN_MONTHLY_PENCE;
  }

  return monthlyTotalPence(applyPackage(packageId));
}

export function packageDisplayPrice(
  packageId: PackageId,
  billingCycle: BillingCycle,
): { primary: string; secondary: string | null } {
  const pkg = PACKAGES_BY_ID[packageId];
  const starterConfig = applyPackage('starter');

  if (pkg.cardDisplayMonthlyPence === null) {
    const from = formatMonthlyPrice(BASE_PLAN_MONTHLY_PENCE);
    if (billingCycle === 'annual') {
      const annualMonthly = annualMonthlyEquivalentPence(starterConfig);
      return {
        primary: 'Build your own',
        secondary: `From ${from} · ${formatMonthlyPrice(annualMonthly)} billed annually`,
      };
    }

    return { primary: 'Build your own', secondary: `From ${from}` };
  }

  const config = applyPackage(packageId);
  const liveMonthly = monthlyTotalPence(config);

  if (billingCycle === 'annual') {
    const annualMonthly = annualMonthlyEquivalentPence(config);

    return {
      primary: `${formatMonthlyPrice(annualMonthly)} billed annually`,
      secondary: `Save 17% vs ${formatMonthlyPrice(liveMonthly)}/mo on monthly billing`,
    };
  }

  return {
    primary: formatMonthlyPrice(pkg.cardDisplayMonthlyPence),
    secondary: null,
  };
}

export function cardDiffersFromLive(packageId: PackageId): boolean {
  const pkg = PACKAGES_BY_ID[packageId];
  if (pkg.cardDisplayMonthlyPence === null) {
    return false;
  }

  return pkg.cardDisplayMonthlyPence !== packageLiveMonthlyPence(packageId);
}
