import { describe, expect, it } from 'vitest';
import { heroSchema } from './schemas/hero';
import { featuresGridSchema } from './schemas/features-grid';
import { footerSchema } from './schemas/footer';
import { validateSectionProps } from './validateSectionProps';

describe('validateSectionProps', () => {
  it('accepts valid hero props from template seeds', () => {
    const result = validateSectionProps('hero', {
      headline: 'Built for growing businesses',
      subheadline: 'Showcase services, team, and results with a polished corporate site',
      ctaText: 'Contact us',
      ctaLink: '#contact',
      alignment: 'center',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.headline).toBe('Built for growing businesses');
    }
  });

  it('rejects hero headline over max length', () => {
    const result = validateSectionProps('hero', {
      headline: 'x'.repeat(121),
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown section types', () => {
    const result = validateSectionProps('unknown-block', { foo: 'bar' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Unknown section type');
    }
  });
});

describe('heroSchema', () => {
  it('allows tel: links from trade-pro seed', () => {
    const parsed = heroSchema.safeParse({
      headline: 'Expert trades, when you need them',
      ctaLink: 'tel:08001234567',
      alignment: 'left',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('featuresGridSchema', () => {
  it('accepts startup-launch seed shape', () => {
    const parsed = featuresGridSchema.safeParse({
      headline: 'Why teams choose us',
      columns: 3,
      items: [
        { title: 'Fast setup', description: 'Live in days, not months' },
        { title: 'Built to scale', description: 'Grow without replatforming' },
      ],
    });
    expect(parsed.success).toBe(true);
  });
});

describe('footerSchema', () => {
  it('accepts footer props from seeds', () => {
    const parsed = footerSchema.safeParse({
      businessName: 'Sparkle Clean',
      tagline: 'Professional cleaning services',
      showSocialLinks: false,
    });
    expect(parsed.success).toBe(true);
  });
});
