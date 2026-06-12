import { describe, expect, it } from 'vitest';

import {
  assetUploadFormSchema,
  validateAssetUploadForm,
} from '@/lib/assets/upload-validation';

function mockFile(
  overrides: Partial<{ name: string; type: string; size: number }> = {},
): File {
  const name = overrides.name ?? 'photo.jpg';
  const type = overrides.type ?? 'image/jpeg';
  const size = overrides.size ?? 1024;
  return new File([new Uint8Array(size)], name, { type });
}

describe('assetUploadFormSchema', () => {
  it('requires non-empty alt text', () => {
    const result = assetUploadFormSchema.safeParse({
      altText: '  ',
      file: mockFile(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects files over 5 MB', () => {
    const result = assetUploadFormSchema.safeParse({
      altText: 'Office front door',
      file: mockFile({ size: 5 * 1024 * 1024 + 1 }),
    });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported mime types', () => {
    const result = assetUploadFormSchema.safeParse({
      altText: 'Logo',
      file: mockFile({ type: 'image/svg+xml' }),
    });
    expect(result.success).toBe(false);
  });
});

describe('validateAssetUploadForm', () => {
  it('returns parsed data for valid input', () => {
    const file = mockFile();
    const result = validateAssetUploadForm({
      altText: 'Team at work',
      file,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.altText).toBe('Team at work');
      expect(result.data.file).toBe(file);
    }
  });

  it('requires a file', () => {
    const result = validateAssetUploadForm({ altText: 'Caption', file: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/choose an image/i);
    }
  });
});
