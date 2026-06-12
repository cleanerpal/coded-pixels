import type { ConfigSnapshot as SharedConfigSnapshot } from '@codedpixels/shared-types';
import { z } from 'zod';

/** Canonical feature IDs — firestore-schema.md §3 */
export const featureIdSchema = z.enum([
  'crm',
  'email-automation',
  'booking',
  'ecommerce',
  'vat-mtd',
  'ai-content',
  'custom-template',
  'analytics-seo',
  'sms',
  'white-label',
  'priority-support',
]);

export const configSnapshotSchema = z.object({
  templateId: z.string().min(1).max(128),
  featureIds: z.array(featureIdSchema).max(32),
  billingCycle: z.enum(['monthly', 'annual']),
  monthlyTotalPence: z.number().int().nonnegative(),
  annualTotalPence: z.number().int().nonnegative().optional(),
  customTemplateBilling: z.enum(['recurring', 'one-time']).optional(),
  oneTimeFeesPence: z.number().int().nonnegative().optional(),
  packageId: z.enum(['starter', 'growth', 'pro', 'custom']).optional(),
});

export type ConfigSnapshot = SharedConfigSnapshot;

const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(320)
  .email()
  .transform((value) => value.toLowerCase());

/** Shared marketing Callable payload — consent checkbox must be checked (DOC-002). */
export const marketingSubmitPayloadSchema = z.object({
  email: emailSchema,
  config: configSnapshotSchema,
  consentAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Privacy consent is required' }),
  }),
});

export type MarketingSubmitPayload = z.infer<typeof marketingSubmitPayloadSchema>;

export function parseMarketingSubmitPayload(
  data: unknown,
): MarketingSubmitPayload {
  return marketingSubmitPayloadSchema.parse(data);
}
