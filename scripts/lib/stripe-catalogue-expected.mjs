/**
 * Expected Stripe catalogue — docs/planning/stripe-catalogue.md §4–§6.
 * Used by scripts/verify-stripe-catalogue.mjs (PL-002).
 *
 * Aligned with Dr. Owen Reilly on Q63.
 */

/** @typedef {'base' | 'feature' | 'one-time'} CatalogueKind */

/**
 * @typedef {Object} ExpectedPrice
 * @property {string} slug
 * @property {CatalogueKind} kind
 * @property {string} [featureId]
 * @property {number} [monthlyPence]
 * @property {number} [annualPence]
 * @property {number} [onetimePence]
 * @property {string} productIdTest
 * @property {string} [monthlyPriceIdTest]
 * @property {string} [annualPriceIdTest]
 * @property {string} [onetimePriceIdTest]
 */

/** @type {ExpectedPrice[]} */
export const EXPECTED_CATALOGUE = [
  {
    slug: 'base',
    kind: 'base',
    monthlyPence: 999,
    annualPence: 9950,
    productIdTest: 'prod_cp_base_test',
    monthlyPriceIdTest: 'price_cp_base_monthly_test',
    annualPriceIdTest: 'price_cp_base_annual_test',
  },
  {
    slug: 'crm',
    kind: 'feature',
    featureId: 'crm',
    monthlyPence: 499,
    annualPence: 4970,
    productIdTest: 'prod_cp_crm_test',
    monthlyPriceIdTest: 'price_cp_crm_monthly_test',
    annualPriceIdTest: 'price_cp_crm_annual_test',
  },
  {
    slug: 'email-automation',
    kind: 'feature',
    featureId: 'email-automation',
    monthlyPence: 599,
    annualPence: 5966,
    productIdTest: 'prod_cp_email_automation_test',
    monthlyPriceIdTest: 'price_cp_email_automation_monthly_test',
    annualPriceIdTest: 'price_cp_email_automation_annual_test',
  },
  {
    slug: 'analytics-seo',
    kind: 'feature',
    featureId: 'analytics-seo',
    monthlyPence: 399,
    annualPence: 3974,
    productIdTest: 'prod_cp_analytics_seo_test',
    monthlyPriceIdTest: 'price_cp_analytics_seo_monthly_test',
    annualPriceIdTest: 'price_cp_analytics_seo_annual_test',
  },
  {
    slug: 'sms',
    kind: 'feature',
    featureId: 'sms',
    monthlyPence: 299,
    annualPence: 2978,
    productIdTest: 'prod_cp_sms_test',
    monthlyPriceIdTest: 'price_cp_sms_monthly_test',
    annualPriceIdTest: 'price_cp_sms_annual_test',
  },
  {
    slug: 'ecommerce',
    kind: 'feature',
    featureId: 'ecommerce',
    monthlyPence: 999,
    annualPence: 9950,
    productIdTest: 'prod_cp_ecommerce_test',
    monthlyPriceIdTest: 'price_cp_ecommerce_monthly_test',
    annualPriceIdTest: 'price_cp_ecommerce_annual_test',
  },
  {
    slug: 'vat-mtd',
    kind: 'feature',
    featureId: 'vat-mtd',
    monthlyPence: 499,
    annualPence: 4970,
    productIdTest: 'prod_cp_vat_mtd_test',
    monthlyPriceIdTest: 'price_cp_vat_mtd_monthly_test',
    annualPriceIdTest: 'price_cp_vat_mtd_annual_test',
  },
  {
    slug: 'booking',
    kind: 'feature',
    featureId: 'booking',
    monthlyPence: 699,
    annualPence: 6962,
    productIdTest: 'prod_cp_booking_test',
    monthlyPriceIdTest: 'price_cp_booking_monthly_test',
    annualPriceIdTest: 'price_cp_booking_annual_test',
  },
  {
    slug: 'ai-content',
    kind: 'feature',
    featureId: 'ai-content',
    monthlyPence: 399,
    annualPence: 3974,
    productIdTest: 'prod_cp_ai_content_test',
    monthlyPriceIdTest: 'price_cp_ai_content_monthly_test',
    annualPriceIdTest: 'price_cp_ai_content_annual_test',
  },
  {
    slug: 'custom-template-recurring',
    kind: 'feature',
    featureId: 'custom-template',
    monthlyPence: 1499,
    annualPence: 14930,
    productIdTest: 'prod_cp_custom_template_recurring_test',
    monthlyPriceIdTest: 'price_cp_custom_template_recurring_monthly_test',
    annualPriceIdTest: 'price_cp_custom_template_recurring_annual_test',
  },
  {
    slug: 'white-label',
    kind: 'feature',
    featureId: 'white-label',
    monthlyPence: 999,
    annualPence: 9950,
    productIdTest: 'prod_cp_white_label_test',
    monthlyPriceIdTest: 'price_cp_white_label_monthly_test',
    annualPriceIdTest: 'price_cp_white_label_annual_test',
  },
  {
    slug: 'priority-support',
    kind: 'feature',
    featureId: 'priority-support',
    monthlyPence: 499,
    annualPence: 4970,
    productIdTest: 'prod_cp_priority_support_test',
    monthlyPriceIdTest: 'price_cp_priority_support_monthly_test',
    annualPriceIdTest: 'price_cp_priority_support_annual_test',
  },
  {
    slug: 'custom-template-onetime',
    kind: 'one-time',
    onetimePence: 14900,
    productIdTest: 'prod_cp_custom_template_onetime_test',
    onetimePriceIdTest: 'price_cp_custom_template_onetime_test',
  },
];

/**
 * @param {'test' | 'live'} mode
 * @returns {string}
 */
export function toModeId(testId) {
  return testId.replace(/_test$/, '_live');
}

/**
 * @param {'test' | 'live'} mode
 * @returns {Set<string>}
 */
export function expectedPriceIds(mode = 'test') {
  const ids = new Set();
  for (const entry of EXPECTED_CATALOGUE) {
    if (entry.monthlyPriceIdTest) {
      ids.add(mode === 'live' ? toModeId(entry.monthlyPriceIdTest) : entry.monthlyPriceIdTest);
    }
    if (entry.annualPriceIdTest) {
      ids.add(mode === 'live' ? toModeId(entry.annualPriceIdTest) : entry.annualPriceIdTest);
    }
    if (entry.onetimePriceIdTest) {
      ids.add(mode === 'live' ? toModeId(entry.onetimePriceIdTest) : entry.onetimePriceIdTest);
    }
  }
  return ids;
}

/**
 * @param {'test' | 'live'} mode
 * @returns {Set<string>}
 */
export function expectedProductIds(mode = 'test') {
  const ids = new Set();
  for (const entry of EXPECTED_CATALOGUE) {
    ids.add(mode === 'live' ? toModeId(entry.productIdTest) : entry.productIdTest);
  }
  return ids;
}
