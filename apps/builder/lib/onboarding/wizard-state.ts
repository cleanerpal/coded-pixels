import {
  ONBOARDING_STEP_COUNT,
  type OnboardingStepNumber,
} from '@/lib/onboarding/constants';

export type WizardAdvanceResult =
  | { kind: 'next'; step: OnboardingStepNumber }
  | { kind: 'complete'; redirectPath: string }
  | { kind: 'skipped'; step: OnboardingStepNumber };

/** Steps 3–4 skippable per Q36. */
export function canSkipStep(step: OnboardingStepNumber): boolean {
  return step === 3 || step === 4;
}

export function clampOnboardingStep(step: number | undefined): OnboardingStepNumber {
  if (!step || step < 1) {
    return 1;
  }
  if (step > ONBOARDING_STEP_COUNT) {
    return ONBOARDING_STEP_COUNT;
  }
  return step as OnboardingStepNumber;
}

export function getBuilderEditPath(siteId: string): string {
  return `/sites/${siteId}/edit`;
}

export function advanceWizardStep(
  currentStep: OnboardingStepNumber,
  siteId: string,
  options?: { skip?: boolean },
): WizardAdvanceResult {
  if (options?.skip && canSkipStep(currentStep)) {
    const next = (currentStep + 1) as OnboardingStepNumber;
    if (next > ONBOARDING_STEP_COUNT) {
      return { kind: 'complete', redirectPath: getBuilderEditPath(siteId) };
    }
    return { kind: 'skipped', step: next };
  }

  if (currentStep >= ONBOARDING_STEP_COUNT) {
    return { kind: 'complete', redirectPath: getBuilderEditPath(siteId) };
  }

  return { kind: 'next', step: (currentStep + 1) as OnboardingStepNumber };
}

export function getStepProgressPercent(step: OnboardingStepNumber): number {
  return Math.round((step / ONBOARDING_STEP_COUNT) * 100);
}
