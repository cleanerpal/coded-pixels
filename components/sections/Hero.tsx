import Link from "next/link";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-5xl"
          >
            Build your professional website in minutes. Pay only for what you
            need.
          </h1>

          <p className="mt-4 text-lg text-text-muted sm:text-xl">
            Starting at £9.99/mo · Instant preview · Cancel anytime
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#configurator"
              className="inline-flex items-center justify-center rounded-card bg-accent px-4 py-2 text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Start Building
            </a>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-card border border-primary bg-surface px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
