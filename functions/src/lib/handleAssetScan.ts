/**
 * Storage object finalization — ClamAV scan + thumb metadata sync (Q64).
 * Aligned with Dr. Clara Voss on Q64, Dr. Nora Patel on Q44.
 */
import { FieldValue } from 'firebase-admin/firestore';
import type { StorageEvent } from 'firebase-functions/v2/storage';
import { db, getStorageBucket } from './admin';
import { ASSET_SCAN_STATUS } from './assetConstants';
import {
  isAssetOriginalUpload,
  isAssetThumbVariant,
  parseAssetStoragePath,
  scanObjectForMalware,
} from './clamAvScan';

export async function handleAssetObjectFinalized(
  event: StorageEvent,
): Promise<void> {
  const object = event.data;
  const storagePath = object.name;
  if (!storagePath) {
    return;
  }

  const parsed = parseAssetStoragePath(storagePath);
  if (!parsed) {
    return;
  }

  if (isAssetThumbVariant(storagePath)) {
    await syncThumbUrl(parsed, object);
    return;
  }

  if (!isAssetOriginalUpload(storagePath)) {
    return;
  }

  const scanResult = scanObjectForMalware(storagePath);
  const assetRef = db.doc(
    `companies/${parsed.companyId}/sites/${parsed.siteId}/assets/${parsed.assetId}`,
  );

  if (scanResult === 'infected') {
    const bucket = getStorageBucket();
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
    await assetRef.set(
      {
        scanStatus: ASSET_SCAN_STATUS.infected,
        url: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    // TODO(B7-prod): notify uploader via SendGrid + audit log (Dr. Clara Voss)
    return;
  }

  const bucket = getStorageBucket();
  const file = bucket.file(storagePath);
  const [metadata] = await file.getMetadata();
  const [downloadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await assetRef.set(
    {
      scanStatus: ASSET_SCAN_STATUS.clean,
      url: downloadUrl,
      sizeBytes: Number(metadata.size ?? object.size ?? 0),
      mimeType: metadata.contentType ?? object.contentType ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function syncThumbUrl(
  parsed: {
    companyId: string;
    siteId: string;
    assetId: string;
  },
  object: StorageEvent['data'],
): Promise<void> {
  const bucket = getStorageBucket();
  const file = bucket.file(object.name!);
  const [downloadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await db
    .doc(
      `companies/${parsed.companyId}/sites/${parsed.siteId}/assets/${parsed.assetId}`,
    )
    .set(
      {
        thumbUrl: downloadUrl,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
