import { doc, getDoc, type Firestore } from 'firebase/firestore';

import type { ProvisioningJob } from '@codedpixels/shared-types';

/**
 * Client-side read contract for `provisioningJobs/{jobId}`.
 * B6-001 owns writes; rules must allow owner read on their job doc.
 */
export async function fetchProvisioningJob(
  db: Firestore,
  jobId: string,
): Promise<ProvisioningJob | null> {
  const snapshot = await getDoc(doc(db, 'provisioningJobs', jobId));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as ProvisioningJob;
}
