/**
 * Stripe Price ID catalogue — docs/planning/stripe-catalogue.md §4–§6.
 * Placeholder test-mode IDs until Dashboard provisioning (§3).
 *
 * Aligned with Dr. Owen Reilly on Q63.
 */
import type { BillingCycle, FeatureId } from '@codedpixels/shared-types';

export type StripeMode = 'test' | 'live';

export type CatalogueSlug =
  | 'base'
  | FeatureId
  | 'custom-template-onetime';

const TEST_PRICE_IDS: Record<
  CatalogueSlug,
  { monthly?: string; annual?: string; onetime?: string }
> = {
  base: {
    monthly: 'price_cp_base_monthly_test',
    annual: 'price_cp_base_annual_test',
  },
  crm: {
    monthly: 'price_cp_crm_monthly_test',
    annual: 'price_cp_crm_annual_test',
  },
  'email-automation': {
    monthly: 'price_cp_email_automation_monthly_test',
    annual: 'price_cp_email_automation_annual_test',
  },
  'analytics-seo': {
    monthly: 'price_cp_analytics_seo_monthly_test',
    annual: 'price_cp_analytics_seo_annual_test',
  },
  sms: {
    monthly: 'price_cp_sms_monthly_test',
    annual: 'price_cp_sms_annual_test',
  },
  ecommerce: {
    monthly: 'price_cp_ecommerce_monthly_test',
    annual: 'price_cp_ecommerce_annual_test',
  },
  'vat-mtd': {
    monthly: 'price_cp_vat_mtd_monthly_test',
    annual: 'price_cp_vat_mtd_annual_test',
  },
  booking: {
    monthly: 'price_cp_booking_monthly_test',
    annual: 'price_cp_booking_annual_test',
  },
  'ai-content': {
    monthly: 'price_cp_ai_content_monthly_test',
    annual: 'price_cp_ai_content_annual_test',
  },
  'custom-template': {
    monthly: 'price_cp_custom_template_recurring_monthly_test',
    annual: 'price_cp_custom_template_recurring_annual_test',
  },
  'white-label': {
    monthly: 'price_cp_white_label_monthly_test',
    annual: 'price_cp_white_label_annual_test',
  },
  'priority-support': {
    monthly: 'price_cp_priority_support_monthly_test',
    annual: 'price_cp_priority_support_annual_test',
  },
  'custom-template-onetime': {
    onetime: 'price_cp_custom_template_onetime_test',
  },
};

function resolveMode(): StripeMode {
  return process.env.STRIPE_MODE === 'live' ? 'live' : 'test';
}

function toLiveId(testId: string): string {
  return testId.replace(/_test$/, '_live');
}

export function priceId(
  slug: CatalogueSlug,
  billingCycle: BillingCycle | 'onetime',
  mode: StripeMode = resolveMode(),
): string {
  const entry = TEST_PRICE_IDS[slug];
  if (!entry) {
    throw new Error(`Unknown catalogue slug: ${slug}`);
  }

  let id: string | undefined;
  if (billingCycle === 'onetime') {
    id = entry.onetime;
  } else {
    id = billingCycle === 'annual' ? entry.annual : entry.monthly;
  }

  if (!id) {
    throw new Error(`No ${billingCycle} price for slug: ${slug}`);
  }

  return mode === 'live' ? toLiveId(id) : id;
}

/** Reverse map Stripe Price ID → feature ID (excludes base and one-time). */
export function buildPriceToFeatureIdMap(
  billingCycle: BillingCycle,
  mode: StripeMode = resolveMode(),
): Map<string, FeatureId> {
  const featureIds = Object.keys(TEST_PRICE_IDS).filter(
    (slug): slug is FeatureId =>
      slug !== 'base' && slug !== 'custom-template-onetime',
  );

  const map = new Map<string, FeatureId>();
  for (const featureId of featureIds) {
    map.set(priceId(featureId, billingCycle, mode), featureId);
  }

  return map;
}

export function basePriceId(
  billingCycle: BillingCycle,
  mode: StripeMode = resolveMode(),
): string {
  return priceId('base', billingCycle, mode);
}

export function oneTimeCustomTemplatePriceId(
  mode: StripeMode = resolveMode(),
): string {
  return priceId('custom-template-onetime', 'onetime', mode);
}
