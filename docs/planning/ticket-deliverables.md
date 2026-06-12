# Ticket Deliverables — Resume Verification

**Used by:** `/codedpixels resume` — Nathan checks these paths exist before trusting `project-status.md`.

If a ticket is marked complete but deliverables are missing → **reopen ticket**, do not advance.

---

## Wave 1

| Ticket | Required deliverables (minimum) |
|--------|----------------------------------|
| **ENG-001** | `package.json`, `next.config.ts`, `app/layout.tsx`, `npm run build` succeeds |
| **ENG-002** | `app/globals.css` with `--color-primary`, `--color-accent`, Inter font |
| **ENG-003** | `types/index.ts`, `lib/features.ts`, `lib/packages.ts`, `lib/templates.ts` |
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

## Wave 6+

**Manual browser verification:** [wave-verification/](wave-verification/README.md) — one guide per wave (Mia Thompson).

---

## Verification commands (Nathan runs on resume)

```bash
git log -5 --oneline
git status
git rev-parse HEAD
# Per completed ticket: test -f <path> or glob
npm test          # if package.json exists — must pass before advancing
```

Cross-check **Last commit SHA** in `project-status.md` matches `git rev-parse HEAD` (or is ancestor if local ahead).
