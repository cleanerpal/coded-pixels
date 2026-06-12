/** Asset upload limits — codedpixels-project-plan.md Q44, firestore-schema.md §7.3 */
export const ASSET_MAX_BYTES = 5 * 1024 * 1024;

export const ASSET_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AssetMimeType = (typeof ASSET_ALLOWED_MIME_TYPES)[number];

export const ASSET_SCAN_STATUS = {
  pending: 'pending',
  clean: 'clean',
  infected: 'infected',
} as const;

export type AssetScanStatus =
  (typeof ASSET_SCAN_STATUS)[keyof typeof ASSET_SCAN_STATUS];

export const ASSET_STORAGE_PATH_PATTERN =
  /^companies\/([^/]+)\/sites\/([^/]+)\/assets\/([^/]+)\/([^/]+)$/;

/** Resize Images Extension suffix — Q64 (400px WebP thumbnail) */
export const ASSET_THUMB_SIZE_SUFFIX = '_400x400';

export function buildAssetStoragePath(
  companyId: string,
  siteId: string,
  assetId: string,
  filename: string,
): string {
  return `companies/${companyId}/sites/${siteId}/assets/${assetId}/${filename}`;
}

export function buildAssetDocPath(
  companyId: string,
  siteId: string,
  assetId: string,
): string {
  return `companies/${companyId}/sites/${siteId}/assets/${assetId}`;
}

export function isAllowedAssetMimeType(
  mimeType: string,
): mimeType is AssetMimeType {
  return (ASSET_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}
