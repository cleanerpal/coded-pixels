import { describe, expect, it, vi } from 'vitest';
import { handleRevalidateRequest } from './revalidate-handler';

describe('handleRevalidateRequest', () => {
  const baseBody = {
    companyId: 'co-1',
    siteId: 'site-1',
    slug: 'acme-clean',
    paths: ['/', '/about'],
    tags: ['site:site-1'],
  };

  it('returns 401 when secret mismatches', () => {
    const result = handleRevalidateRequest({
      secret: 'expected-secret',
      providedSecret: 'wrong-secret',
      body: baseBody,
      revalidateTag: vi.fn(),
      revalidatePath: vi.fn(),
    });

    expect(result.status).toBe(401);
  });

  it('returns 401 when secret is not configured', () => {
    const result = handleRevalidateRequest({
      secret: undefined,
      providedSecret: 'any',
      body: baseBody,
      revalidateTag: vi.fn(),
      revalidatePath: vi.fn(),
    });

    expect(result.status).toBe(401);
  });

  it('revalidates tags and paths on happy path', () => {
    const revalidateTag = vi.fn();
    const revalidatePath = vi.fn();

    const result = handleRevalidateRequest({
      secret: 'expected-secret',
      providedSecret: 'expected-secret',
      body: baseBody,
      revalidateTag,
      revalidatePath,
    });

    expect(result.status).toBe(200);
    if (result.status === 200) {
      expect(result.body.revalidated).toBe(true);
      expect(result.body.paths).toEqual(['/', '/about']);
      expect(result.body.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }

    expect(revalidateTag).toHaveBeenCalledWith('site:site-1');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/about');
  });

  it('defaults to root path and site tag when omitted', () => {
    const revalidateTag = vi.fn();
    const revalidatePath = vi.fn();

    handleRevalidateRequest({
      secret: 'secret',
      providedSecret: 'secret',
      body: {
        companyId: 'co-1',
        siteId: 'site-9',
        slug: 'demo',
      },
      revalidateTag,
      revalidatePath,
    });

    expect(revalidateTag).toHaveBeenCalledWith('site:site-9');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });
});
