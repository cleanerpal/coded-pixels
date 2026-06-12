import { PricingPageContent } from '@/components/pricing/PricingPageContent';
import { JsonLd } from '@/components/seo/JsonLd';
import { createPageMetadata } from '@/lib/seo/page-metadata';
import { buildPricingJsonLd } from '@/lib/seo/pricing-json-ld';

export const metadata = createPageMetadata({
  title: 'Pricing',
  description:
    'Compare CodedPixels packages — Starter, Growth, Pro, and Custom. Starting at £9.99/mo with no hidden fees.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={buildPricingJsonLd()} />
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Simple, honest pricing
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Pay only for what you need. Every add-on shows its price — no
          surprises at checkout.
        </p>
      </div>

      <div className="mt-12">
        <PricingPageContent />
      </div>
    </main>
  );
}
