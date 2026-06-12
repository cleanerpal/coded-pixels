import { z } from 'zod';

/** Client-side limits — mirror functions/src/lib/assetConstants.ts (Q44) */
export const ASSET_MAX_BYTES = 5 * 1024 * 1024;

export const ASSET_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const assetUploadFormSchema = z.object({
  altText: z.string().trim().min(1, 'Alt text is required for accessibility').max(500),
  file: z
    .custom<File>(
      (value) => value instanceof File,
      'Please choose an image file',
    )
    .refine((file) => file.size <= ASSET_MAX_BYTES, 'Image must be 5 MB or smaller')
    .refine(
      (file) =>
        (ASSET_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type),
      'Only JPEG, PNG, WebP, and GIF images are allowed',
    ),
});

export type AssetUploadFormValues = z.infer<typeof assetUploadFormSchema>;

export function validateAssetUploadForm(input: {
  altText: string;
  file: File | null;
}): { success: true; data: AssetUploadFormValues } | { success: false; error: string } {
  if (!input.file) {
    return { success: false, error: 'Please choose an image file' };
  }

  const result = assetUploadFormSchema.safeParse({
    altText: input.altText,
    file: input.file,
  });

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid upload';
    return { success: false, error: message };
  }

  return { success: true, data: result.data };
}
