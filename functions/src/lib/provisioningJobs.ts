import { FieldValue, type DocumentReference } from 'firebase-admin/firestore';
import { db } from './admin';

export type ProvisioningJobStatus = 'pending' | 'complete' | 'failed';

export interface ProvisioningJob {
  signupId: string;
  ownerUid: string;
  stripeCheckoutSessionPath: string;
  status: ProvisioningJobStatus;
  companyId?: string;
  error?: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
}

export function provisioningJobsRef(jobId?: string): DocumentReference {
  const collection = db.collection('provisioningJobs');
  return jobId ? collection.doc(jobId) : collection.doc();
}

export async function createProvisioningJob(input: {
  signupId: string;
  ownerUid: string;
  stripeCheckoutSessionPath: string;
}): Promise<string> {
  const ref = provisioningJobsRef();
  const job: ProvisioningJob = {
    signupId: input.signupId,
    ownerUid: input.ownerUid,
    stripeCheckoutSessionPath: input.stripeCheckoutSessionPath,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await ref.set(job);
  return ref.id;
}

export async function markProvisioningJobComplete(
  jobId: string,
  companyId: string,
): Promise<void> {
  await provisioningJobsRef(jobId).update({
    status: 'complete',
    companyId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markProvisioningJobFailed(
  jobId: string,
  error: string,
): Promise<void> {
  await provisioningJobsRef(jobId).update({
    status: 'failed',
    error,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
