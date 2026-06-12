import { afterEach, describe, expect, it, vi } from 'vitest';

describe('template preview URLs', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('builds local demo URL in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { buildPreviewUrl } = await import('@/lib/template-preview-urls');
    expect(buildPreviewUrl('sparkle-clean')).toBe(
      'http://sparkle-clean.localhost:3002/',
    );
  });

  it('builds local demo URL when NODE_ENV is test', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const { buildPreviewUrl } = await import('@/lib/template-preview-urls');
    expect(buildPreviewUrl('sparkle-clean')).toBe(
      'http://sparkle-clean.localhost:3002/',
    );
  });

  it('builds production demo URL in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { buildPreviewUrl } = await import('@/lib/template-preview-urls');
    expect(buildPreviewUrl('sparkle-clean')).toBe(
      'https://sparkle-clean.codedpixels.co.uk/',
    );
  });

  it('uses NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL with {templateId} placeholder', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL',
      'https://{templateId}.staging.codedpixels.co.uk',
    );
    const { buildPreviewUrl } = await import('@/lib/template-preview-urls');
    expect(buildPreviewUrl('trade-pro')).toBe(
      'https://trade-pro.staging.codedpixels.co.uk/',
    );
  });

  it('uses NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL as host suffix', async () => {
    vi.stubEnv(
      'NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL',
      'https://codedpixels.co.uk',
    );
    const { buildPreviewUrl } = await import('@/lib/template-preview-urls');
    expect(buildPreviewUrl('glow-studio')).toBe(
      'https://glow-studio.codedpixels.co.uk/',
    );
  });

  it('returns public WebP thumbnail path', async () => {
    const { getTemplatePreviewThumbnailPath } = await import(
      '@/lib/template-preview-urls'
    );
    expect(getTemplatePreviewThumbnailPath('serenity-spa')).toBe(
      '/templates/previews/serenity-spa.webp',
    );
  });

  it('identifies library template ids for preview links', async () => {
    const { isLibraryTemplateId } = await import('@/lib/template-preview-urls');
    expect(isLibraryTemplateId('sparkle-clean')).toBe(true);
    expect(isLibraryTemplateId('custom')).toBe(false);
    expect(isLibraryTemplateId(null)).toBe(false);
  });
});
