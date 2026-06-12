import { describe, expect, it } from 'vitest';
import { RESERVED_TEMPLATE_SLUGS } from '@codedpixels/shared-types';

import {
  getOnboardingSlugError,
  isValidSlug,
  RESERVED_TEMPLATE_SLUG_ERROR,
  slugifyBusinessName,
} from '@/lib/onboarding/slug';

describe('slugifyBusinessName', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugifyBusinessName('Acme Clean Ltd')).toBe('acme-clean-ltd');
  });

  it('strips invalid characters', () => {
    expect(slugifyBusinessName('Bob\'s & Co!')).toBe('bobs-co');
  });

  it('returns empty for blank input', () => {
    expect(slugifyBusinessName('   ')).toBe('');
  });
});

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('acme-clean')).toBe(true);
  });

  it('rejects leading hyphens', () => {
    expect(isValidSlug('-acme')).toBe(false);
  });
});

describe('getOnboardingSlugError', () => {
  it('accepts valid customer slugs', () => {
    expect(getOnboardingSlugError('my-business')).toBeNull();
  });

  it.each(RESERVED_TEMPLATE_SLUGS)(
    'rejects reserved template slug %s',
    (reservedSlug) => {
      expect(getOnboardingSlugError(reservedSlug)).toBe(RESERVED_TEMPLATE_SLUG_ERROR);
    },
  );
});
