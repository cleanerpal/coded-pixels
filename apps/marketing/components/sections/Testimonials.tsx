import { Card } from '@codedpixels/ui';

/** Fictional industry-specific stories — labelled per Q58. */
const STORIES = [
  {
    initials: "SC",
    industry: "Cleaning & trades",
    quote:
      "We wanted a quote form and a professional look without paying agency rates. The configurator made the price obvious from the start.",
  },
  {
    initials: "TP",
    industry: "Trades portfolio",
    quote:
      "Emergency call-out CTA and a portfolio section — we picked TradePro and added booking. Total stayed clear on screen.",
  },
  {
    initials: "SS",
    industry: "Beauty & wellness",
    quote:
      "Calm spa aesthetic out of the box. We upgraded to Growth for CRM and still knew exactly what we would pay each month.",
  },
  {
    initials: "AL",
    industry: "Professional services",
    quote:
      "Conservative layout suited our firm. No technical skills needed — choose template, tick what you need, done.",
  },
  {
    initials: "CS",
    industry: "Retail",
    quote:
      "Product showcase and store-ready pages. Pay only for e-commerce when we need it — no lock-in contract.",
  },
  {
    initials: "TL",
    industry: "Hospitality",
    quote:
      "Menu and reservations layout fit our pub. Cancel anytime gave us confidence to start small and grow.",
  },
] as const;

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-b border-border bg-surface py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="testimonials-heading"
            className="text-2xl font-bold text-text sm:text-3xl"
          >
            Example customer stories
          </h2>
          <p className="mt-3 text-text-muted">
            Illustrative scenarios by industry — not real customer reviews.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((story) => (
            <li key={story.initials}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {story.initials}
                  </span>
                  <p className="text-sm font-medium text-text-muted">
                    {story.industry}
                  </p>
                </div>
                <blockquote className="mt-4 text-sm text-text">
                  <p>&ldquo;{story.quote}&rdquo;</p>
                </blockquote>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
