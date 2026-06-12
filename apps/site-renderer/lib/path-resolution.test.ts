import { describe, expect, it } from 'vitest';
import { resolvePageSlugFromSegments } from './path-resolution';

describe('resolvePageSlugFromSegments', () => {
  it('maps root to empty homepage slug', () => {
    expect(resolvePageSlugFromSegments(undefined)).toBe('');
    expect(resolvePageSlugFromSegments([])).toBe('');
  });

  it('maps single segment paths', () => {
    expect(resolvePageSlugFromSegments(['about'])).toBe('about');
    expect(resolvePageSlugFromSegments(['contact'])).toBe('contact');
  });

  it('rejects nested paths for MVP routing', () => {
    expect(resolvePageSlugFromSegments(['blog', 'post-1'])).toBeNull();
  });
});
