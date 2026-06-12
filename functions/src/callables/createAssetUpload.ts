import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { db, getStorageBucket } from '../lib/admin';
import {
  ASSET_MAX_BYTES,
  ASSET_ALLOWED_MIME_TYPES,
  ASSET_SCAN_STATUS,
  buildAssetStoragePath,
  isAllowedAssetMimeType,
} from '../lib/assetConstants';
import {
  assertEditorPlusMember,
  resolveCompanyId,
} from '../lib/memberAuth';

export const createAssetUploadPayloadSchema = z.object({
  siteId: z.string().min(1),
  filename: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[^/\\]+$/, 'Filename must not contain path separators'),
  mimeType: z.enum(ASSET_ALLOWED_MIME_TYPES),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(ASSET_MAX_BYTES, 'Image must be 5 MB or smaller'),
  altText: z.string().trim().min(1, 'Alt text is required').max(500),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type CreateAssetUploadPayload = z.infer<
  typeof createAssetUploadPayloadSchema
>;

export interface CreateAssetUploadResult {
  assetId: string;
  storagePath: string;
  uploadUrl: string;
  expiresAt: string;
}

function mapValidationError(error: unknown): never {
  if (error instanceof z.ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    throw new HttpsError('invalid-argument', message || 'Invalid request payload');
  }

  throw error;
}

/**
 * Callable upload initiation — signed URL + pending metadata doc (Q44).
 * Aligned with Dr. Nora Patel on Q44, Dr. Kai Nakamura on Functions.
 */
export async function handleCreateAssetUpload(
  request: CallableRequest,
): Promise<CreateAssetUploadResult> {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const uid = request.auth.uid;
  let payload: CreateAssetUploadPayload;

  try {
    payload = createAssetUploadPayloadSchema.parse(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  const companyId = await resolveCompanyId(uid, request.auth.token);
  await assertEditorPlusMember(uid, companyId);

  if (!isAllowedAssetMimeType(payload.mimeType)) {
    throw new HttpsError('invalid-argument', 'Unsupported image type');
  }

  const assetId = randomUUID();
  const storagePath = buildAssetStoragePath(
    companyId,
    payload.siteId,
    assetId,
    payload.filename,
  );

  const bucket = getStorageBucket();
  const file = bucket.file(storagePath);

  const expiresAtMs = Date.now() + 15 * 60 * 1000;
  const [uploadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: expiresAtMs,
    contentType: payload.mimeType,
  });

  const assetRef = db
    .collection('companies')
    .doc(companyId)
    .collection('sites')
    .doc(payload.siteId)
    .collection('assets')
    .doc(assetId);

  await assetRef.set({
    filename: payload.filename,
    storagePath,
    url: '',
    thumbUrl: null,
    altText: payload.altText,
    mimeType: payload.mimeType,
    width: payload.width ?? null,
    height: payload.height ?? null,
    sizeBytes: payload.sizeBytes,
    scanStatus: ASSET_SCAN_STATUS.pending,
    createdBy: uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    assetId,
    storagePath,
    uploadUrl,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}
