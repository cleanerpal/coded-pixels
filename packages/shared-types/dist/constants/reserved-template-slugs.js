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
];
export function isReservedTemplateSlug(slug) {
    return RESERVED_TEMPLATE_SLUGS.includes(slug);
}
