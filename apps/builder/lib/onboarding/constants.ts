/** Q36 — post-provision onboarding wizard (codedpixels-project-plan.md §18). */
export const ONBOARDING_STEP_COUNT = 4;

export const ONBOARDING_STEPS = [
  { step: 1, title: 'Your plan', description: 'Confirm your selections' },
  { step: 2, title: 'Name your business', description: 'Choose a display name' },
  { step: 3, title: 'Your domain', description: 'Subdomain for your site' },
  { step: 4, title: 'Edit homepage', description: 'Open the builder' },
] as const;

export type OnboardingStepNumber = (typeof ONBOARDING_STEPS)[number]['step'];

/** B6-002 polling contract — Dr. Kai Nakamura on provisioningJobs. */
export const PROVISIONING_POLL_INTERVAL_MS = 2_000;
export const PROVISIONING_POLL_TIMEOUT_MS = 120_000;

export const CODEDPIXELS_SUBDOMAIN_SUFFIX = '.codedpixels.co.uk';
