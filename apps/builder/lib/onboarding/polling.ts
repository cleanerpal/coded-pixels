import type { ProvisioningJobStatus } from '@codedpixels/shared-types';

import {
  PROVISIONING_POLL_INTERVAL_MS,
  PROVISIONING_POLL_TIMEOUT_MS,
} from '@/lib/onboarding/constants';

export type PollingStopReason =
  | 'complete'
  | 'failed'
  | 'timeout'
  | 'continue';

export interface PollingDecision {
  reason: PollingStopReason;
  shouldStop: boolean;
}

export function evaluateProvisioningPoll(
  status: ProvisioningJobStatus,
  elapsedMs: number,
  timeoutMs: number = PROVISIONING_POLL_TIMEOUT_MS,
): PollingDecision {
  if (status === 'complete') {
    return { reason: 'complete', shouldStop: true };
  }

  if (status === 'failed') {
    return { reason: 'failed', shouldStop: true };
  }

  if (elapsedMs >= timeoutMs) {
    return { reason: 'timeout', shouldStop: true };
  }

  return { reason: 'continue', shouldStop: false };
}

export const DEFAULT_PROVISIONING_POLL_CONFIG = {
  intervalMs: PROVISIONING_POLL_INTERVAL_MS,
  timeoutMs: PROVISIONING_POLL_TIMEOUT_MS,
} as const;

export function getNextPollDelayMs(
  _attempt: number,
  intervalMs: number = PROVISIONING_POLL_INTERVAL_MS,
): number {
  return Math.max(0, intervalMs);
}
