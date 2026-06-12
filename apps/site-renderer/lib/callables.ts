import type { SubmitLeadPayload } from '@codedpixels/component-registry';
import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from '@/lib/firebase';

export type { SubmitLeadPayload };

/**
 * Public form submission → lead — site-renderer-architecture.md §9, Q49.
 * Aligned with Dr. Victor Lang on Q49.
 */
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
