import { describe, expect, it } from 'vitest';

import { isValidSlug, slugifyBusinessName } from '@/lib/onboarding/slug';

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
