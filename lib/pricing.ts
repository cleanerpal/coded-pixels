import {
  BASE_PLAN_MONTHLY_PENCE,
  FEATURES_BY_ID,
  ONE_TIME_CUSTOM_TEMPLATE_PENCE,
} from '@/lib/features';
import { PACKAGES_BY_ID } from '@/lib/packages';
import type { ConfigState, LineItem, PackageId } from '@/types';

/** Recurring monthly total in pence — excludes one-time £149 (Q13). */
export function monthlyTotalPence(config: ConfigState): number {
  let total = BASE_PLAN_MONTHLY_PENCE;

  for (const featureId of config.featureIds) {
    if (
      featureId === 'custom-template' &&
      config.customTemplateBilling === 'one-time'
    ) {
      continue;
    }
    total += FEATURES_BY_ID[featureId].monthlyPence;
  }

  return total;
}

/**
 * Annual total in pence — exact integer order per ENG-004:
 * Math.round(monthlyTotalPence * 12 * 83 / 100)
 */
export function annualTotalPence(config: ConfigState): number {
  const monthly = monthlyTotalPence(config);
  return Math.round((monthly * 12 * 83) / 100);
}

/** One-time fees in pence (checkout only — Q13). */
export function oneTimeFeesPence(config: ConfigState): number {
  if (
    config.featureIds.includes('custom-template') &&
    config.customTemplateBilling === 'one-time'
  ) {
    return ONE_TIME_CUSTOM_TEMPLATE_PENCE;
  }
  return 0;
}

/** One-time line items for checkout summary (Q13). */
export function getOneTimeLineItems(config: ConfigState): LineItem[] {
  const amount = oneTimeFeesPence(config);
  if (amount === 0) {
    return [];
  }

  return [
    {
      id: 'custom-template-one-time',
      label: 'Custom Template Design (one-time)',
      amountPence: amount,
      kind: 'one-time',
    },
  ];
}

/** Recurring line items for configurator / checkout summary. */
export function getLineItems(config: ConfigState): LineItem[] {
  const items: LineItem[] = [
    {
      id: 'base',
      label: 'Base plan',
      amountPence: BASE_PLAN_MONTHLY_PENCE,
      kind: 'base',
    },
  ];

  for (const featureId of config.featureIds) {
    if (
      featureId === 'custom-template' &&
      config.customTemplateBilling === 'one-time'
    ) {
      continue;
    }

    const feature = FEATURES_BY_ID[featureId];
    items.push({
      id: featureId,
      label: feature.name,
      amountPence: feature.monthlyPence,
      kind: 'feature',
    });
  }

  return items;
}

/** Apply a package preset to config state (Q10 — user may toggle off after). */
export function applyPackage(packageId: PackageId): ConfigState {
  const pkg = PACKAGES_BY_ID[packageId];

  return {
    templateId: null,
    featureIds: [...pkg.presetFeatureIds],
    billingCycle: 'monthly',
    packageId,
  };
}
