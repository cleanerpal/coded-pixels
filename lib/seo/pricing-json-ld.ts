import { PACKAGES } from '@/lib/packages';
import { SITE_URL } from '@/lib/seo/constants';

function monthlyPricePounds(pence: number): string {
  return (pence / 100).toFixed(2);
}

/**
 * SoftwareApplication + Offer structured data for `/pricing`.
 * Aligned with codedpixels-project-plan.md § SEO (Dr. Rajiv Singh).
 */
export function buildPricingJsonLd(): Record<string, unknown> {
  const offers = PACKAGES.map((pkg) => {
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      name: `${pkg.name} plan`,
      description: pkg.description,
      url: `${SITE_URL}/pricing`,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'GBP',
    };

    if (pkg.cardDisplayMonthlyPence !== null) {
      offer.price = monthlyPricePounds(pkg.cardDisplayMonthlyPence);
      offer.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: monthlyPricePounds(pkg.cardDisplayMonthlyPence),
        priceCurrency: 'GBP',
        unitText: 'month',
        billingDuration: 'P1M',
      };
    }

    return offer;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CodedPixels',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Professional websites without agency prices. Configure templates, features, and packages from £9.99/mo.',
    url: `${SITE_URL}/pricing`,
    offers,
  };
}
