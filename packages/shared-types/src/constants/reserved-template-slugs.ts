/**
 * Library template IDs reserved for platform demo tenants — not claimable as customer subdomains.
 * @see docs/planning/marketing-template-preview-spec.md §3.6–3.7
 * Aligned with Dr. Rafael Ortiz on onboarding slug guard (ENG-026).
 */
export const RESERVED_TEMPLATE_SLUGS = [
  'sparkle-clean',
  'trade-pro',
  'serenity-spa',
  'glow-studio',
  'apex-legal',
  'corner-shop',
  'the-local',
  'learn-hub',
  'business-core',
  'startup-launch',
  'wellness-clinic',
  'clear-accounting',
  'focus-photography',
  'fit-hub',
] as const;

export type ReservedTemplateSlug = (typeof RESERVED_TEMPLATE_SLUGS)[number];

export function isReservedTemplateSlug(slug: string): slug is ReservedTemplateSlug {
  return (RESERVED_TEMPLATE_SLUGS as readonly string[]).includes(slug);
}
