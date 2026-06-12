import { describe, expect, it } from 'vitest';

import {
  GROWTH_PRESET_FEATURE_IDS,
  PRO_PRESET_FEATURE_IDS,
} from '@/lib/packages';
import type { ConfigState } from '@/types';

import {
  annualMonthlyEquivalentPence,
  annualSavingsPence,
  annualTotalPence,
  applyPackage,
  getLineItems,
  getOneTimeLineItems,
  monthlyTotalPence,
  oneTimeFeesPence,
} from './pricing';

function config(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    templateId: null,
    featureIds: [],
    billingCycle: 'monthly',
    ...overrides,
  };
}

describe('monthlyTotalPence', () => {
  it('returns base plan only when no features selected', () => {
    expect(monthlyTotalPence(config())).toBe(999);
  });

  it('sums each add-on in integer pence', () => {
    expect(
      monthlyTotalPence(config({ featureIds: ['crm', 'sms', 'booking'] })),
    ).toBe(999 + 499 + 299 + 699);
  });

  it('Q1 — Growth preset live total is 2496 pence (card shows 2499)', () => {
    const growth = applyPackage('growth');
    expect(monthlyTotalPence(growth)).toBe(2496);
    expect(growth.featureIds).toEqual(GROWTH_PRESET_FEATURE_IDS);
  });

  it('Q54 — Pro preset live total is 3994 pence (card shows 3999)', () => {
    const pro = applyPackage('pro');
    expect(monthlyTotalPence(pro)).toBe(3994);
    expect(pro.featureIds).toEqual(PRO_PRESET_FEATURE_IDS);
  });

  it('Q10 — toggling off a preset feature reduces live total', () => {
    const modified = config({
      featureIds: ['crm', 'email-automation'],
      packageId: 'growth',
    });
    expect(monthlyTotalPence(modified)).toBe(999 + 499 + 599);
  });
});

describe('custom template billing (Q2, Q13)', () => {
  it('includes recurring £14.99/mo by default', () => {
    expect(
      monthlyTotalPence(config({ featureIds: ['custom-template'] })),
    ).toBe(999 + 1499);
    expect(oneTimeFeesPence(config({ featureIds: ['custom-template'] }))).toBe(
      0,
    );
    expect(
      getOneTimeLineItems(config({ featureIds: ['custom-template'] })),
    ).toEqual([]);
  });

  it('Q13 — one-time £149 excluded from monthly recurring total', () => {
    const oneTimeConfig = config({
      featureIds: ['custom-template'],
      customTemplateBilling: 'one-time',
    });

    expect(monthlyTotalPence(oneTimeConfig)).toBe(999);
    expect(oneTimeFeesPence(oneTimeConfig)).toBe(14900);
    expect(getOneTimeLineItems(oneTimeConfig)).toEqual([
      {
        id: 'custom-template-one-time',
        label: 'Custom Template Design (one-time)',
        amountPence: 14900,
        kind: 'one-time',
      },
    ]);
  });

  it('Q13 — one-time fee does not appear in recurring line items', () => {
    const oneTimeConfig = config({
      featureIds: ['custom-template', 'crm'],
      customTemplateBilling: 'one-time',
    });

    const items = getLineItems(oneTimeConfig);
    expect(items.map((item) => item.id)).toEqual(['base', 'crm']);
    expect(items.reduce((sum, item) => sum + item.amountPence, 0)).toBe(1498);
  });
});

describe('annualTotalPence', () => {
  it('uses exact integer formula: Math.round(monthly * 12 * 83 / 100)', () => {
    const monthly = 2496;
    expect(Math.round((monthly * 12 * 83) / 100)).toBe(24860);
    expect(annualTotalPence(applyPackage('growth'))).toBe(24860);
  });

  it('applies 17% annual discount for starter base plan', () => {
    expect(annualTotalPence(config())).toBe(Math.round((999 * 12 * 83) / 100));
    expect(annualTotalPence(config())).toBe(9950);
  });

  it('Q54 — Pro annual total uses live 3994 pence monthly', () => {
    expect(annualTotalPence(applyPackage('pro'))).toBe(
      Math.round((3994 * 12 * 83) / 100),
    );
    expect(annualTotalPence(applyPackage('pro'))).toBe(39780);
  });

  it('Q13 — annual calc ignores one-time custom template fee', () => {
    const oneTimeConfig = config({
      featureIds: ['custom-template', 'crm'],
      customTemplateBilling: 'one-time',
      billingCycle: 'annual',
    });

    expect(annualTotalPence(oneTimeConfig)).toBe(
      Math.round((1498 * 12 * 83) / 100),
    );
    expect(oneTimeFeesPence(oneTimeConfig)).toBe(14900);
  });
});

describe('annualMonthlyEquivalentPence', () => {
  it('uses Math.round(monthly * 83 / 100) for display (Q6)', () => {
    expect(annualMonthlyEquivalentPence(applyPackage('growth'))).toBe(
      Math.round((2496 * 83) / 100),
    );
    expect(annualMonthlyEquivalentPence(applyPackage('growth'))).toBe(2072);
  });

  it('Q13 — one-time custom template fee excluded from equivalent', () => {
    const oneTimeConfig = config({
      featureIds: ['custom-template', 'crm'],
      customTemplateBilling: 'one-time',
    });

    expect(annualMonthlyEquivalentPence(oneTimeConfig)).toBe(
      Math.round((1498 * 83) / 100),
    );
    expect(oneTimeFeesPence(oneTimeConfig)).toBe(14900);
  });
});

describe('annualSavingsPence', () => {
  it('returns integer pence savings vs paying monthly for 12 months (Q6)', () => {
    const growth = applyPackage('growth');
    expect(annualSavingsPence(growth)).toBe(
      monthlyTotalPence(growth) * 12 - annualTotalPence(growth),
    );
    expect(annualSavingsPence(growth)).toBe(5092);
  });

  it('matches 17% of recurring annual spend in integer pence', () => {
    expect(annualSavingsPence(config())).toBe(
      Math.round((999 * 12 * 17) / 100),
    );
    expect(annualSavingsPence(config())).toBe(2038);
  });

  it('Q13 — one-time £149 excluded from savings calc', () => {
    const oneTimeConfig = config({
      featureIds: ['custom-template', 'crm'],
      customTemplateBilling: 'one-time',
      billingCycle: 'annual',
    });

    expect(annualSavingsPence(oneTimeConfig)).toBe(
      monthlyTotalPence(oneTimeConfig) * 12 - annualTotalPence(oneTimeConfig),
    );
    expect(oneTimeFeesPence(oneTimeConfig)).toBe(14900);
  });
});

describe('applyPackage', () => {
  it('starter applies empty preset', () => {
    const starter = applyPackage('starter');
    expect(starter.featureIds).toEqual([]);
    expect(monthlyTotalPence(starter)).toBe(999);
  });

  it('custom clears presets', () => {
    const custom = applyPackage('custom');
    expect(custom.featureIds).toEqual([]);
    expect(custom.packageId).toBe('custom');
  });
});
