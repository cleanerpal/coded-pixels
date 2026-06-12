import { describe, expect, it } from 'vitest';

import {
  GROWTH_PRESET_FEATURE_IDS,
  PACKAGES_BY_ID,
  PRO_PRESET_FEATURE_IDS,
} from '@/lib/packages';
import { ALL_TEMPLATE_IDS, TEMPLATES } from '@/lib/templates';
import type { ConfigState, FeatureId } from '@codedpixels/shared-types';

import {
  STARTER_DEFAULTS,
  decodeConfigFromParams,
  decodeConfigFromQueryString,
  encodeConfigToParams,
  encodeConfigToQueryString,
} from './config-state';

function config(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    templateId: null,
    featureIds: [],
    billingCycle: 'monthly',
    ...overrides,
  };
}

/** Canonical shape after encode → decode (sorted features, omitted optional fields). */
function canonical(config: ConfigState): ConfigState {
  const sortedFeatures = [...new Set(config.featureIds)].sort((a, b) =>
    a.localeCompare(b),
  );
  const appliesCustomBilling =
    config.templateId === 'custom' ||
    sortedFeatures.includes('custom-template');

  const result: ConfigState = {
    templateId: config.templateId ?? null,
    featureIds: sortedFeatures,
    billingCycle: config.billingCycle ?? 'monthly',
  };

  if (config.packageId) {
    result.packageId = config.packageId;
  }

  if (appliesCustomBilling && config.customTemplateBilling === 'one-time') {
    result.customTemplateBilling = 'one-time';
  }

  return result;
}

function expectRoundTrip(input: ConfigState) {
  const encoded = encodeConfigToParams(input);
  const { config: decoded, hadInvalidParams } = decodeConfigFromParams(encoded);
  expect(hadInvalidParams).toBe(false);
  expect(decoded).toEqual(canonical(input));
}

describe('STARTER_DEFAULTS', () => {
  it('matches Starter package baseline', () => {
    expect(STARTER_DEFAULTS).toEqual({
      templateId: null,
      featureIds: [],
      billingCycle: 'monthly',
    });
  });

  it('returns defaults for empty params', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams(),
    );
    expect(decoded).toEqual(STARTER_DEFAULTS);
    expect(hadInvalidParams).toBe(false);
  });
});

describe('encodeConfigToParams', () => {
  it('matches project plan example URL params', () => {
    const params = encodeConfigToParams(
      config({
        templateId: 'sparkle-clean',
        featureIds: ['crm', 'email-automation'],
      }),
    );

    expect(params.get('template')).toBe('sparkle-clean');
    expect(params.get('features')).toBe('crm,email-automation');
    expect(params.has('billing')).toBe(false);
    expect(params.has('customTemplate')).toBe(false);
    expect(params.has('package')).toBe(false);
  });

  it('omits monthly billing and recurring custom template defaults', () => {
    const params = encodeConfigToParams(
      config({
        featureIds: ['custom-template'],
        customTemplateBilling: undefined,
      }),
    );

    expect(params.has('billing')).toBe(false);
    expect(params.has('customTemplate')).toBe(false);
  });

  it('includes annual billing and one-time custom template when set', () => {
    const params = encodeConfigToParams(
      config({
        billingCycle: 'annual',
        featureIds: ['custom-template'],
        customTemplateBilling: 'one-time',
      }),
    );

    expect(params.get('billing')).toBe('annual');
    expect(params.get('customTemplate')).toBe('one-time');
  });

  it('sorts and deduplicates features for stable URLs', () => {
    const params = encodeConfigToParams(
      config({
        featureIds: ['sms', 'crm', 'crm', 'booking'],
      }),
    );

    expect(params.get('features')).toBe('booking,crm,sms');
  });

  it('includes package id when present', () => {
    const params = encodeConfigToParams(
      config({ packageId: 'growth', featureIds: GROWTH_PRESET_FEATURE_IDS }),
    );

    expect(params.get('package')).toBe('growth');
  });
});

describe('decodeConfigFromParams — package deep links (Q21)', () => {
  it('applies Growth preset when only package=growth', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('package=growth'),
    );

    expect(hadInvalidParams).toBe(false);
    expect(decoded.packageId).toBe('growth');
    expect(decoded.featureIds).toEqual(GROWTH_PRESET_FEATURE_IDS);
  });

  it('applies Pro preset when only package=pro', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams('package=pro'),
    );

    expect(decoded.packageId).toBe('pro');
    expect(decoded.featureIds).toEqual(PRO_PRESET_FEATURE_IDS);
  });

  it('applies empty Starter preset when only package=starter', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams('package=starter'),
    );

    expect(decoded.packageId).toBe('starter');
    expect(decoded.featureIds).toEqual([]);
  });

  it('prefers explicit features over package preset (Q10 drift)', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams('package=growth&features=crm'),
    );

    expect(decoded.packageId).toBe('growth');
    expect(decoded.featureIds).toEqual(['crm']);
  });
});

describe('decodeConfigFromParams — partial restore (Q40)', () => {
  it('keeps valid fields when template is invalid', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams(
        'template=not-a-template&features=crm,sms&billing=annual',
      ),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.templateId).toBeNull();
    expect(decoded.featureIds).toEqual(['crm', 'sms']);
    expect(decoded.billingCycle).toBe('annual');
  });

  it('filters invalid feature ids and keeps valid ones', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('features=crm,not-real,booking'),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.featureIds).toEqual(['booking', 'crm']);
  });

  it('resets invalid billing to monthly default', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('billing=weekly&features=crm'),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.billingCycle).toBe('monthly');
    expect(decoded.featureIds).toEqual(['crm']);
  });

  it('ignores invalid package but keeps valid features param', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('package=enterprise&features=crm'),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.packageId).toBeUndefined();
    expect(decoded.featureIds).toEqual(['crm']);
  });

  it('rejects one-time customTemplate when custom-template not selected', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('template=sparkle-clean&customTemplate=one-time'),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.customTemplateBilling).toBeUndefined();
  });

  it('treats empty template param as invalid', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('template=&features=crm'),
    );

    expect(hadInvalidParams).toBe(true);
    expect(decoded.templateId).toBeNull();
    expect(decoded.featureIds).toEqual(['crm']);
  });

  it('treats features= as explicit empty selection', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
      new URLSearchParams('package=growth&features='),
    );

    expect(hadInvalidParams).toBe(false);
    expect(decoded.packageId).toBe('growth');
    expect(decoded.featureIds).toEqual([]);
  });

  it('accepts plain Record input (Next.js searchParams shape)', () => {
    const { config: decoded, hadInvalidParams } = decodeConfigFromParams({
      template: 'sparkle-clean',
      features: ['crm', 'email-automation'],
      billing: 'annual',
    });

    expect(hadInvalidParams).toBe(false);
    expect(decoded.templateId).toBe('sparkle-clean');
    expect(decoded.featureIds).toEqual(['crm', 'email-automation']);
    expect(decoded.billingCycle).toBe('annual');
  });
});

describe('custom template billing (Q2, Q13, Q58)', () => {
  it('decodes one-time when custom-template feature is selected', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams(
        'features=custom-template,crm&customTemplate=one-time',
      ),
    );

    expect(decoded.customTemplateBilling).toBe('one-time');
    expect(decoded.featureIds).toEqual(['crm', 'custom-template']);
  });

  it('decodes one-time when template=custom is selected', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams('template=custom&customTemplate=one-time'),
    );

    expect(decoded.templateId).toBe('custom');
    expect(decoded.customTemplateBilling).toBe('one-time');
  });

  it('Q40 — keeps custom-template add-on when switching to standard template in URL', () => {
    const { config: decoded } = decodeConfigFromParams(
      new URLSearchParams(
        'template=sparkle-clean&features=custom-template,crm',
      ),
    );

    expect(decoded.templateId).toBe('sparkle-clean');
    expect(decoded.featureIds).toEqual(['crm', 'custom-template']);
  });
});

describe('round-trip encode/decode', () => {
  it('Starter defaults', () => {
    expectRoundTrip(STARTER_DEFAULTS);
  });

  it.each(TEMPLATES.map((t) => t.id))('library template %s', (templateId) => {
    expectRoundTrip(config({ templateId }));
  });

  it('custom template card', () => {
    expectRoundTrip(config({ templateId: 'custom' }));
  });

  it.each(['starter', 'growth', 'pro', 'custom'] as const)(
    'package preset %s',
    (packageId) => {
      expectRoundTrip(
        config({
          packageId,
          featureIds: [...PACKAGES_BY_ID[packageId].presetFeatureIds],
        }),
      );
    },
  );

  it('annual billing with mixed features', () => {
    expectRoundTrip(
      config({
        templateId: 'apex-legal',
        featureIds: ['crm', 'ecommerce', 'white-label'],
        billingCycle: 'annual',
        packageId: 'custom',
      }),
    );
  });

  it('custom-template recurring add-on', () => {
    expectRoundTrip(
      config({
        templateId: 'startup-launch',
        featureIds: ['custom-template', 'ai-content'],
      }),
    );
  });

  it('custom-template one-time add-on', () => {
    expectRoundTrip(
      config({
        templateId: 'custom',
        featureIds: ['custom-template', 'priority-support'],
        customTemplateBilling: 'one-time',
      }),
    );
  });

  it('all feature ids together', () => {
    const allFeatures: FeatureId[] = [
      'crm',
      'email-automation',
      'booking',
      'ecommerce',
      'vat-mtd',
      'ai-content',
      'custom-template',
      'analytics-seo',
      'sms',
      'white-label',
      'priority-support',
    ];

    expectRoundTrip(
      config({
        templateId: 'business-core',
        featureIds: allFeatures,
        billingCycle: 'annual',
        packageId: 'custom',
        customTemplateBilling: 'one-time',
      }),
    );
  });

  it('query string helpers round-trip', () => {
    const input = config({
      templateId: 'sparkle-clean',
      featureIds: ['crm', 'email-automation'],
      billingCycle: 'monthly',
    });

    const query = encodeConfigToQueryString(input);
    const { config: decoded, hadInvalidParams } =
      decodeConfigFromQueryString(query);

    expect(hadInvalidParams).toBe(false);
    expect(decoded).toEqual(canonical(input));
  });
});

describe('template id validation', () => {
  it('accepts every ALL_TEMPLATE_IDS entry', () => {
    for (const templateId of ALL_TEMPLATE_IDS) {
      const { config: decoded, hadInvalidParams } = decodeConfigFromParams(
        new URLSearchParams(`template=${templateId}`),
      );
      expect(hadInvalidParams).toBe(false);
      expect(decoded.templateId).toBe(templateId);
    }
  });
});
