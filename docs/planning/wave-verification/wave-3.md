# Wave 3 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** ENG-007 through ENG-012 are done  
**Milestone:** M1 configurator **components** exist — but they are **not wired to the homepage yet**

---

## Important — read this first

After Wave 3, running `npm run dev` and opening `/` still shows the **token demo page** from Wave 1. That is **correct**, not a bug.

Wave 3 built the configurator pieces in isolation (like pre-fabricated counter parts). **Wave 4 (ENG-015)** bolts them onto the homepage. Until then, most Wave 3 manual browser tests use **URL tricks** or a temporary dev page — see Section D below.

---

## In one sentence

After Wave 3, all configurator UI components and the URL-sync hook exist in code, with 65 automated tests passing — but you will not see the full configurator on `/` until Wave 4.

---

## Before you start

```bash
npm install
npm run dev
```

Terminal checks:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Expect **65 tests** (14 pricing + 44 config-state + 7 URL sync helpers).

---

## What you should see in the browser today (Wave 3 shipped)

### Homepage (`/`)

Same as Wave 2:

- Header with logo, nav, Get Started
- Token demo card in the middle
- Dark footer with Privacy/Terms

**You will not see:** template grid, feature toggles, pricing sidebar, package cards, or mobile pricing bar.

### Header / footer / legal stubs

Unchanged from Wave 2 — still passes those checks.

---

## What Wave 3 added (in the codebase)

| Component | File | Purpose |
|-----------|------|---------|
| URL sync hook | `use-config-url-state.ts` | Keeps config in the address bar |
| Step 1 — Templates | `Step1Templates.tsx` | Pick a look |
| Step 2 — Features | `Step2Features.tsx` | Toggle add-ons |
| Pricing sidebar | `PricingSidebar.tsx` | Desktop live total |
| Package cards | `PackageCards.tsx` | Starter / Growth / Pro / Custom |
| Mobile pricing bar | `MobilePricingBar.tsx` | Phone sticky total |

---

## Manual test checklist

### A — Automated proof (do this first)

- [ ] `npm test` → 65/65 pass
- [ ] `npm run build` → succeeds (may show one ESLint warning in MobilePricingBar — non-blocking)
- [ ] All files exist:

```bash
test -f components/configurator/use-config-url-state.ts
test -f components/configurator/Step1Templates.tsx
test -f components/configurator/Step2Features.tsx
test -f components/configurator/PricingSidebar.tsx
test -f components/configurator/PackageCards.tsx
test -f components/configurator/MobilePricingBar.tsx
echo "All Wave 3 files present"
```

### B — Wave 2 regression (browser)

- [ ] Header, footer, `/privacy`, `/terms` still work
- [ ] No new console errors on `/`

### C — URL encoding (ENG-006 + ENG-007) — paste these URLs

Even without the configurator on `/`, the **decode logic** is testable via automated tests. To sanity-check yourself:

Run:

```bash
npm test -- lib/config-state.test.ts lib/config-url-sync.test.ts
```

- [ ] All pass

Optional — after Wave 4, these URLs should restore state on refresh:

| URL | Expected behaviour (when wired) |
|-----|--------------------------------|
| `/?package=growth` | Growth features pre-selected; live total £24.96/mo |
| `/?template=trade-pro` | Trade Pro template selected |
| `/?template=not-real&features=crm` | Invalid template dropped; CRM kept (Q40) |

**At Wave 3 only:** pasting these on `/` will **not** change the visible page — note for Wave 4 retest.

### D — Temporary dev preview (optional, for curious testers)

If you want to *see* Wave 3 components before Wave 4, a developer can temporarily add a sandbox to `app/page.tsx` (Nathan/lane agent only — do not commit unless coordinating):

```tsx
// Temporary — remove before Wave 4 merge
import { Suspense } from 'react';
import { useConfigUrlState } from '@/components/configurator/use-config-url-state';
import { Step1Templates } from '@/components/configurator/Step1Templates';
// ... etc.
```

**If you have not added that sandbox:** skip Section D visual checks and rely on Section A + E file inspection.

### E — Component inspection (no sandbox needed)

Open each file and confirm:

**Step1Templates (ENG-008)**

- [ ] 10 library templates + custom card
- [ ] `aria-current` on selected template
- [ ] Custom card shows billing toggle (recurring vs one-time)

**Step2Features (ENG-009)**

- [ ] Feature groups: Core, Growth, Optional, Ecommerce, Automation, Advanced
- [ ] Switches use `role="switch"`
- [ ] Site Import card says “Coming soon” and **+ £6.99/mo** (699 pence)

**PricingSidebar (ENG-010)**

- [ ] Uses `monthlyTotalPence` from pricing engine
- [ ] Get Started disabled when no template (`hasTemplate` check)
- [ ] Copy link button present

**PackageCards (ENG-011)**

- [ ] Four cards; Growth has “Most Popular”
- [ ] Footnote about exact total in summary

**MobilePricingBar (ENG-012)**

- [ ] `lg:hidden` — desktop uses sidebar instead
- [ ] Expand/collapse with `aria-expanded`

### F — When Wave 4 lands — retest these in the browser

Save this list; run again after Wave 4:

- [ ] Full configurator visible at `/#configurator`
- [ ] Click Growth package → total shows **£24.96/mo** (not £24.99)
- [ ] Select template → Get Started enables
- [ ] Toggle CRM → URL updates after ~300ms; refresh keeps choices
- [ ] Copy link → paste in new tab → same config
- [ ] Phone width → bottom sticky bar; expand shows same total as sidebar
- [ ] Site Import card visible but not toggleable

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Still expect configurator on `/` | Normal at Wave 3 — wait for ENG-015 (Wave 4) |
| Test count below 65 | Missing `lib/config-url-sync.test.ts` or pricing/config tests |
| Growth total wrong in tests | Engine must be 2496 pence, not 2499 |

---

## Expert alignment

Aligned with **Dr. Sophia Laurent** (configurator UX), **Dr. Nadia Sokolov** (switches, focus, mobile bar), **Dr. Marcus Klein** (live vs card pricing), **Dr. Lena Petrova** on **Q40** (URL restore).
