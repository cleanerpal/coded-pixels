import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    title: "Choose a template",
    description:
      "Browse ten industry templates or pick Custom Template for a bespoke design. Switch anytime — your selections stay in sync.",
  },
  {
    title: "Add only what you need",
    description:
      "Toggle features like CRM, booking, or e-commerce. Each add-on shows +£X.XX/mo. Starter, Growth, and Pro presets pre-fill choices you can change.",
  },
  {
    title: "See your live preview",
    description:
      "Watch your mock site and pricing summary update instantly. The sidebar total is always the exact monthly amount — package cards may round for display.",
  },
  {
    title: "Save your plan",
    description:
      "Get Started with your email when you are ready. MVP sign-up takes no payment — we save your plan and will be in touch. Cancel anytime when billing goes live.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-b border-border bg-background py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-bold text-text sm:text-3xl"
          >
            How it works
          </h2>
          <p className="mt-3 text-text-muted">
            Four steps from template to a plan you can share — no payment on sign-up today.
          </p>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-surface"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
