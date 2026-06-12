import type { ConfigSnapshot, FeatureId } from '@codedpixels/shared-types';
import {
  basePriceId,
  buildPriceToFeatureIdMap,
  oneTimeCustomTemplatePriceId,
  priceId,
  type StripeMode,
} from './stripeCatalogue';

export interface StripeCheckoutLineItem {
  price: string;
  quantity: number;
}

/**
 * Build Extension checkout_sessions line_items from config snapshot.
 * stripe-catalogue.md §11 — subscription items + optional one-time £149.
 */
export function buildCheckoutLineItems(
  config: ConfigSnapshot,
  mode?: StripeMode,
): StripeCheckoutLineItem[] {
  const billingCycle = config.billingCycle;
  const items: StripeCheckoutLineItem[] = [
    { price: basePriceId(billingCycle, mode), quantity: 1 },
  ];

  for (const featureId of config.featureIds) {
    if (
      featureId === 'custom-template' &&
      config.customTemplateBilling === 'one-time'
    ) {
      continue;
    }

    items.push({
      price: priceId(featureId, billingCycle, mode),
      quantity: 1,
    });
  }

  if (
    config.featureIds.includes('custom-template') &&
    config.customTemplateBilling === 'one-time'
  ) {
    items.push({
      price: oneTimeCustomTemplatePriceId(mode),
      quantity: 1,
    });
  }

  return items;
}

/** Extract recurring feature IDs from subscription price IDs (excludes base). */
export function featureIdsFromSubscriptionPrices(
  subscriptionPriceIds: string[],
  billingCycle: ConfigSnapshot['billingCycle'],
  mode?: StripeMode,
): FeatureId[] {
  const priceToFeature = buildPriceToFeatureIdMap(billingCycle, mode);
  const base = basePriceId(billingCycle, mode);
  const selected: FeatureId[] = [];

  for (const id of subscriptionPriceIds) {
    if (id === base) {
      continue;
    }

    const featureId = priceToFeature.get(id);
    if (featureId) {
      selected.push(featureId);
    }
  }

  return [...new Set(selected)].sort((a, b) => a.localeCompare(b));
}

export function expectedRecurringPriceIds(
  config: ConfigSnapshot,
  mode?: StripeMode,
): string[] {
  return buildCheckoutLineItems(config, mode)
    .filter((item) => item.price !== oneTimeCustomTemplatePriceId(mode))
    .map((item) => item.price);
}
