import { ONBOARDING_STEPS } from '@/lib/onboarding/constants';
import type { OnboardingStepNumber } from '@/lib/onboarding/constants';
import { getStepProgressPercent } from '@/lib/onboarding/wizard-state';

type OnboardingProgressProps = {
  currentStep: OnboardingStepNumber;
};

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const percent = getStepProgressPercent(currentStep);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text">
          Step {currentStep} of {ONBOARDING_STEPS.length}
        </span>
        <span className="text-text-muted">{percent}%</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-pill bg-border"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
      >
        <div
          className="h-full rounded-pill bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="hidden gap-2 sm:grid sm:grid-cols-4">
        {ONBOARDING_STEPS.map((step) => {
          const isActive = step.step === currentStep;
          const isComplete = step.step < currentStep;
          return (
            <li
              key={step.step}
              className={`rounded-card border px-3 py-2 text-xs ${
                isActive
                  ? 'border-primary bg-primary/5 font-semibold text-primary'
                  : isComplete
                    ? 'border-success/40 bg-success/5 text-text'
                    : 'border-border text-text-muted'
              }`}
            >
              {step.title}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
