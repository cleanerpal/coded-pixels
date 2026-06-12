import { describe, expect, it } from 'vitest';

import { GROWTH_PRESET_FEATURE_IDS } from '@/lib/packages';
import type { ConfigState } from '@codedpixels/shared-types';

import {
  UNSET_TEMPLATE_ID,
  buildConfigSnapshot,
  formatAddonSummary,
  getTemplateDisplayName,
} from './config-snapshot';

function config(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    templateId: null,
    featureIds: [],
    billingCycle: 'monthly',
    ...overrides,
  };
}

describe('buildConfigSnapshot', () => {
  it('uses unset sentinel when template is missing (Q17 waitlist)', () => {
    expect(buildConfigSnapshot(config()).templateId).toBe(UNSET_TEMPLATE_ID);
  });

  it('captures template, features, billing, and monthly total', () => {
    const snapshot = buildConfigSnapshot(
      config({
        templateId: 'sparkle-clean',
        featureIds: ['crm', 'analytics-seo'],
        billingCycle: 'monthly',
        packageId: 'growth',
      }),
    );

    expect(snapshot).toEqual({
      templateId: 'sparkle-clean',
      featureIds: ['analytics-seo', 'crm'],
      billingCycle: 'monthly',
      monthlyTotalPence: 1897,
      packageId: 'growth',
    });
  });

  it('includes annual total and one-time fields when applicable', () => {
    expect(
      buildConfigSnapshot(
        config({
          templateId: 'sparkle-clean',
          featureIds: ['crm', 'custom-template'],
          billingCycle: 'annual',
          customTemplateBilling: 'one-time',
          packageId: 'growth',
        }),
      ),
    ).toEqual({
      templateId: 'sparkle-clean',
      featureIds: ['crm', 'custom-template'],
      billingCycle: 'annual',
      monthlyTotalPence: 1498,
      annualTotalPence: 14920,
      oneTimeFeesPence: 14900,
      customTemplateBilling: 'one-time',
      packageId: 'growth',
    });
  });

  it('includes annual total for growth preset annual billing', () => {
    const snapshot = buildConfigSnapshot(
      config({
        templateId: 'trade-pro',
        featureIds: [...GROWTH_PRESET_FEATURE_IDS],
        billingCycle: 'annual',
        packageId: 'growth',
      }),
    );

    expect(snapshot.monthlyTotalPence).toBe(2496);
    expect(snapshot.annualTotalPence).toBe(24860);
  });
});

describe('getTemplateDisplayName', () => {
  it('returns library template names, custom label, and unset label', () => {
    expect(getTemplateDisplayName('sparkle-clean')).toBe('Sparkle Clean');
    expect(getTemplateDisplayName('custom')).toBe('Custom Template');
    expect(getTemplateDisplayName(UNSET_TEMPLATE_ID)).toBe('Not selected');
  });
});

describe('formatAddonSummary', () => {
  it('summarises zero, few, and many add-ons', () => {
    expect(formatAddonSummary([])).toBe('No add-ons');
    expect(formatAddonSummary(['crm', 'booking'])).toBe(
      'CRM & Lead Management, Advanced Booking & Appointments',
    );
    expect(
      formatAddonSummary(['crm', 'booking', 'ecommerce', 'sms']),
    ).toBe(
      'CRM & Lead Management, Advanced Booking & Appointments, Ecommerce Store +1 more',
    );
  });
});
