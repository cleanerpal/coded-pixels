import { describe, expect, it } from 'vitest';
import { createAssetUploadPayloadSchema } from './createAssetUpload';

describe('createAssetUploadPayloadSchema', () => {
  const validPayload = {
    siteId: 'site-1',
    filename: 'hero.jpg',
    mimeType: 'image/jpeg' as const,
    sizeBytes: 1024,
    altText: 'Team photo at the office',
  };

  it('accepts valid upload payloads', () => {
    expect(createAssetUploadPayloadSchema.parse(validPayload)).toEqual(
      validPayload,
    );
  });

  it('rejects empty alt text', () => {
    const result = createAssetUploadPayloadSchema.safeParse({
      ...validPayload,
      altText: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects files over 5 MB', () => {
    const result = createAssetUploadPayloadSchema.safeParse({
      ...validPayload,
      sizeBytes: 5 * 1024 * 1024 + 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported mime types', () => {
    const result = createAssetUploadPayloadSchema.safeParse({
      ...validPayload,
      mimeType: 'image/svg+xml',
    });
    expect(result.success).toBe(false);
  });

  it('rejects path separators in filename', () => {
    const result = createAssetUploadPayloadSchema.safeParse({
      ...validPayload,
      filename: '../escape.jpg',
    });
    expect(result.success).toBe(false);
  });
});
