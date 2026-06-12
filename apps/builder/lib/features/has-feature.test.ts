import { describe, expect, it } from 'vitest';

import {
  companyHasFeature,
  hasCrm,
  hasEcommerce,
} from './has-feature';

describe('companyHasFeature', () => {
  it('returns true when feature is in plan', () => {
    expect(companyHasFeature(['crm', 'sms'], 'crm')).toBe(true);
  });

  it('returns false when feature is absent', () => {
    expect(companyHasFeature(['sms'], 'crm')).toBe(false);
  });

  it('handles undefined featureIds', () => {
    expect(companyHasFeature(undefined, 'crm')).toBe(false);
  });
});

describe('feature gate helpers', () => {
  it('hasCrm gates CRM inbox', () => {
    expect(hasCrm(['crm'])).toBe(true);
    expect(hasCrm(['ecommerce'])).toBe(false);
  });

  it('hasEcommerce gates products editor', () => {
    expect(hasEcommerce(['ecommerce'])).toBe(true);
    expect(hasEcommerce(['crm'])).toBe(false);
  });
});
