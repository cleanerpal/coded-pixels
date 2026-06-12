/**
 * ClamAV scan stub for asset uploads (Q64).
 *
 * Production: replace with clamd TCP/socket scan of object bytes.
 * MVP: deterministic mock + test hooks — Aligned with Dr. Clara Voss on Q64.
 */
import { ASSET_STORAGE_PATH_PATTERN } from './assetConstants';

export type ClamAvScanResult = 'clean' | 'infected';

export interface ClamAvScanOptions {
  /** Unit-test hook — forces infected result regardless of path/env */
  forceInfected?: boolean;
  /** Override process.env.MOCK_CLAMAV_INFECTED for tests */
  mockEnvInfected?: boolean;
}

const INFECTED_PATH_MARKERS = ['eicar', 'clamav-test-infected'] as const;

export function scanObjectForMalware(
  storagePath: string,
  options: ClamAvScanOptions = {},
): ClamAvScanResult {
  if (options.forceInfected) {
    return 'infected';
  }

  if (
    options.mockEnvInfected ??
    process.env.MOCK_CLAMAV_INFECTED === 'true'
  ) {
    return 'infected';
  }

  const lowerPath = storagePath.toLowerCase();
  for (const marker of INFECTED_PATH_MARKERS) {
    if (lowerPath.includes(marker)) {
      return 'infected';
    }
  }

  // TODO(B7-prod): stream object from Storage → clamd INSTREAM scan (Dr. Clara Voss)
  return 'clean';
}

export function isAssetOriginalUpload(storagePath: string): boolean {
  const fileName = storagePath.split('/').pop() ?? '';
  if (fileName.length === 0) {
    return false;
  }

  // Skip Resize Images Extension variants (e.g. hero_400x400.webp)
  if (/_\d+x\d+\.(webp|jpeg|jpg|png|gif)$/i.test(fileName)) {
    return false;
  }

  return ASSET_STORAGE_PATH_PATTERN.test(storagePath);
}

export function isAssetThumbVariant(storagePath: string): boolean {
  const fileName = storagePath.split('/').pop() ?? '';
  return (
    ASSET_STORAGE_PATH_PATTERN.test(storagePath) &&
    fileName.includes('_400x400') &&
    fileName.endsWith('.webp')
  );
}

export function parseAssetStoragePath(storagePath: string): {
  companyId: string;
  siteId: string;
  assetId: string;
  fileName: string;
} | null {
  const match = storagePath.match(ASSET_STORAGE_PATH_PATTERN);
  if (!match) {
    return null;
  }

  const [, companyId, siteId, assetId, fileName] = match;
  if (!companyId || !siteId || !assetId || !fileName) {
    return null;
  }

  return { companyId, siteId, assetId, fileName };
}
