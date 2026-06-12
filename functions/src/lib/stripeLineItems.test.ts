import { describe, expect, it } from 'vitest';
import type { ConfigSnapshot } from '@codedpixels/shared-types';
import {
  buildCheckoutLineItems,
  expectedRecurringPriceIds,
  featureIdsFromSubscriptionPrices,
} from './stripeLineItems';
import { priceId } from './stripeCatalogue';

function snapshot(overrides: Partial<ConfigSnapshot> = {}): ConfigSnapshot {
  return {
    templateId: 'sparkle-clean',
    featureIds: [],
    billingCycle: 'monthly',
    monthlyTotalPence: 999,
    ...overrides,
  };
}

describe('buildCheckoutLineItems', () => {
  it('includes base plan only for Starter', () => {
    expect(buildCheckoutLineItems(snapshot())).toEqual([
      { price: 'price_cp_base_monthly_test', quantity: 1 },
    ]);
  });

  it('Q1 — Growth preset uses four subscription items', () => {
    const items = buildCheckoutLineItems(
      snapshot({
        featureIds: ['crm', 'email-automation', 'analytics-seo'],
        monthlyTotalPence: 2496,
        packageId: 'growth',
      }),
    );

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.price)).toEqual([
      'price_cp_base_monthly_test',
      'price_cp_crm_monthly_test',
      'price_cp_email_automation_monthly_test',
      'price_cp_analytics_seo_monthly_test',
    ]);
  });

  it('Q54 — Pro preset uses six subscription items', () => {
    const items = buildCheckoutLineItems(
      snapshot({
        featureIds: [
          'crm',
          'email-automation',
          'analytics-seo',
          'ecommerce',
          'vat-mtd',
        ],
        monthlyTotalPence: 3994,
        packageId: 'pro',
      }),
    );

    expect(items).toHaveLength(6);
  });

  it('Q13 — one-time custom template adds onetime price, not recurring', () => {
    const items = buildCheckoutLineItems(
      snapshot({
        featureIds: ['custom-template'],
        monthlyTotalPence: 999,
        customTemplateBilling: 'one-time',
        oneTimeFeesPence: 14900,
      }),
    );

    expect(items).toEqual([
      { price: 'price_cp_base_monthly_test', quantity: 1 },
      { price: 'price_cp_custom_template_onetime_test', quantity: 1 },
    ]);
  });

  it('uses annual price IDs when billingCycle is annual', () => {
    const items = buildCheckoutLineItems(
      snapshot({
        featureIds: ['crm'],
        billingCycle: 'annual',
        monthlyTotalPence: 1498,
        annualTotalPence: 14930,
      }),
    );

    expect(items).toEqual([
      { price: 'price_cp_base_annual_test', quantity: 1 },
      { price: 'price_cp_crm_annual_test', quantity: 1 },
    ]);
  });
});

describe('featureIdsFromSubscriptionPrices', () => {
  it('maps subscription price IDs back to featureIds', () => {
    const prices = [
      priceId('base', 'monthly'),
      priceId('crm', 'monthly'),
      priceId('sms', 'monthly'),
    ];

    expect(featureIdsFromSubscriptionPrices(prices, 'monthly')).toEqual([
      'crm',
      'sms',
    ]);
  });
});

describe('expectedRecurringPriceIds', () => {
  it('excludes one-time custom template price', () => {
    const ids = expectedRecurringPriceIds(
      snapshot({
        featureIds: ['custom-template'],
        customTemplateBilling: 'one-time',
      }),
    );

    expect(ids).toEqual(['price_cp_base_monthly_test']);
    expect(ids).not.toContain('price_cp_custom_template_onetime_test');
  });
});
