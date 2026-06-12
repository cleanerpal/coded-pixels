import type { TimestampLike } from './common';
/**
 * Async tenant provisioning status — `provisioningJobs/{jobId}`.
 * Client read contract aligned with B6-001 `functions/src/lib/provisioningJobs.ts`.
 */
export type ProvisioningJobStatus = 'pending' | 'complete' | 'failed';
export interface ProvisioningJob {
    signupId: string;
    ownerUid: string;
    stripeCheckoutSessionPath: string;
    status: ProvisioningJobStatus;
    companyId?: string;
    /** Optional — B6-001 may add when marking job complete. */
    siteId?: string;
    error?: string;
    createdAt: TimestampLike;
    updatedAt: TimestampLike;
}
//# sourceMappingURL=provisioning-job.d.ts.map