'use client';

export type ConfiguratorStep = 1 | 2 | 3;

const STEPS: { step: ConfiguratorStep; label: string; shortLabel: string }[] = [
  { step: 1, label: 'Choose Template', shortLabel: 'Templates' },
  { step: 2, label: 'Add Features', shortLabel: 'Features' },
  { step: 3, label: 'Review & Preview', shortLabel: 'Review' },
];

export interface StepProgressProps {
  activeStep: ConfiguratorStep;
  onStepChange: (step: ConfiguratorStep) => void;
}

export function StepProgress({ activeStep, onStepChange }: StepProgressProps) {
  return (
    <nav aria-label="Configurator progress" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
        {STEPS.map(({ step, label, shortLabel }, index) => {
          const isActive = activeStep === step;
          const isComplete = activeStep > step;

          return (
            <li key={step} className="flex items-center gap-2 sm:gap-4">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`hidden h-px w-6 sm:block sm:w-10 ${
                    isComplete || isActive ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onStepChange(step)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step}: ${label}`}
                className={`flex items-center gap-2 rounded-card px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : isComplete
                      ? 'text-primary hover:bg-primary/5'
                      : 'text-text-muted hover:bg-background hover:text-text'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-primary text-surface'
                      : isComplete
                        ? 'bg-primary/20 text-primary'
                        : 'bg-border text-text-muted'
                  }`}
                >
                  {step}
                </span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{shortLabel}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
