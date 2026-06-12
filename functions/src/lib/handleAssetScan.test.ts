import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ASSET_SCAN_STATUS } from './assetConstants';
import { handleAssetObjectFinalized } from './handleAssetScan';

const mockDelete = vi.fn();
const mockGetMetadata = vi.fn();
const mockGetSignedUrl = vi.fn();
const mockFile = vi.fn(() => ({
  delete: mockDelete,
  getMetadata: mockGetMetadata,
  getSignedUrl: mockGetSignedUrl,
}));
const mockSet = vi.fn();

vi.mock('./admin', () => ({
  db: {
    doc: vi.fn(() => ({ set: mockSet })),
  },
  getStorageBucket: vi.fn(() => ({
    file: mockFile,
  })),
}));

describe('handleAssetObjectFinalized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMetadata.mockResolvedValue([
      { size: '2048', contentType: 'image/jpeg' },
    ]);
    mockGetSignedUrl.mockResolvedValue(['https://storage.example/hero.jpg']);
    mockDelete.mockResolvedValue(undefined);
    mockSet.mockResolvedValue(undefined);
  });

  it('marks clean uploads and sets download URL', async () => {
    await handleAssetObjectFinalized({
      data: {
        name: 'companies/co1/sites/site1/assets/a1/hero.jpg',
        size: 2048,
        contentType: 'image/jpeg',
      },
    } as never);

    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        scanStatus: ASSET_SCAN_STATUS.clean,
        url: 'https://storage.example/hero.jpg',
        sizeBytes: 2048,
        mimeType: 'image/jpeg',
      }),
      { merge: true },
    );
  });

  it('deletes infected uploads and updates scanStatus', async () => {
    await handleAssetObjectFinalized({
      data: {
        name: 'companies/co1/sites/site1/assets/a1/eicar.jpg',
        size: 512,
        contentType: 'image/jpeg',
      },
    } as never);

    expect(mockDelete).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        scanStatus: ASSET_SCAN_STATUS.infected,
      }),
      { merge: true },
    );
  });

  it('syncs thumbUrl for resize extension variants', async () => {
    await handleAssetObjectFinalized({
      data: {
        name: 'companies/co1/sites/site1/assets/a1/hero_400x400.webp',
        size: 400,
        contentType: 'image/webp',
      },
    } as never);

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        thumbUrl: 'https://storage.example/hero.jpg',
      }),
      { merge: true },
    );
  });

  it('ignores non-asset storage paths', async () => {
    await handleAssetObjectFinalized({
      data: {
        name: 'misc/other.jpg',
        size: 100,
      },
    } as never);

    expect(mockSet).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
