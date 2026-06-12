import { Suspense } from 'react';

import {
  ConfiguratorShell,
  ConfiguratorShellFallback,
} from '@/components/configurator/ConfiguratorShell';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { PackageSection } from '@/components/sections/PackageSection';
import { Testimonials } from '@/components/sections/Testimonials';

export default function Home() {
  return (
    <main>
      <Hero />
      <PackageSection />

      <section
        id="configurator"
        aria-labelledby="configurator-heading"
        className="scroll-mt-20 border-b border-border bg-background px-4 py-12 pb-28 sm:px-6 lg:py-16 lg:pb-16"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <h2
              id="configurator-heading"
              className="text-2xl font-bold text-text sm:text-3xl"
            >
              Configure your website
            </h2>
            <p className="mt-2 text-text-muted">
              Choose a template, add features, and see your price update in
              real time.
            </p>
          </header>

          <Suspense fallback={<ConfiguratorShellFallback />}>
            <ConfiguratorShell />
          </Suspense>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <FAQ />
    </main>
  );
}
