import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    title: "Choose a template",
    description:
      "Pick from professional designs for trades, beauty, legal, and more — or start with a custom layout.",
  },
  {
    title: "Add only what you need",
    description:
      "Toggle features like CRM, booking, or e-commerce. Every add-on shows + £X.XX/mo — no hidden fees.",
  },
  {
    title: "See your live preview",
    description:
      "Watch your site and price update instantly. The sidebar total is always the exact amount.",
  },
  {
    title: "Get started",
    description:
      "Save your plan and sign up when you are ready. Cancel or change your plan anytime.",
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
            Four simple steps from template to a plan you can share.
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
