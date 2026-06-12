import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROVISIONING_POLL_CONFIG,
  evaluateProvisioningPoll,
  getNextPollDelayMs,
} from '@/lib/onboarding/polling';

describe('evaluateProvisioningPoll', () => {
  it('stops with complete when status is complete', () => {
    expect(evaluateProvisioningPoll('complete', 0)).toEqual({
      reason: 'complete',
      shouldStop: true,
    });
  });

  it('stops with failed when status is failed', () => {
    expect(evaluateProvisioningPoll('failed', 1000)).toEqual({
      reason: 'failed',
      shouldStop: true,
    });
  });

  it('continues while pending and under timeout', () => {
    expect(
      evaluateProvisioningPoll(
        'pending',
        30_000,
        DEFAULT_PROVISIONING_POLL_CONFIG.timeoutMs,
      ),
    ).toEqual({
      reason: 'continue',
      shouldStop: false,
    });
  });

  it('stops with timeout when pending beyond limit', () => {
    expect(
      evaluateProvisioningPoll(
        'pending',
        DEFAULT_PROVISIONING_POLL_CONFIG.timeoutMs,
        DEFAULT_PROVISIONING_POLL_CONFIG.timeoutMs,
      ),
    ).toEqual({
      reason: 'timeout',
      shouldStop: true,
    });
  });
});

describe('getNextPollDelayMs', () => {
  it('returns configured interval', () => {
    expect(getNextPollDelayMs(0)).toBe(
      DEFAULT_PROVISIONING_POLL_CONFIG.intervalMs,
    );
  });
});
