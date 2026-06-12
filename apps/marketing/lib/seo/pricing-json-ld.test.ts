import { describe, expect, it } from 'vitest';

import { buildPricingJsonLd } from '@/lib/seo/pricing-json-ld';

describe('buildPricingJsonLd', () => {
  it('returns SoftwareApplication with Offer per package', () => {
    const data = buildPricingJsonLd();

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('CodedPixels');

    const offers = data.offers as Array<Record<string, unknown>>;
    expect(offers).toHaveLength(4);
    expect(offers.map((offer) => offer.name)).toEqual([
      'Starter plan',
      'Growth plan',
      'Pro plan',
      'Custom plan',
    ]);
  });

  it('includes GBP monthly price for fixed packages', () => {
    const data = buildPricingJsonLd();
    const offers = data.offers as Array<Record<string, unknown>>;
    const starter = offers[0];

    expect(starter.price).toBe('9.99');
    expect(starter.priceCurrency).toBe('GBP');
    expect(starter.priceSpecification).toMatchObject({
      '@type': 'UnitPriceSpecification',
      price: '9.99',
      priceCurrency: 'GBP',
      billingDuration: 'P1M',
    });
  });

  it('omits price for the Custom package', () => {
    const data = buildPricingJsonLd();
    const offers = data.offers as Array<Record<string, unknown>>;
    const custom = offers[3];

    expect(custom.price).toBeUndefined();
    expect(custom.priceSpecification).toBeUndefined();
  });
});
