'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ProvisioningJob } from '@codedpixels/shared-types';

import { useAuth } from '@/lib/auth/use-auth';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  DEFAULT_PROVISIONING_POLL_CONFIG,
  evaluateProvisioningPoll,
} from '@/lib/onboarding/polling';
import { fetchProvisioningJob } from '@/lib/onboarding/provisioning-client';
import {
  createMockProvisioningJob,
  MOCK_PROVISIONING_JOB_ID,
} from '@/lib/onboarding/mock-provisioning';

export type ProvisioningPollState =
  | { status: 'idle' }
  | { status: 'polling'; jobId: string; elapsedMs: number }
  | { status: 'complete'; job: ProvisioningJob }
  | { status: 'failed'; message: string; job?: ProvisioningJob }
  | { status: 'timeout'; jobId: string };

function useMockProvisioning(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_PROVISIONING === 'true' ||
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
  );
}

export function useProvisioningPoll(jobId: string | null): ProvisioningPollState {
  const { user } = useAuth();
  const isMock = useMockProvisioning();
  const [state, setState] = useState<ProvisioningPollState>({ status: 'idle' });
  const startedAtRef = useRef<number | null>(null);

  const pollOnce = useCallback(async () => {
    if (!jobId || !user) {
      return;
    }

    if (isMock || jobId === MOCK_PROVISIONING_JOB_ID) {
      setState({
        status: 'complete',
        job: createMockProvisioningJob(user.uid),
      });
      return;
    }

    try {
      const job = await fetchProvisioningJob(getFirebaseFirestore(), jobId);
      const elapsedMs = startedAtRef.current
        ? Date.now() - startedAtRef.current
        : 0;

      if (!job) {
        const decision = evaluateProvisioningPoll('pending', elapsedMs);
        if (decision.reason === 'timeout') {
          setState({ status: 'timeout', jobId });
        } else {
          setState({ status: 'polling', jobId, elapsedMs });
        }
        return;
      }

      const decision = evaluateProvisioningPoll(job.status, elapsedMs);

      if (decision.reason === 'complete') {
        setState({ status: 'complete', job });
        return;
      }

      if (decision.reason === 'failed') {
        setState({
          status: 'failed',
          message: job.error ?? 'We could not finish setting up your account.',
          job,
        });
        return;
      }

      if (decision.reason === 'timeout') {
        setState({ status: 'timeout', jobId });
        return;
      }

      setState({ status: 'polling', jobId, elapsedMs });
    } catch {
      setState({
        status: 'failed',
        message: 'Could not check provisioning status. Please try again.',
      });
    }
  }, [isMock, jobId, user]);

  useEffect(() => {
    if (!jobId || !user) {
      setState({ status: 'idle' });
      return;
    }

    startedAtRef.current = Date.now();
    setState({ status: 'polling', jobId, elapsedMs: 0 });
    void pollOnce();

    const intervalId = window.setInterval(() => {
      void pollOnce();
    }, DEFAULT_PROVISIONING_POLL_CONFIG.intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [jobId, pollOnce, user]);

  return state;
}
