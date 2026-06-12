import { describe, expect, it } from 'vitest';
import { companyRateLimitDocId } from './companyRateLimit';
import { PUBLISH_RATE_LIMIT_MAX } from './constants';
import {
  GATED_SECTION_TYPES,
  getRequiredFeatureId,
  isFeatureEnabled,
} from './gatedSections';
import {
  pageSlugToPath,
  validateSiteForPublish,
} from './publishValidation';

describe('gatedSections', () => {
  it('maps ecommerce section types to ecommerce featureId', () => {
    expect(getRequiredFeatureId('product-grid')).toBe('ecommerce');
    expect(getRequiredFeatureId('booking-widget')).toBe('booking');
    expect(getRequiredFeatureId('hero')).toBeUndefined();
  });

  it('checks featureIds membership', () => {
    expect(isFeatureEnabled(['crm', 'ecommerce'], 'ecommerce')).toBe(true);
    expect(isFeatureEnabled(['crm'], 'ecommerce')).toBe(false);
  });

  it('includes all builder-ui-spec §3.2 gated types', () => {
    expect(Object.keys(GATED_SECTION_TYPES).sort()).toEqual(
      ['booking-widget', 'cart-summary', 'product-detail', 'product-grid'].sort(),
    );
  });
});

describe('validateSiteForPublish', () => {
  const validHeroSection = {
    id: 'hero-1',
    type: 'hero',
    props: {
      headline: 'Welcome',
      ctaLink: '#contact',
      alignment: 'center',
    },
  };

  it('accepts valid MVP sections', () => {
    const errors = validateSiteForPublish({
      pages: [{ pageId: 'p1', slug: 'home', sections: [validHeroSection] }],
      featureIds: [],
    });

    expect(errors).toEqual([]);
  });

  it('rejects invalid section props', () => {
    const errors = validateSiteForPublish({
      pages: [
        {
          pageId: 'p1',
          slug: 'home',
          sections: [
            {
              id: 'hero-bad',
              type: 'hero',
              props: {
                headline: 'Valid headline',
                alignment: 'invalid-alignment',
              },
            },
          ],
        },
      ],
      featureIds: [],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.sectionId).toBe('hero-bad');
    expect(errors[0]?.message.length).toBeGreaterThan(0);
  });

  it('rejects gated sections when featureId is missing', () => {
    const errors = validateSiteForPublish({
      pages: [
        {
          pageId: 'p1',
          slug: 'home',
          sections: [
            {
              id: 'shop-1',
              type: 'product-grid',
              props: {},
            },
          ],
        },
      ],
      featureIds: ['crm'],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('ecommerce');
  });

  it('allows gated sections when featureId is present', () => {
    const errors = validateSiteForPublish({
      pages: [
        {
          pageId: 'p1',
          slug: 'home',
          sections: [
            {
              id: 'book-1',
              type: 'booking-widget',
              props: {},
            },
          ],
        },
      ],
      featureIds: ['booking'],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('Unknown section type');
  });

  it('validates nested child sections', () => {
    const errors = validateSiteForPublish({
      pages: [
        {
          pageId: 'p1',
          slug: 'about',
          sections: [
            {
              id: 'parent',
              type: 'hero',
              props: {
                headline: 'Parent',
                ctaLink: '#contact',
                alignment: 'center',
              },
              children: [
                {
                  id: 'child-bad',
                  type: 'product-detail',
                  props: {},
                },
              ],
            },
          ],
        },
      ],
      featureIds: [],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.sectionId).toBe('child-bad');
    expect(errors[0]?.pageSlug).toBe('about');
  });
});

describe('pageSlugToPath', () => {
  it('maps home slug to root path', () => {
    expect(pageSlugToPath('home')).toBe('/');
    expect(pageSlugToPath('/')).toBe('/');
  });

  it('prefixes other slugs with slash', () => {
    expect(pageSlugToPath('about')).toBe('/about');
  });
});

describe('publish rate limit', () => {
  it('uses company-scoped doc id pattern', () => {
    expect(companyRateLimitDocId('co-123', 'publishSite')).toBe(
      'company_co-123_publishSite',
    );
  });

  it('allows 30 publishes per hour per company', () => {
    expect(PUBLISH_RATE_LIMIT_MAX).toBe(30);
  });
});

describe('publishSitePayloadSchema', () => {
  it('requires siteId', async () => {
    const { publishSitePayloadSchema } = await import('../callables/publishSite');
    expect(publishSitePayloadSchema.parse({ siteId: 'site-1' })).toEqual({
      siteId: 'site-1',
    });
    expect(() => publishSitePayloadSchema.parse({})).toThrow();
  });
});
