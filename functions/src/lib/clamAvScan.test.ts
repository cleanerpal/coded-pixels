import { describe, expect, it } from 'vitest';
import {
  isAssetOriginalUpload,
  isAssetThumbVariant,
  parseAssetStoragePath,
  scanObjectForMalware,
} from './clamAvScan';

const ORIGINAL =
  'companies/co1/sites/site1/assets/asset1/hero.jpg';
const THUMB =
  'companies/co1/sites/site1/assets/asset1/hero_400x400.webp';
const INFECTED =
  'companies/co1/sites/site1/assets/asset1/eicar-test.jpg';

describe('scanObjectForMalware', () => {
  it('returns clean for normal asset paths', () => {
    expect(scanObjectForMalware(ORIGINAL)).toBe('clean');
  });

  it('returns infected when forceInfected test hook is set', () => {
    expect(scanObjectForMalware(ORIGINAL, { forceInfected: true })).toBe(
      'infected',
    );
  });

  it('returns infected for eicar marker in path', () => {
    expect(scanObjectForMalware(INFECTED)).toBe('infected');
  });

  it('returns infected when mock env flag is set', () => {
    expect(
      scanObjectForMalware(ORIGINAL, { mockEnvInfected: true }),
    ).toBe('infected');
  });
});

describe('asset path helpers', () => {
  it('identifies original uploads vs resize variants', () => {
    expect(isAssetOriginalUpload(ORIGINAL)).toBe(true);
    expect(isAssetOriginalUpload(THUMB)).toBe(false);
  });

  it('identifies 400px WebP thumb variants', () => {
    expect(isAssetThumbVariant(THUMB)).toBe(true);
    expect(isAssetThumbVariant(ORIGINAL)).toBe(false);
  });

  it('parses asset storage paths', () => {
    expect(parseAssetStoragePath(ORIGINAL)).toEqual({
      companyId: 'co1',
      siteId: 'site1',
      assetId: 'asset1',
      fileName: 'hero.jpg',
    });
    expect(parseAssetStoragePath('invalid/path')).toBeNull();
  });
});
