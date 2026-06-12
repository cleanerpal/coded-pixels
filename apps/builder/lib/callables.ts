import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from '@/lib/firebase';

export interface PublishSitePayload {
  siteId: string;
}

export interface PublishValidationErrorDetail {
  pageSlug: string;
  sectionId: string;
  sectionType: string;
  message: string;
}

export interface PublishSiteResult {
  success: true;
  publishedAt: string;
  paths: string[];
}

export class PublishSiteError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly validationErrors?: PublishValidationErrorDetail[],
  ) {
    super(message);
    this.name = 'PublishSiteError';
  }
}

export interface SubmitLeadPayload {
  companyId: string;
  siteId: string;
  source: {
    pageId: string;
    pageSlug: string;
    formSectionId: string;
    formType: 'contact' | 'quote' | 'booking';
  };
  fields: Record<string, string | number | boolean>;
}

export interface ManageProductInput {
  name: string;
  slug: string;
  description?: Record<string, unknown>;
  pricePence: number;
  sku?: string;
  status: 'draft' | 'published';
  imageAssetIds?: string[];
  sortOrder?: number;
}

export type ManageProductPayload =
  | { action: 'create'; siteId: string; product: ManageProductInput }
  | {
      action: 'update';
      siteId: string;
      productId: string;
      product: Partial<ManageProductInput>;
    }
  | { action: 'delete'; siteId: string; productId: string };

export interface ManageProductResult {
  success: true;
  productId: string;
}

export interface CreatePortalSessionResult {
  success: true;
  portalUrl: string;
}

/**
 * Publish site via B3-001 Callable — builder-ui-spec.md §7.1.
 * Aligned with Dr. Kai Nakamura on publishSite · Dr. Lena Petrova on revalidation.
 */
export async function publishSite(
  payload: PublishSitePayload,
): Promise<PublishSiteResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<PublishSitePayload, PublishSiteResult>(
    functions,
    'publishSite',
  );

  try {
    const result = await callable(payload);
    return result.data;
  } catch (error) {
    const firebaseError = error as {
      code?: string;
      message?: string;
      details?: { errors?: PublishValidationErrorDetail[] };
    };

    throw new PublishSiteError(
      firebaseError.message ?? 'Publish failed',
      firebaseError.code,
      firebaseError.details?.errors,
    );
  }
}

/** Public form submission → lead — B8-001, firestore-schema.md §7.4 */
export async function submitLead(
  payload: SubmitLeadPayload,
): Promise<{ success: true }> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<SubmitLeadPayload, { success: true }>(
    functions,
    'submitLead',
  );
  const result = await callable(payload);
  return result.data;
}

/** Product CRUD — B8-001, firestore-schema.md §7.5 */
export async function manageProduct(
  payload: ManageProductPayload,
): Promise<ManageProductResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<ManageProductPayload, ManageProductResult>(
    functions,
    'manageProduct',
  );
  const result = await callable(payload);
  return result.data;
}

/** Stripe Customer Portal — Q46 (B8-001) */
export async function createPortalSession(): Promise<CreatePortalSessionResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<Record<string, never>, CreatePortalSessionResult>(
    functions,
    'createPortalSession',
  );
  const result = await callable({});
  return result.data;
}

export interface CreateAssetUploadPayload {
  siteId: string;
  filename: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  sizeBytes: number;
  altText: string;
  width?: number;
  height?: number;
}

export interface CreateAssetUploadResult {
  assetId: string;
  storagePath: string;
  uploadUrl: string;
  expiresAt: string;
}

/**
 * Initiate asset upload — B7-001 Callable (Q44).
 * Aligned with Dr. Nora Patel on Q44.
 */
export async function createAssetUpload(
  payload: CreateAssetUploadPayload,
): Promise<CreateAssetUploadResult> {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable<
    CreateAssetUploadPayload,
    CreateAssetUploadResult
  >(functions, 'createAssetUpload');

  const result = await callable(payload);
  return result.data;
}
