# Ticket Deliverables — Resume Verification

**Used by:** `/codedpixels resume` — Nathan checks these paths exist before trusting `project-status.md`.

If a ticket is marked complete but deliverables are missing → **reopen ticket**, do not advance.

---

## Wave 1

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-001** | `package.json`, `next.config.ts`, `app/layout.tsx`, `npm run build` succeeds |
| **ENG-002** | `app/globals.css` with `--color-primary`, `--color-accent`, Inter font |
| **ENG-003** | `apps/marketing/types/index.ts` (re-export), `packages/shared-types/src/marketing/config.ts`, `apps/marketing/lib/features.ts`, `lib/packages.ts`, `lib/templates.ts` |
| **DOC-001** | `docs/planning/cookie-consent-legal-spec.md` |

## Wave 2

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-004** | `lib/pricing.ts`, `lib/pricing.test.ts`, all pricing tests green |
| **ENG-005** | `components/layout/Header.tsx`, `components/layout/Footer.tsx` |
| **ENG-006** | `lib/config-state.ts`, `lib/config-state.test.ts`, round-trip tests green |

## Wave 3

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-007** | URL sync hook under `components/configurator/` or `lib/` |
| **ENG-008** | `components/configurator/Step1Templates.tsx` (or equivalent) |
| **ENG-009** | Step 2 features component |
| **ENG-010** | `PricingSidebar.tsx` (or equivalent) |
| **ENG-011** | Package cards component |
| **ENG-012** | Mobile pricing bar component |

## Wave 4

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-013** | `components/configurator/LivePreviewPanel.tsx`, `lib/template-themes.ts` |
| **ENG-014** | Annual toggle in `PricingSidebar.tsx`, `annualSavingsPence` in `lib/pricing.ts` |
| **ENG-015** | `ConfiguratorShell.tsx`, `StepProgress.tsx`, `#configurator` wired in `app/page.tsx` |
| **ENG-016** | `components/sections/Hero.tsx`, HowItWorks, Testimonials, FAQ; landing on `/` |

## Wave 5

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **DOC-002** | `app/privacy/page.tsx`, `app/terms/page.tsx` with real content |
| **ENG-017** | `app/templates/page.tsx`, template gallery component |
| **ENG-018** | `app/pricing/page.tsx`, comparison table component |
| **ENG-019** | Real FAQ + HowItWorks content in `components/sections/` |
| **INF-001** | `firebase.json`, `.firebaserc`, `functions/` scaffold |
| **INF-004** | Sentry configs, `lib/sentry/pii-scrubber.ts`, tests |

## Wave 6

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **INF-002** | `firestore.rules` from firestore-rules-spec §11 |
| **ENG-021** | Cookie consent banner + `lib/cookie-consent.ts` |

## Wave 7

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **INF-003** | `functions/src/callables/marketing.ts` (+ `submitSignup.ts` shim), submitSignup + submitSiteImportWaitlist Callables |
| **ENG-022** | `lib/analytics.ts`, `AnalyticsProvider`, consent-gated GA4 |

## Wave 8

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-020** | `app/get-started/`, GetStartedFlow, calls submitSignup |
| **ENG-023** | `SiteImportWaitlistCard.tsx`, wired in Step2Features |

## Wave 9

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **QA-001** | `e2e/configurator.spec.ts` |
| **QA-002** | `e2e/get-started.spec.ts` |
| **QA-003** | `lighthouserc.json`, `docs/planning/perf-budget.md`, `test:lighthouse` |
| **QA-004** | `app/sitemap.ts`, `app/robots.ts`, pricing JSON-LD |
| **QA-005** | `tests/firestore/`, `npm run test:rules` |
| **QA-006** | `e2e/spine.spec.ts`, `playwright.config.ts`, `test:e2e` |

## Wave 10 (Platform Phase 2 prep — P2-W1 + P2-W2)

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **DOC-003** | `docs/planning/add-on-deliverables.md` |
| **DOC-004** | `docs/planning/stripe-catalogue.md` |
| **DOC-005** | `docs/specs/builder-ui-spec.md` §5.1–5.2 expanded |
| **DOC-006** | `docs/specs/site-renderer-architecture.md` |
| **DOC-007** | `docs/planning/monorepo-layout-spec.md` |
| **DOC-008** | `docs/planning/template-seeding-ci-spec.md` |

## Wave 11

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **B0-001** | `turbo.json`, `apps/marketing/`, `packages/ui`, `packages/shared-types` |

## Wave 12

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **B1-001** | `packages/templates/seeds/` (manifest + 11 `*.defaultSections.json`), `@codedpixels/shared-types` Platform Phase 2 types (`Section`, `TemplateDoc`, `Company`, `Site`, `Page`, `PageVersion`, `Member`), `npm run validate:templates`, `npm run seed:templates:emulator`, `docs/specs/firestore-schema.md` §5.2 `seedVersion`/`contentHash` |
| **B1-002** | `firestore.rules` §4.2–4.5 tenant expansion (`companyHasFeature`, leads CRM gate, products public read), `tests/firestore/rules/firestore.rules.test.ts` B1 coverage, `npm run test:rules` green |

## Wave 13

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **B2-001** | `apps/builder/` shell routes (dashboard, onboarding, preview placeholder) |
| **B2-002** | `packages/component-registry/` — `@codedpixels/component-registry` with registry map, Zod schemas (§3.1 MVP types), React renderers, editor-panels subpath, `SectionRenderer`, `validateSectionProps`, vitest tests |

## Wave 14–18 (Platform Phase 2)

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **B3-001** | `functions/src/callables/publishSite.ts` (+ `lib/publishSite.ts` shim), `apps/site-renderer/app/api/revalidate/route.ts` |
| **B4-001** | `apps/site-renderer/app/[[...pageSlug]]/page.tsx`, `apps/site-renderer/middleware.ts` |
| **B6-001** | `functions/src/lib/provisionTenant.ts`, `functions/src/callables/createCheckoutSession.ts` |
| **B6-002** | `apps/builder/app/onboarding/page.tsx`, `apps/builder/lib/onboarding/wizard-state.ts` |
| **B7-001** | `functions/src/lib/clamAvScan.ts`, `functions/src/callables/createAssetUpload.ts` |
| **B8-001** | `apps/builder/app/dashboard/leads/page.tsx`, `apps/builder/app/dashboard/products/page.tsx` |
| **DOC-009** | `docs/planning/finops-slos.md` |
| **B9-001** | `functions/src/lib/formSecurity.ts` (honeypot + recaptcha), `functions/src/callables/submitLead.ts` |

## Wave 19 — Phase 2.1 Marketing template previews

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **DOC-010** | `docs/planning/marketing-template-preview-spec.md` (§3.4–§9), Q65/Q66 in `codedpixels-project-plan.md`, `isPlatformDemo` in `firestore-schema.md` §6, `forge-scale-advisory-response.md` |
| **INF-005** | `packages/templates/scripts/seed-demos.mjs`, `npm run seed:template-demos:emulator`, `packages/shared-types/src/constants/reserved-template-slugs.ts`, `Company.isPlatformDemo`, demo `noindex` in site-renderer |
| **INF-006** | `scripts/generate-template-thumbnails.mjs`, `npm run generate:template-thumbnails`, WebP under `apps/marketing/public/templates/previews/` |
| **ENG-024** | `apps/marketing/lib/template-preview-urls.ts`, preview links in `Step1Templates.tsx` + `LivePreviewPanel.tsx` |
| **ENG-025** | `TemplateGallery.tsx` WebP thumbnails + preview links + starter H1/CTA copy |
| **ENG-026** | Reserved slug validation in `apps/builder/lib/onboarding/slug.ts` + tests |
| **ENG-027** | Step 1 category filter chips; Starter package copy in `lib/packages.ts` |
| **QA-007** | `apps/marketing/e2e/template-preview.spec.ts` (filter + select + preview) |

## Wave 20 — Starter library expansion

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **DOC-011** | `docs/planning/template-addition-governance-spec.md` |
| **B10-001** | 4 new `*.defaultSections.json`, manifest, `lib/templates.ts`, demo seed for new IDs |
| **B10-002** | `packages/templates/scripts/new-template.mjs` |
| **INF-007** | GitHub Actions workflow for thumbnail generation on seed changes |

## Wave 13+

## Verification commands (Nathan runs on resume)

```bash
git log -5 --oneline
git status
git rev-parse HEAD
# Per completed ticket: test -f <path> or glob
npm test          # if package.json exists — must pass before advancing
```

Cross-check **Last commit SHA** in `project-status.md` matches `git rev-parse HEAD` (or is ancestor if local ahead).
