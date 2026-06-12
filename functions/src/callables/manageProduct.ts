import { FieldValue } from 'firebase-admin/firestore';
import { CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { ZodError, z } from 'zod';
import { db } from '../lib/admin';
import { marketingCallableOptions } from '../lib/callableOptions';
import {
  assertEditorPlusMember,
  resolveCompanyId,
} from '../lib/memberAuth';

const productInputSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.record(z.unknown()).optional(),
  pricePence: z.number().int().min(0),
  sku: z.string().max(64).optional(),
  status: z.enum(['draft', 'published']),
  imageAssetIds: z.array(z.string()).max(5).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const manageProductPayloadSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    siteId: z.string().min(1),
    product: productInputSchema,
  }),
  z.object({
    action: z.literal('update'),
    siteId: z.string().min(1),
    productId: z.string().min(1),
    product: productInputSchema.partial(),
  }),
  z.object({
    action: z.literal('delete'),
    siteId: z.string().min(1),
    productId: z.string().min(1),
  }),
]);

export type ManageProductPayload = z.infer<typeof manageProductPayloadSchema>;

export interface ManageProductResult {
  success: true;
  productId: string;
}

function mapValidationError(error: unknown): never {
  if (error instanceof ZodError) {
    const message = error.issues.map((issue) => issue.message).join('; ');
    throw new HttpsError('invalid-argument', message || 'Invalid request payload');
  }

  throw error;
}

async function assertEcommerceFeature(companyId: string): Promise<void> {
  const companySnap = await db.collection('companies').doc(companyId).get();
  if (!companySnap.exists) {
    throw new HttpsError('not-found', 'Company not found');
  }

  const featureIds = companySnap.data()?.plan?.featureIds ?? [];
  if (!featureIds.includes('ecommerce')) {
    throw new HttpsError(
      'permission-denied',
      'Ecommerce add-on required to manage products',
    );
  }
}

/**
 * Product CRUD via Admin SDK — firestore rules deny client writes (schema §7.5).
 * Aligned with Dr. Samuel Ruiz on Q51.
 */
export async function handleManageProduct(
  request: CallableRequest,
): Promise<ManageProductResult> {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  let payload: ManageProductPayload;

  try {
    payload = manageProductPayloadSchema.parse(request.data);
  } catch (error) {
    mapValidationError(error);
  }

  const uid = request.auth.uid;
  const companyId = await resolveCompanyId(uid, request.auth.token);
  await assertEditorPlusMember(uid, companyId);
  await assertEcommerceFeature(companyId);

  const productsRef = db
    .collection('companies')
    .doc(companyId)
    .collection('sites')
    .doc(payload.siteId)
    .collection('products');

  if (payload.action === 'create') {
    const productRef = productsRef.doc();
    await productRef.set({
      ...payload.product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { success: true, productId: productRef.id };
  }

  const productRef = productsRef.doc(payload.productId);
  const existing = await productRef.get();

  if (!existing.exists) {
    throw new HttpsError('not-found', 'Product not found');
  }

  if (payload.action === 'delete') {
    await productRef.delete();
    return { success: true, productId: payload.productId };
  }

  await productRef.update({
    ...payload.product,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, productId: payload.productId };
}

export { marketingCallableOptions as manageProductCallableOptions };
