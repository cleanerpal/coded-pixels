import { describe, expect, it } from 'vitest';

import {
  advanceWizardStep,
  canSkipStep,
  clampOnboardingStep,
  getBuilderEditPath,
  getStepProgressPercent,
} from '@/lib/onboarding/wizard-state';

describe('clampOnboardingStep', () => {
  it('defaults invalid values to step 1', () => {
    expect(clampOnboardingStep(undefined)).toBe(1);
    expect(clampOnboardingStep(0)).toBe(1);
  });

  it('caps values above 4', () => {
    expect(clampOnboardingStep(9)).toBe(4);
  });
});

describe('canSkipStep', () => {
  it('allows skip on steps 3 and 4 only', () => {
    expect(canSkipStep(1)).toBe(false);
    expect(canSkipStep(2)).toBe(false);
    expect(canSkipStep(3)).toBe(true);
    expect(canSkipStep(4)).toBe(true);
  });
});

describe('advanceWizardStep', () => {
  it('moves to next step from plan confirm', () => {
    expect(advanceWizardStep(1, 'site-1')).toEqual({
      kind: 'next',
      step: 2,
    });
  });

  it('skips from domain to builder step', () => {
    expect(advanceWizardStep(3, 'site-1', { skip: true })).toEqual({
      kind: 'skipped',
      step: 4,
    });
  });

  it('redirects to builder edit on final step', () => {
    expect(advanceWizardStep(4, 'site-abc')).toEqual({
      kind: 'complete',
      redirectPath: getBuilderEditPath('site-abc'),
    });
  });
});

describe('getStepProgressPercent', () => {
  it('returns quarter increments', () => {
    expect(getStepProgressPercent(1)).toBe(25);
    expect(getStepProgressPercent(4)).toBe(100);
  });
});
