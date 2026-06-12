# CodedPixels — Project Plan & Technical Specification

**Document Owner:** Dr. Lena Moreau  
**Coordinated by:** Dr. Nathan Cole  
**Status:** Pre-implementation planning  
**Last updated:** 12 June 2026 (Q63–Q70; Wave 19 template preview spec + advisory amendment)

---

## Executive Summary

CodedPixels is a conversion-focused SaaS marketing site for a modular website builder. The hero experience is an interactive product configurator: users choose a template, toggle add-on features, and see monthly (and annual) pricing update in real time. Base price is **£9.99/mo**; every add-on displays its individual recurring cost.

This document consolidates expert input from the full team (see [Expert Contributions](#expert-contributions-by-domain)) into a single build-ready specification.

---

## 1. Product Vision & Success Criteria

**Dr. Samuel Ruiz (Product Owner)** — The site is not a brochure; it is the first product touchpoint. Success = user completes configurator and clicks “Get Started” with confidence in what they will pay.

| Metric | Target |
|--------|--------|
| Configurator completion rate | ≥ 40% of visitors who scroll to configurator |
| Time to first price interaction | < 5 seconds from landing |
| Mobile configurator usability | Full flow completable on 375px viewport |
| Lighthouse Performance (mobile) | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |

**Ms. Elena Voss (CEO Perspective)** — Position CodedPixels as “professional websites without agency prices.” UK-first, trust-first, upgrade-friendly.

**Decision (Q7 — Elena Voss + Marcus Chen):** Brand name confirmed as **CodedPixels** (camelCase in product UI, “Coded Pixels” acceptable in prose). Working domain: **codedpixels.co.uk**. Logo: wordmark placeholder for MVP (indigo “Coded” + cyan “Pixels”); replace with final SVG before launch.

---

## 2. User Journey & Information Architecture

**Dr. Sophia Laurent (Product Flow & UX)** + **Mr. Theo Laurent (Conversion Design)**

### Primary flow

```
Landing (Hero) → Configurator (Steps 1–3) → Live Preview → Get Started → Sign up / Checkout (simulated)
```

### Site map

| Route | Purpose |
|-------|---------|
| `/` | Hero + Packages + Configurator + How It Works + Testimonials + FAQ (anchor links) |
| `/templates` | Full template gallery with category filters |
| `/pricing` | Packages summary + full feature comparison table |
| `/get-started` | Simulated checkout / sign-up (query params carry config state) |
| `/privacy` | Short GDPR-compliant Privacy Policy (required before email capture) |
| `/terms` | Short Terms of Service |

### Hero section

- **Headline:** “Build your professional website in minutes. Pay only for what you need.”
- **Subheadline:** Starting at £9.99/mo · Instant preview · Cancel anytime
- **Primary CTA:** “Start Building” → smooth scroll to `#configurator`
- **Secondary CTA:** “Browse Templates” → `/templates`

### Configurator (3 steps, always visible progress)

| Step | Name | Behaviour |
|------|------|-----------|
| 1 | Choose starter design | Grid of **10 starter templates** + Custom Template option; switch anytime (Q67) |
| 2 | Add Features | Grouped toggles with individual `+ £X.XX/mo` labels |
| 3 | Review & Preview | Live preview panel + pricing summary + Get Started |

**UX rules:**
- Pricing sidebar/sticky bar visible from Step 1 onward (desktop: right sidebar; mobile: sticky bottom bar expandable to full sheet)
- Package cards above configurator pre-populate selections (Starter / Growth / Pro / Custom)
- **Decision (Q10 — Sophia Laurent):** Package click **pre-selects** features; user **can toggle off** any pre-selected add-on. Live total updates immediately. No locked/package-forced features in MVP.
- “Custom” package clears presets and opens configurator with base only
- Micro-copy: “Upgrade or downgrade anytime — no lock-in contracts”

---

## 3. Pricing Model & Business Rules

**Dr. Marcus Klein (Pricing Logic)** + **Dr. Priya Desai (Platform Economics)**

### Base plan — £9.99/mo

Included (no extra charge):
- Professional website + hosting
- Custom domain + SSL
- Mobile responsive
- Basic contact/quote form
- Access to template library

### Add-on features (monthly recurring)

| ID | Feature | Monthly | Notes |
|----|---------|---------|-------|
| `crm` | CRM & Lead Management | +£4.99 | |
| `email-automation` | Email Automation Sequences | +£5.99 | |
| `booking` | Advanced Booking & Appointments | +£6.99 | |
| `ecommerce` | Ecommerce Store | +£9.99 | Products, cart, checkout |
| `vat-mtd` | VAT & Tax Automation | +£4.99 | HMRC MTD + Xero sync |
| `ai-content` | AI Site Generation & Content Assistant | +£3.99 | |
| `custom-template` | Custom Template Design | +£14.99/mo | Alt: one-time £149 (UI toggle) |
| `analytics-seo` | Advanced Analytics & SEO Tools | +£3.99 | |
| `sms` | SMS Notifications | +£2.99 | |
| `white-label` | White-label / Remove branding | +£9.99 | |
| `priority-support` | Priority Support | +£4.99 | |

### Pre-defined packages

| Package | Monthly | Pre-selected features |
|---------|---------|----------------------|
| **Starter** | £9.99 | Base only (any template except Custom adds +£14.99) |
| **Growth** | £24.99 | Base + CRM + Email Automation + Analytics & SEO |
| **Pro** | £39.99 | Growth + Ecommerce + VAT Automation |

**Decision (Q54 — Marcus Klein):** Pro package = Growth (£24.96) + Ecommerce (£9.99) + VAT (£4.99) = **£39.94** live total; card displays **£39.99/mo**. Same disclosure as Q1: footnote on package cards — *“Exact total shown in summary.”*
| **Custom** | Calculated | User builds own |

**Decision (Q1 — Marcus Klein + Samuel Ruiz):** Growth package composition adjusted to hit **£24.99** on the card. Feature set = Base (£9.99) + CRM (£4.99) + Email Automation (£5.99) + Analytics & SEO (£3.99) = **£24.96**; package card displays **£24.99/mo**. Live configurator total shows the precise sum (£24.96). When users modify selections, live total is authoritative.


### Annual pricing

- **Discount:** 17% off monthly equivalent (within 15–20% target)
- Formula: `annualMonthlyEquivalent = monthlyTotal * 0.83` (display as “£X/mo billed annually”)
- Annual total: `monthlyTotal * 12 * 0.83`
- Toggle in pricing summary: Monthly | Annual (save 17%)

**Decision (Q6 — Theo Laurent):** When annual billing is selected, show savings prominently:
- Primary: “£X.XX/mo billed annually”
- Secondary badge: **“Save £XX.XX per year”** (monthly total × 12 × 0.17)
- Optional tertiary: “That’s £X.XX/year total” for transparency

### Custom template billing mode

**Decision (Q2 — Priya Desai + Marcus Klein):** Default billing = **recurring +£14.99/mo** (aligns with SaaS LTV and “all add-ons are monthly” rule). One-time **£149** available via explicit toggle on the Custom Template card (“Pay once instead”). Toggle copy: “Prefer a one-time fee? Switch to £149.”

- Default: +£14.99/mo recurring
- Optional toggle: One-time £149 (removes recurring custom-template line from monthly total)

**Decision (Q13 — Marcus Klein):** Configurator **live pricing summary shows monthly recurring only**. When one-time £149 is selected, show a note on the Custom Template card: “One-time £149 — shown at checkout.” The **£149 line item appears only on `/get-started`** checkout summary (separate from monthly total). Annual toggle does not affect the one-time fee.

---

## 4. Templates

**Dr. Sophia Laurent (UX)** + **Ms. Lila Moreau (Copy)**

10 templates across 7 categories:

| # | Name | Category | Description |
|---|------|----------|-------------|
| 1 | Sparkle Clean | Cleaning & Trades | Professional cleaning services site with quote form |
| 2 | TradePro | Cleaning & Trades | Electrician/plumber portfolio + emergency CTA |
| 3 | Serenity Spa | Beauty & Wellness | Calm aesthetic for salons and spas |
| 4 | Glow Studio | Beauty & Wellness | Bold beauty brand with booking CTA |
| 5 | Apex Legal | Professional Services | Trust-focused layout for solicitors/consultants |
| 6 | Corner Shop | Retail | Product showcase and store-ready layout |
| 7 | The Local | Hospitality | Restaurant/pub with menu and reservations |
| 8 | LearnHub | Education | Courses, schedules, enrollment forms |
| 9 | Business Core | General Business | Flexible multi-section corporate site |
| 10 | Startup Launch | General Business | Modern single-page startup landing |

**Custom Template** — special card with “Bespoke design” badge; selecting enables `custom-template` add-on.

Preview images: placeholder gradients + category icons for MVP; replace with WebP screenshots later.

---

## 5. Feature Groups (Configurator Step 2)

| Group | Features | UI treatment |
|-------|----------|--------------|
| **Core (included)** | Base plan items | Disabled toggles, checked, £0.00 |
| **Growth** | CRM, Email Automation, Analytics & SEO | Toggle cards |
| **Optional add-ons** | SMS Notifications | Toggle cards |
| **Ecommerce** | Ecommerce Store, VAT & Tax Automation | Toggle cards |
| **Automation** | Booking & Appointments, Email Automation (if not in Growth) | Toggle cards |
| **Advanced** | AI Content, Custom Template, White-label, Priority Support | Toggle cards |
| **Coming soon** | Site Import / Migration | Non-selectable card (see Q4) |

Duplicate Email Automation appears once (Automation group cross-links to Growth).

**Decision (Q4 — Sophia Laurent):** Show **Site Import / Migration** in MVP as a **“Coming soon”** card in the Advanced group — not toggleable, not added to live total. Copy: “Import your existing site — launching soon.” Estimated price: **+£6.99/mo** with “Estimated · launching soon” label (see Q15).

**Decision (Q9 — Samuel Ruiz + Sophia Laurent):** Waitlist = **inline expandable email field** on the card (click “Join waitlist” → field expands in place; no modal, no Typeform). On submit: write to Firestore collection `waitlist_site_import`:

```typescript
{
  email: string;
  createdAt: Timestamp;
  source: 'configurator';
  configSnapshot: { templateId, featureIds[], billingCycle, monthlyTotalPence, annualTotalPence? };
}
```

Optional Cloud Function emails `hello@codedpixels.co.uk`. Success inline: “You’re on the list!” GDPR: link to Privacy Policy below field.

**Decision (Q17 — Samuel Ruiz):** **Yes — always capture config snapshot** on waitlist submit. Data already in client state; zero extra UX friction; high value for personalised outreach when Site Import launches.

**Decision (Q15 — Marcus Klein):** Show **estimated +£6.99/mo** on the card (not selectable, not in live total). Sets expectations without committing to final pricing.

---

## 6. Live Preview Panel

**Dr. Kira Nakamura (JS Behaviour)** + **Dr. Sophia Laurent (UX)**

**Decision (Q66 — Sophia Laurent, Samuel Ruiz):** Inline preview stays **mock wireframe**. Full design via **Preview full site** link (new tab) to demo tenant (`{templateId}.codedpixels.co.uk`) — Q65, [`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md). No inline iframe in Phase 2.1.

MVP inline preview (no iframe):
- Mock browser chrome with selected template name + category colour theme
- Dynamic badges for enabled features (e.g. “Shop enabled”, “Booking”, “CRM”)
- Template switch animates theme (CSS variables per template)
- Optional: simple wireframe sections (hero, features, contact) that morph by template
- **Preview full site →** external link when a library template is selected (Q66)

Desktop: preview left or centre; pricing sticky right.  
Mobile: collapsible “Preview” tab above sticky pricing bar.

---

## 7. Technical Architecture

**Dr. Kai Nakamura (CTO)** + **Dr. Lena Petrova (Next.js App Router)** + **Dr. Michael Chen (Platform Architect)**

### Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4.x |
| State | React `useState` + URL search params (shareable/bookmarkable config) |
| Animations | CSS transitions + optional `framer-motion` (lazy, only on configurator) |
| Icons | Lucide React |
| Fonts | Inter (body) + optional display font for headlines |

### Project structure

```
codedpixels/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Landing + configurator
│   ├── templates/page.tsx
│   ├── pricing/page.tsx
│   ├── get-started/page.tsx
│   └── globals.css
├── components/
│   ├── layout/                  # Header, Footer
│   ├── hero/
│   ├── configurator/            # Steps, feature cards, preview
│   ├── packages/
│   ├── sections/                # HowItWorks, Testimonials, FAQ
│   └── ui/                      # Button, Toggle, Badge, Card
├── lib/
│   ├── pricing.ts               # Pure pricing functions
│   ├── templates.ts             # Template data
│   ├── features.ts              # Feature definitions
│   ├── packages.ts              # Package presets
│   └── config-state.ts          # URL encode/decode, defaults
├── types/
│   └── index.ts
└── public/
    └── templates/               # Preview images (WebP)
```

### State persistence (URL params)

**Alex Chen (Data Fetching)** recommends encoding config in URL for refresh/share:

```
/?template=sparkle-clean&features=crm,email-automation&billing=monthly&customTemplate=recurring
```

- `useSearchParams` + `useRouter` with `replace` (no history spam on every toggle)
- Debounce URL updates 300ms
- `get-started` reads same params for checkout summary

**Decision (Q8 — Samuel Ruiz):** Do **not** require email to save configuration in MVP. Instead:
- URL persistence (refresh-safe) + **“Copy configuration link”** button in pricing summary
- Email capture only at Get Started (conversion gate) or Site Import waitlist
- Phase 2: “Email me this quote” for abandoned-configurator recovery

**Decision (Q11 — Theo Laurent):** **Copy full current URL** (includes all query params). Show toast: “Configuration link copied!” Short/pretty links deferred to Phase 2 (requires backend).

**URL schema:** `customTemplate=recurring|one-time` included in encoded params (Q58 amendment).

### Pricing engine

**Dr. Marcus Klein** — Pure functions, unit-tested:

```typescript
calculateMonthlyTotal(config: ConfigState): number
calculateAnnualTotal(config: ConfigState): number
getLineItems(config: ConfigState): LineItem[]
applyPackage(packageId: PackageId): ConfigState
```

No floating-point drift: store prices in pence (integers), display formatted GBP.

### Performance

**Dr. Elena Voss** + **Dr. Isaac Berg:**
- Server Components for static sections (FAQ, footer, testimonials)
- Client Components only for configurator island
- Dynamic import preview panel
- `next/image` for template thumbnails
- Target: configurator JS chunk < 80kb gzip

### SEO

**Dr. Rajiv Singh:**
- Metadata API per route
- JSON-LD `SoftwareApplication` + `Offer` on pricing page
- Semantic headings (single h1 per page)
- `/sitemap.xml`, `/robots.txt`

### Accessibility

**Dr. Nadia Sokolov:**
- Feature toggles: proper `role="switch"`, `aria-checked`, visible focus rings
- Price updates: `aria-live="polite"` region for total changes
- Step indicator: `aria-current="step"`
- Colour contrast ≥ 4.5:1; don’t rely on colour alone for selected state
- Keyboard: Tab through templates and toggles; Enter/Space to select

### Security & compliance

**Dr. Patrick O'Brien (GDPR)** + **Ms. Rebecca Flynn (Consumer)** + **Dr. Victor Lang (Security)**:
- Cookie banner with Accept/Reject non-essential (consent before analytics — Q14, Q61)
- Privacy Policy + Terms links in footer (**real pages required** — Q16, Q55)
- Clear pricing before checkout (Consumer Rights Act — no hidden fees)
- Simulated checkout: no real PCI on MVP; Stripe integration phase 2 (**Dr. Owen Reilly**)
- Footer trust signals: “UK-based · Secure payments · GDPR compliant · Cancel anytime”

**Decision (Q16 — Rebecca Flynn + Patrick O'Brien):** **Real, short legal pages** at `/privacy` and `/terms` — not “Coming soon” placeholders. Required before collecting email (waitlist, Get Started). Privacy: data collected, purpose, retention, cookies, UK GDPR rights, contact DPO/email. Terms: service description, pricing subject to confirmation, cancellation, limitation of liability. Mia Thompson to plain-language review.

---

## 8. Page Specifications

### Landing (`/`)

Sections in order:
1. Header (logo, nav, “Get Started”)
2. Hero
3. Recommended packages (4 cards)
4. Interactive configurator (`#configurator`)
5. How it works (4 steps)
6. Testimonials (6, varied industries)
7. FAQ (8–10 questions)
8. Footer

### Template gallery (`/templates`)

- Category filter chips
- Same 10 templates + Custom card
- “Use this template” → navigates to `/?template={id}` and scrolls to configurator

### Pricing (`/pricing`)

- Package cards (reuse component)
- Full comparison table: rows = features, columns = Starter / Growth / Pro / Custom
- Annual toggle applies to table footnotes

**Decision (Q21 — Sophia Laurent):** Comparison table is **static for MVP**. Checkmarks only; no bidirectional link to configurator. Each package column footer: **“Configure this plan →”** deep-links to `/?package={id}#configurator`. Interactive highlight/sync deferred to Phase 2.

### Get Started (`/get-started`)

**Decision (Q3 — Samuel Ruiz):** MVP does **not** create a draft site or open a builder. Flow = **capture lead + persist configuration**.

1. User submits **email only** (no password in MVP — Q57)
2. System stores: email, full config (template, features, billing cycle, totals), timestamp
3. Success screen: compact plan summary + confirmation (see Q12, Q58)
4. MVP persistence: Firestore `signups` via Callable Cloud Function (preferred — Victor Lang); collection `{ email, config, totals, timestamp, consentAt }`
5. Prominent banner: *“No payment taken — this is a sign-up preview”* (Q58)
6. No builder dashboard, no draft site preview — scope stays marketing + configurator only

**Decision (Q12 — Samuel Ruiz):** Success screen = **confirmation + compact summary**. Show: selected template name, count of add-ons (or top 3 names + “+N more”), billing cycle, **monthly recurring total**, one-time fees if any. Primary message: “You’re in! We’ve saved your plan.” Secondary: **“We’ll be in touch soon”** (Q58 — no email delivery promise in MVP).

**Decision (Q18 — Theo Laurent):** **Copy configuration link** on success screen **and** in configurator pricing summary.

**Decision (Q19 — Samuel Ruiz):** Primary CTA **“Start building my site now”** → “almost ready” modal. Secondary: “Copy configuration link”, “Back to home”.

- Reads config from URL
- Order summary (line items + total; one-time £149 line when applicable — visible in summary per Q58)
- Email-only form (MVP); “Continue with Google” stub deferred to Platform Phase 2
- Success state: confirmation + compact plan summary (Q12)

---

## 9. Design System

**Dr. Marcus Chen (Brand)** + **Mr. Theo Laurent (Conversion Design)**

| Token | Value |
|-------|-------|
| Primary | Deep indigo `#4F46E5` (trust, tech) |
| Accent | Electric cyan `#06B6D4` (CTAs, live price) |
| Background | Off-white `#FAFAFA`, dark sections `#0F172A` |
| Success | `#10B981` (savings badge) |
| Typography | Inter; headlines 700, body 400 |
| Radius | `rounded-xl` cards, `rounded-full` pills |
| Shadows | Subtle `shadow-sm` default, `shadow-lg` on hover |

**Conversion patterns:**
- Live total in accent colour, animates on change (scale pulse 150ms)
- Selected template: ring-2 ring-primary
- Package “Most Popular” badge on Growth
- Sticky CTA on mobile pricing bar

---

## 10. Copy & Messaging

**Ms. Lila Moreau** + **Mia Thompson (Friendly Explainer)**

Key FAQ topics:
- Can I change my plan later?
- What’s included in the base price?
- Do I need technical skills?
- How does custom template pricing work?
- Is there a contract?
- UK VAT / MTD integration details
- Refund / cancellation policy

Testimonials: fictional but industry-specific — section labelled **“Example customer stories”** (Q58).

**Pricing display:** All prices **VAT-inclusive** for UK B2C (Q58). FAQ must state inc. VAT.

---

## 11. Implementation Phases

**Dr. Nathan Cole (Coordinator)** + **Dr. Maya Patel (Task Decomposition)**

### Marketing build phases (M0–M4)

*Note: “Platform Phase 2” elsewhere refers to the builder app — not these marketing milestones (Q59).*

### M0 — Scaffold (Day 1)
- [ ] Init Next.js 15 + TypeScript + Tailwind
- [ ] Design tokens in `globals.css`
- [ ] Layout: Header + Footer
- [ ] Pricing engine + unit tests

### M1 — Configurator Core (Days 2–3)
- [ ] Template data + Step 1 grid
- [ ] Feature data + Step 2 toggles
- [ ] Pricing sidebar / mobile sticky bar
- [ ] URL state sync
- [ ] Package preset buttons

### M2 — Preview & Polish (Day 4)
- [ ] Live preview panel
- [ ] Annual/monthly toggle
- [ ] Animations + aria-live
- [ ] Mobile responsive pass

### M3 — Supporting Pages + Firestore endpoints (Day 5)
- [ ] Template gallery
- [ ] Pricing comparison table
- [ ] Get Started flow
- [ ] FAQ, testimonials, how-it-works
- [ ] Firestore Callable Functions for `signups` + `waitlist_site_import` (Q56)
- [ ] Sentry on marketing site before PII endpoints ship (Q61)

### M4 — Quality Gate (Day 6)
- [ ] Lighthouse audit (**Dr. Olivia Hart**)
- [ ] Playwright smoke tests (**Dr. Sophia Moreau**)
- [ ] a11y audit (**Dr. Nadia Sokolov**)
- [ ] SEO metadata (**Dr. Rajiv Singh**)
- [ ] GA4 events verified (**Dr. Amina Laurent**)
- [ ] Cookie consent blocks GA4 pre-opt-in (Patrick O'Brien)
- [ ] Sentry PII scrubbing verified (**Dr. Mira Solano**)

### Analytics (MVP)

**Decision (Q14 — Amina Laurent):** Track configurator events in MVP via **Google Analytics 4** (Next.js `@next/third-parties/google`). PostHog deferred to Phase 2 (builder app).

**Decision (Q20 — Amina Laurent):** Enrich all events with structured parameters (GA4 custom params):

| Event | Required parameters |
|-------|---------------------|
| `template_selected` | `template_id`, `template_category` |
| `feature_toggled` | `feature_id`, `enabled` (boolean), `monthly_price_pence` |
| `package_clicked` | `package_id` (starter \| growth \| pro \| custom), `preset_feature_ids` |
| `billing_cycle_changed` | `billing_cycle` (monthly \| annual), `monthly_total_pence` |
| `copy_config_link` | `source` (configurator \| success_screen) |
| `waitlist_joined` | `has_config_snapshot` (always true) |
| `get_started_clicked` | `source`, `monthly_total_pence`, `feature_count` |
| `signup_completed` | `package_id` if applied, `template_id`, `feature_ids`, `billing_cycle`, `monthly_total_pence` |

Cookie consent banner required before GA4 loads (GDPR).

---

## 12. Testing Strategy

**Dr. Aisha Khan (QA)** + **Dr. Liam Harper (Jest)**

### Unit tests (`lib/pricing.test.ts`)
- Base price only = £9.99
- Each add-on increments correctly
- Package presets match expected feature sets
- Annual discount = 17%
- Custom template one-time vs recurring
- Pence arithmetic edge cases

### E2E (Playwright)
- Select template → toggle feature → total updates
- Click Growth package → features pre-selected
- URL persistence on refresh
- Get Started carries config
- Mobile sticky bar expands

---

## 13. Out of Scope (MVP)

- Real Stripe checkout (**Dr. Owen Reilly** — Phase 2)
- Firebase auth (**Dr. Fatima Al-Sayed** — Phase 2)
- Actual website builder app
- Admin dashboard
- Real template screenshots (use placeholders)
- A/B testing infrastructure (**Dr. Amina Laurent** — post-launch)

---

## 14. Risks & Mitigations

| Risk | Owner | Mitigation |
|------|-------|------------|
| Package price ≠ sum of features | Marcus Klein | Live total is source of truth; adjust package composition |
| Configurator heavy on mobile | Elena Voss | Sticky bar + step accordion; perf budget |
| Legal copy incomplete | Rebecca Flynn | Real `/privacy` + `/terms` required (Q16, Q55); Mia Thompson review before launch |
| Scope creep | Nathan Cole | MVP gates in Phase 0–4; no builder app |

---

## 15. Expert Contributions by Domain

| Domain | Experts | Key input |
|--------|---------|-----------|
| Coordination | Nathan Cole, Maya Patel | Phased delivery, clear gates |
| Documentation | Lena Moreau | This document |
| Product | Samuel Ruiz, Sophia Laurent | User journey, configurator-first |
| Conversion | Theo Laurent, Lila Moreau | CTAs, copy, pricing clarity |
| Brand | Marcus Chen | Visual identity tokens |
| Pricing | Marcus Klein, Priya Desai | Logic, packages, annual discount |
| Next.js | Lena Petrova, Elena Voss | App Router, RSC split, perf |
| State | Alex Chen, Kira Nakamura | URL persistence, instant updates |
| Payments | Owen Reilly | Simulated checkout now; Stripe later |
| SEO | Rajiv Singh | Metadata, structured data |
| a11y | Nadia Sokolov | Toggles, live regions, keyboard |
| Security/GDPR | Victor Lang, Patrick O'Brien | Real legal pages; Function-first Firestore writes; consent UI |
| QA | Aisha Khan, Sophia Moreau, Liam Harper | Unit + E2E strategy |
| DevOps | Daniel Moreau, Marcus Rivera | Firebase App Hosting (see Q5) |
| Explainability | Mia Thompson | Plain-language FAQ |

---

## 16. Decision Log (Resolved 12 June 2026)

| # | Question | Decision | Owners |
|---|----------|----------|--------|
| 1 | Growth package pricing | **Adjust composition** to Base + CRM + Email + Analytics = **£24.99/mo** on card; live total shows £24.96 until user changes selections | Marcus Klein, Samuel Ruiz |
| 2 | Custom Template default billing | **Recurring £14.99/mo** default; one-time £149 via explicit toggle | Priya Desai, Marcus Klein |
| 3 | Post–Get Started MVP behaviour | **Lead + config capture only** — no draft site, no builder. Success = confirmation + saved plan | Samuel Ruiz |
| 4 | Site Import / Migration in MVP | **“Coming soon” card** + optional waitlist — visible but not selectable | Sophia Laurent |
| 5 | Hosting platform | **Firebase App Hosting** for marketing site; unified path to builder (Auth, Firestore, Functions later). Local dev via `next dev`; deploy via Firebase CLI | Kai Nakamura, Marcus Rivera |
| 6 | Annual savings display | **Yes** — show “Save £XX per year” badge when annual toggle active | Theo Laurent |
| 7 | Brand / domain | **CodedPixels** · **codedpixels.co.uk** · wordmark placeholder for MVP | Elena Voss, Marcus Chen |
| 8 | Save config via email (no account) | **No in MVP** — URL + “Copy configuration link” instead; email at Get Started only | Samuel Ruiz |
| 9 | Site Import waitlist UX + storage | **Inline expandable email** on card → **Firestore** `waitlist_site_import`; optional admin email via Cloud Function | Samuel Ruiz, Sophia Laurent |
| 10 | Package click behaviour | **Pre-select only** — user can toggle features off; live total always authoritative | Sophia Laurent |
| 11 | Copy configuration link | **Full current URL** + “Link copied!” toast; short links Phase 2 | Theo Laurent |
| 12 | Get Started success screen | **Confirmation + compact summary** (template, add-ons, total, billing cycle) | Samuel Ruiz |
| 13 | Custom Template one-time £149 in summary | **Checkout only** (`/get-started`); configurator shows monthly recurring + card note | Marcus Klein |
| 14 | Configurator analytics | **Yes — GA4** in MVP; event list in §11 Analytics; cookie consent first | Amina Laurent |
| 15 | Site Import estimated price | **Show +£6.99/mo estimated** — not selectable, not in live total | Marcus Klein |
| 16 | Privacy / Terms pages | **Real short pages** at `/privacy` and `/terms` before any email capture | Rebecca Flynn, Patrick O'Brien |
| 17 | Waitlist config snapshot | **Yes — always capture** template + features + billing + totals on waitlist submit | Samuel Ruiz |
| 18 | Copy link on success screen | **Yes** — same button on success screen and configurator summary | Theo Laurent |
| 19 | “Start building now” on success | **Yes** — opens “almost ready” modal; sets builder expectation without fake access | Samuel Ruiz |
| 20 | GA4 event granularity | **Yes** — package_id, feature_id, enabled, template_id, totals on all relevant events | Amina Laurent |
| 21 | Interactive pricing table | **Static MVP** — checkmarks + “Configure this plan →” deep links only | Sophia Laurent |
| 22 | “Backend spool up per company” | **Logical provisioning only** — NOT separate Firebase project or container per company. Cloud Function writes tenant docs + custom claims | Kai Nakamura, Michael Chen |
| 23 | Company isolation level | **Data isolation** via Firestore paths + security rules + custom claims. No per-tenant compute isolation in Phase 2 | Victor Lang, Rafael Ortiz |
| 24 | Client site hosting | **Shared GCP project**; **separate Hosting site / subdomain per client** (`{slug}.codedpixels.co.uk` or custom domain) | Marcus Rivera, Michael Chen |
| 25 | Core platform database | **Firestore for Phase 2 builder** (speed). **PostgreSQL (Neon/Supabase) Phase 3+** for usage billing & heavy relational reporting | Kai Nakamura, Priya Desai |
| 26 | Firestore multi-tenancy | **`companies/{companyId}/...` subcollections** + Auth custom claims `{ companyId, role }` + strict security rules | Rafael Ortiz, Victor Lang |
| 27 | Client website content storage | **Same Firestore project**, tenant-scoped paths — NOT separate DB per company | Michael Chen, Priya Desai |
| 28 | Speed vs clean architecture | **Speed to market now** (Firebase multi-tenant). Document Postgres migration triggers at scale | Elena Voss, Kai Nakamura |
| 29 | Marketing + builder Firebase project | **Same Firebase project** — `codedpixels.co.uk` (marketing) + `app.codedpixels.co.uk` (builder) | Kai Nakamura, Marcus Rivera |
| 30 | White-label agencies early | **No** — design for future (`partnerId` nullable). Platform white-label/reseller = Phase 3+ | Samuel Ruiz, Elena Voss |
| 31 | Phase 2 signup provisioning | Auth user + **company record + default site doc** + custom claims via Cloud Function. No infra spin-up | Samuel Ruiz, Kai Nakamura |
| 32 | Usage-based billing later | **Yes — model from Phase 2** (`usage` counters: forms, storage, bandwidth). Package pricing MVP; overages Phase 3 | Priya Desai, Marcus Klein |
| 33 | UK/EU data residency | **Important** — Firestore/Functions in **`europe-west2` (London)**; disclose global Auth in Privacy Policy. Strict UK-only = future review | Patrick O'Brien, Julian Hart |

### Q5 rationale (Kai Nakamura + Marcus Rivera)

- Builder roadmap aligns with Firebase (Auth, Firestore, Cloud Functions)
- Firebase App Hosting supports Next.js 15 App Router with SSR
- Single deployment pipeline avoids split Vercel + Firebase later
- Preview channels for PR review; UK GCP regions available
- MVP deploy: Firebase App Hosting
- **Firestore in MVP** for `signups` + `waitlist_site_import` (Callable Functions preferred); tenant `companies/*` model starts Platform Phase 2 (Q56)

---

## 18. Platform Architecture (Phase 2+)

**Dr. Michael Chen (Platform Architect)** + **Dr. Kai Nakamura (CTO)** + **Dr. Rafael Ortiz (Security & DB)**

This section resolves Q22–Q33. “A new backend will spool up per company” means **soft provisioning** — not new infrastructure per signup.

### What “spool up” means (Q22)

| Approach | Verdict |
|----------|---------|
| Separate Firebase project per company | ❌ Rejected — ops nightmare, cost, slow onboarding |
| Separate Cloud Run container per company | ❌ Rejected — expensive, unnecessary for SMB SaaS |
| Single project + tenant records + default site | ✅ **Recommended** |

**On signup, a Cloud Function `provisionTenant`:**

1. Creates Firebase Auth user (if not exists)
2. Writes `companies/{companyId}` with plan config from configurator
3. Writes `companies/{companyId}/sites/{siteId}` with template + feature flags
4. Sets custom claims `{ companyId, role: 'owner' }`
5. Optionally creates Firebase Hosting site target / subdomain mapping
6. Sends welcome email

No new GCP project. No new container. Provisioning completes in **< 2 seconds**.

### Isolation model (Q23)

| Layer | Phase 2 | Phase 3+ (enterprise) |
|-------|---------|------------------------|
| Data | ✅ Firestore rules + `companyId` in every path | Same + optional export isolation |
| Compute | Shared Cloud Functions | Shared; dedicated only for enterprise tier |
| Infrastructure | Single Firebase/GCP project | Optional dedicated project for large agencies |

### Client sites & hosting (Q24)

- **One GCP project**, multiple **Firebase Hosting sites** (or App Hosting backends)
- Default URL: `{companySlug}.codedpixels.co.uk`
- Custom domain: mapped per site via Hosting API
- Published site reads/writes tenant data under `companies/{companyId}/sites/{siteId}/`
- Static pages may be SSR/ISR from shared builder app with tenant context

### Data model (Q25–Q27)

**Phase 2 database: Firestore** (not Postgres yet). **Canonical schema:** [`firestore-schema.md`](firestore-schema.md)

```
companies/{companyId}
  ├── members/{uid}, invites/{inviteId}, usage/{YYYY-MM}
  └── sites/{siteId}
        ├── pages/{pageId}/versions/{versionId}
        ├── assets/{assetId}, leads/{leadId}, products/{productId}, domains/{domainId}
```

- Platform and client content: **same Firestore**, isolated by path + rules — full field definitions in [`firestore-schema.md`](firestore-schema.md)
- End-customer PII (form leads): never at root level; always under company/site path
- **Postgres migration trigger (Q28):** consider at 5k+ tenants, complex usage billing, or BI/reporting needs

### Firebase project layout (Q29)

| Surface | Domain | App |
|---------|--------|-----|
| Marketing + configurator | `codedpixels.co.uk` | Next.js (App Hosting) |
| Builder dashboard | `app.codedpixels.co.uk` | Next.js (App Hosting, separate backend) |
| Client sites | `{slug}.codedpixels.co.uk` | Shared site renderer + tenant routing |

Single Firebase project: Auth, Firestore, Functions, Hosting, Storage.

### White-label (Q30)

- Configurator **White-label add-on** = remove CodedPixels branding on **client sites**
- **Agency/reseller platform white-label** (own branded dashboard) = Phase 3+
- Schema: optional `partnerId` on `companies` document (reserved for Phase 3)

### Phase 2 onboarding flow (Q31)

```
Configurator → Get Started → Stripe (Phase 2) → provisionTenant()
  → Redirect to app.codedpixels.co.uk/onboarding
  → “Your site is ready to edit” (builder UI — phased rollout)
```

Minimum viable provisioning: **user + company + default site document** (empty template scaffold).

### Usage-based billing prep (Q32)

From Phase 2, track on `companies/{companyId}/usage/{YYYY-MM}`:

- `formSubmissions`, `storageBytes`, `bandwidthBytes`, `sitesCount`
- Increment via Cloud Functions on events
- MVP billing remains **flat packages**; usage overages = Phase 3 (**Dr. Owen Reilly** + Stripe Metered Billing)

### Data residency (Q33)

- Firestore, Cloud Functions, Cloud Storage: **`europe-west2` (London)**
- Firebase Auth: global service — document in Privacy Policy
- Analytics: GA4 with consent; IP anonymisation enabled
- If customer requires strict UK-only processing: enterprise review; not MVP blocker

### Builder content model (Q34)

**Dr. Rafael Ortiz + Dr. Lena Petrova + Dr. Michael Chen**

**Block-based section model** with typed components and JSON props (not free-form HTML):

```
companies/{companyId}/sites/{siteId}/
  pages/{pageId}                    # metadata only
  pages/{pageId}/versions/{versionId}   # draft + published snapshots
  componentRegistry/                # optional overrides (Phase 3)
```

**Page document:**
```typescript
{ slug, title, seo: { title, description }, sortOrder, publishedVersionId, draftVersionId }
```

**Version document:**
```typescript
{
  status: 'draft' | 'published' | 'archived';
  sections: Section[];
  createdAt; createdBy; publishedAt?;
}
```

**Section:**
```typescript
{
  id: string;
  type: ComponentType;  // 'hero' | 'features' | 'contact-form' | 'product-grid' | ...
  props: Record<string, unknown>;  // validated against registry schema
  children?: Section[];   // nested sections where allowed; max depth 2
}
```

- **Component registry** lives in builder codebase (`lib/builder/registry.ts`) with Zod/JSON Schema per type
- Template onboarding **seeds** a `draft` version by cloning template section trees
- Renderer (`site-renderer`) maps `type + props` → React components (shared package)

Full detail: [`builder-ui-spec.md`](builder-ui-spec.md)

### Publishing flow (Q35)

**Dr. Marcus Rivera + Dr. Samuel Ruiz**

| Environment | URL | Data source |
|-------------|-----|-------------|
| **Draft / Preview** | `app.codedpixels.co.uk/sites/{siteId}/preview` (auth required) | `draftVersionId` |
| **Published / Live** | `{slug}.codedpixels.co.uk` or custom domain | `publishedVersionId` |

**Publish action (Phase 2 MVP):**
1. User clicks “Publish” in builder
2. Cloud Function `publishSite`: validate draft → copy version doc → set `publishedVersionId` → mark version `published`
3. Trigger site renderer revalidation (ISR/on-demand) — **instant**, no manual Hosting deploy per edit
4. Optional: Hosting API update only when custom domain or first publish

**Rollback (Phase 2.1 — noted, not MVP blocker):** Keep last **5 published versions**; “Restore version” swaps `publishedVersionId`. See builder spec §Publishing.

### Onboarding wizard (Q36)

**Dr. Sophia Laurent + Dr. Samuel Ruiz**

Post-`provisionTenant()`, redirect to **`app.codedpixels.co.uk/onboarding`** — 4-step wizard:

| Step | Title | Action |
|------|-------|--------|
| 1 | Your plan | Confirm configurator selections + monthly total |
| 2 | Name your business | Business name → generates `{slug}.codedpixels.co.uk` (editable if available) |
| 3 | Domain | Assign `{slug}.codedpixels.co.uk` — **“Connect custom domain” deferred to Platform Phase 2.1** (Q60) |
| 4 | Edit homepage | Drop into builder with template draft pre-loaded |

- Progress stored in `companies/{companyId}.onboardingStep`
- Steps 3–4 skippable; resume from dashboard
- Activation metric: reach Step 4 or first publish within 7 days

### Custom domain flow (Q37)

**Dr. Marcus Rivera + Dr. Victor Lang**

Phase 2 dashboard flow (not marketing site):

1. User enters domain (e.g. `www.acme-clean.co.uk`)
2. UI shows required DNS records (CNAME → Firebase Hosting target)
3. Cloud Function `verifyCustomDomain` polls Firebase Hosting API
4. Status: `pending` → `verifying` → `active` | `failed`
5. SSL auto-provisioned by Firebase (Let's Encrypt)
6. Email notification on `active` (**Dr. Aria Bennett** — SendGrid)

Stored at `sites/{siteId}/domains/{domainId}`.

### Stripe integration timing (Q38)

**Dr. Owen Reilly + Dr. Samuel Ruiz + Mr. Theo Laurent**

**Stripe Checkout at Get Started** (replacing simulated checkout in Platform Phase 2):

```
Marketing /get-started
  → Stripe Extension: Create Checkout Session (subscription + optional one-time line)
  → User pays / starts trial
  → Extension webhook → custom Function: checkout.session.completed
  → provisionTenant() + map stripeCustomerId → companies/{companyId}
  → Redirect app.codedpixels.co.uk/onboarding
```

See §23 Firebase Extensions (Q63) for Extension vs custom split.

- **No charge at publish** — subscription starts at signup
- **Phase 2 launch:** 14-day free trial with card required (reduces churn risk); configurable via Stripe
- Failed payment webhook → no provisioning; retry link emailed
- One-time £149 custom template: Stripe `invoiceitem` or Checkout line item at signup

### RBAC (Q39)

**Dr. Fatima Al-Sayed + Dr. Rafael Ortiz**

| Role | Sites | Leads/CRM | Products | Members | Billing |
|------|-------|-----------|----------|---------|---------|
| **owner** | CRUD + publish | CRUD | CRUD | invite/remove | full |
| **admin** | CRUD + publish | CRUD | CRUD | invite/remove | view only |
| **editor** | edit + publish | CRUD | CRUD | — | — |
| **viewer** | read | read | read | — | — |

- Stored: `companies/{companyId}/members/{userId}` → `{ role, email, invitedAt, invitedBy }`
- Auth custom claims: `{ companyId, role }` — refreshed on invite accept
- Phase 2 launch: **owner only**; invite flow Phase 2.1

### Configurator error states (Q40)

**Dr. Sophia Laurent + Dr. Marcus Klein**

| Scenario | Behaviour |
|----------|-----------|
| Invalid/missing URL params | Reset to Starter defaults + toast: “We restored default settings” |
| Custom Template → standard template | Keep `custom-template` add-on enabled; show banner: “Custom design add-on still selected — remove in Features?” |
| One-time £149 selected then toggle off Custom Template | Clear one-time flag; restore recurring default |
| No template selected | Disable Get Started; inline error on Step 1 |
| Waitlist/signup network failure | Inline error + retry button; do not clear form |
| Firestore write failure | Same; log to console + optional Sentry Phase 2 |
| Package + manual toggle drift | Allowed (Q10); live total always wins — no error |

Design empty/error states in Phase 0 UI pass (icon + message + recovery action).

### Transactional email (Q41)

**Dr. Aria Bennett (SendGrid)** — owner of all Phase 2 transactional email.

| Email | Trigger |
|-------|---------|
| Welcome + verify | Auth signup / post-checkout |
| Plan confirmed | `provisionTenant` complete |
| Payment failed | Stripe `invoice.payment_failed` |
| Site published | `publishSite` success |
| Domain verified | `verifyCustomDomain` → active |
| Waitlist (Site Import) | Optional: “You’re on the list” |

- **SendGrid** (not Firebase Extensions) for templates, deliverability, analytics
- Cloud Functions in `europe-west2` call SendGrid API
- Auth password reset: Firebase Auth default email Phase 2; migrate to SendGrid templates Phase 2.1

### Data export / portability (Q42)

**Dr. Patrick O'Brien + Ms. Rebecca Flynn**

| Export | Phase |
|--------|-------|
| **Leads CSV** (CRM) | Phase 2 — owner/admin dashboard |
| Site content JSON | Phase 3 |
| Full account export (GDPR Art. 15) | Phase 3 — automated self-service |
| Products CSV | Phase 2.1 if ecommerce enabled |

Phase 2 mention in Privacy Policy: “You can export your leads at any time.”

### Support access (Q43)

**Dr. Fatima Al-Sayed + Dr. Victor Lang**

| Phase | Approach |
|-------|----------|
| **Phase 2** | No customer impersonation. Support uses **internal admin console** (read-only) via Admin SDK + **audit log** every access |
| **Phase 2.5** | Staff custom claim `supportAgent: true`; scoped read to `companies/{companyId}` with ticket ID required |
| **Phase 3** | Time-limited impersonation with customer consent + full audit trail |

Never share support credentials; all access logged to `auditLogs/{id}`.

### Image / asset handling (Q44)

**Dr. Nora Patel (Storage)** + **Dr. Clara Voss (ClamAV)** + **Dr. Isaac Berg (optimization)**

- **Upload:** Direct to **Firebase Storage** from builder via signed upload URL or Firebase SDK
- **Path:** `companies/{companyId}/sites/{siteId}/assets/{assetId}/{filename}`
- **Metadata doc:** `.../assets/{assetId}` → `{ url, thumbUrl, altText, width, height, sizeBytes, mimeType, createdAt }`
- **Limits:** Max **5 MB** per image; types: JPEG, PNG, WebP, GIF (no SVG upload in Phase 2 — XSS risk)
- **Optimisation:** Client-side resize to max **1920px** width before upload; **Resize Images Extension** generates **400px WebP thumbnail** (Q64)
- **Security:** **Custom Cloud Function** ClamAV scan on `onObjectFinalized` (before or gating Extension) — quarantine/delete if infected (Q64)
- **Alt text:** **Required** before insert into page; enforced in upload modal + validated in section schema
- **Renderer:** `next/image` with Storage CDN URLs; lazy loading default

### Rich text editor (Q45)

**Dr. Lena Petrova + Dr. Sophia Laurent**

- **Tiptap** (ProseMirror) for `text-block` and rich fields in hero/CTA where needed
- Store content as **Tiptap JSON** in section props (not HTML strings — safer rendering)
- Phase 2 extensions: bold, italic, links, headings H2–H3, bullet/numbered lists
- No tables, embeds, or custom HTML in Phase 2
- Lexical/Slate rejected for Phase 2 — higher integration cost; markdown rejected — too limiting for SMB users

### Billing portal (Q46)

**Dr. Owen Reilly + Dr. Samuel Ruiz**

| Capability | Phase |
|------------|-------|
| Update payment method | **Phase 2** — Stripe Customer Portal |
| View invoices & billing history | **Phase 2** — Stripe Customer Portal |
| Cancel subscription | **Phase 2** — Stripe Customer Portal |
| Change plan / add-remove features | **Phase 2.1** — CodedPixels dashboard (syncs to Stripe subscription items) |

Dashboard link: “Manage billing” → Stripe Customer Portal session (hosted). Low build cost, high trust.

### Team invitation flow (Q47)

**Dr. Fatima Al-Sayed + Dr. Aria Bennett**

Phase **2.1** (when RBAC invites ship):

1. Owner → Settings → Team → Enter email + select role (admin/editor/viewer)
2. Cloud Function creates `invites/{inviteId}` + sends SendGrid email
3. Invite link: magic link with token (7-day expiry) → `app.codedpixels.co.uk/invite/{token}`
4. Recipient signs in or creates account → added to `members/{userId}` → custom claims refreshed
5. Owner can revoke pending invites

Phase 2 launch: owner-only; no invite UI.

### Error monitoring (Q48)

**Dr. Mira Solano (Observability)**

- **Sentry** in Phase 2 for:
  - `app.codedpixels.co.uk` (Next.js via `@sentry/nextjs`)
  - Cloud Functions (Sentry GCP integration)
  - Site renderer (lighter sampling)
- Marketing site (`codedpixels.co.uk`): **Sentry required before waitlist/signup ship** (Q61); `@sentry/nextjs` + PII scrubbing
- Owner: **Dr. Mira Solano** — alert routing, release tracking, PII scrubbing in config
- Source maps uploaded in CI; no raw emails in error payloads

### Rate limiting / abuse protection (Q49)

**Dr. Victor Lang + Priya Sharma**

**Phase 2 — required** for public client site forms (contact, quote, booking):

| Layer | Mechanism |
|-------|-----------|
| Edge | **Firebase App Check** on form submit API |
| Bot | **reCAPTCHA v3** (score threshold 0.5) on public forms |
| Rate limit | Cloud Function: **10 submissions / hour / IP / form**; 429 response |
| Storage | Honeypot field on all public forms |

Booking + ecommerce checkout: same baseline. Advanced WAF = Phase 3.

### Leads / CRM inbox (Q50)

**Dr. Sophia Laurent + Dr. Samuel Ruiz**

Phase 2 **simple table inbox** at `app.codedpixels.co.uk/dashboard/leads` (Q62):

| Column | Notes |
|--------|-------|
| Name, Email, Phone | From form payload |
| Source page | Page slug + site |
| Date | Submitted at |
| Status | `new` → `read` → `archived` |

- Search: name/email full-text (client filter Phase 2; Algolia/Firestore extension Phase 2.1)
- Filters: status, date range, source page
- Row click → detail drawer with full submission JSON
- **Export CSV** (Q42)
- Kanban view = **Phase 2.1**

### Ecommerce product management (Q51)

**Dr. Samuel Ruiz + Dr. Owen Reilly**

Phase 2 **basic product editor** (not advanced PIM):

- Product list table: image thumb, name, price, status (draft/live)
- Edit form: name, description (Tiptap short), **price (GBP)**, up to **5 images**, optional SKU, published toggle
- **No variants, inventory, or shipping rules** in Phase 2 — Phase 2.1
- Checkout on client site: Stripe Checkout single-product or cart (Phase 2.1); Phase 2 = product display + “Buy” link to owner-defined URL OR simple Stripe Payment Link

### Mobile builder (Q52)

**Dr. Sophia Laurent + Dr. Amir Khan**

- Phase 2 builder on mobile/tablet: **read-only** — canvas preview + “Edit on desktop” banner
- Mobile dashboard: view leads, billing link, preview site — OK
- Text-only quick edits on mobile = **Phase 2.1** (optional)
- Rationale: SMB site building is desktop-first; mobile edit adds significant UX cost

### Rollback UI (Q53)

**Dr. Samuel Ruiz** — aligns with Q35

| Phase | User-facing rollback |
|-------|---------------------|
| **Phase 2** | Publish only; **no Version History UI** |
| **Phase 2.1** | Dashboard **“Version history”** — last 5 published versions, one-click restore |
| **Phase 2** support | Support can restore via admin console (audit logged) if urgent |

---

## 19. Known Gaps & Future Specs

Items intentionally light in this document — tracked for Phase 2 kickoff:

| Area | Status | Owner / Next artefact |
|------|--------|----------------------|
| Builder UI (canvas, drag-drop, sidebar) | Outline only | [`builder-ui-spec.md`](builder-ui-spec.md) — full spec at Phase 2 start |
| Component registry (visual + schema) | Defined in builder spec §3 | Lena Petrova + Julian Reyes |
| Preview vs published | Q35 resolved | Marcus Rivera |
| Rollback / version history | Phase 2.1 | Samuel Ruiz |
| Email deliverability & templates | Q41 resolved | Aria Bennett |
| Ecommerce checkout on client sites | Phase 2.1+ | Owen Reilly |
| AI content assistant integration | Phase 2.1+ | Firebase AI Logic |
| **Firestore schema** | ☑ Complete | [`firestore-schema.md`](firestore-schema.md) |
| Firestore security rules | M3 deploy | ☑ [`firestore-rules-spec.md`](firestore-rules-spec.md) — Rafael Ortiz |
| Image assets & ClamAV | Q44 resolved | Nora Patel, Clara Voss |
| Rich text (Tiptap) | Q45 resolved | Lena Petrova |
| Stripe Customer Portal | Q46 Phase 2 | Owen Reilly |
| Team invites | Q47 Phase 2.1 | Fatima Al-Sayed |
| Sentry monitoring | Q48 Phase 2 | Mira Solano |
| Form rate limiting | Q49 Phase 2 | Victor Lang |
| CRM inbox / product editor | Q50–Q51 resolved | Sophia Laurent |
| Mobile builder | Q52 read-only Phase 2 | Amir Khan |
| Version History UI | Q53 Phase 2.1 | Samuel Ruiz |

**This document (codedpixels-project-plan.md)** = marketing site + configurator + platform architecture.  
**builder-ui-spec.md** = visual builder product spec (Phase 2).

---

## 20. Decision Log (Q34–Q53)

| # | Question | Decision | Owners |
|---|----------|----------|--------|
| 34 | Builder Firestore content model | **Block-based sections** + versioned pages (`draft` / `published`) + typed component registry | Rafael Ortiz, Lena Petrova |
| 35 | Publishing mechanism | **Instant publish** via version swap + ISR revalidation; preview auth-gated; rollback Phase 2.1 | Marcus Rivera, Samuel Ruiz |
| 36 | Post-signup onboarding | **4-step wizard**: plan → business name/slug → domain choice → builder | Sophia Laurent, Samuel Ruiz |
| 37 | Custom domain flow | DNS instructions → Hosting API verify → auto SSL → status emails | Marcus Rivera |
| 38 | Stripe timing | **Checkout at Get Started** → webhook → `provisionTenant()`; 14-day trial optional | Owen Reilly, Samuel Ruiz |
| 39 | RBAC roles | **owner / admin / editor / viewer**; Phase 2 launch owner-only | Fatima Al-Sayed |
| 40 | Configurator error states | Defined scenario table (§18); implement in Phase 0 polish pass | Sophia Laurent |
| 41 | Transactional email | **SendGrid** via Cloud Functions; Aria Bennett owns templates | Aria Bennett |
| 42 | Data export | **Leads CSV Phase 2**; full portability Phase 3 | Patrick O'Brien |
| 43 | Support access | **Read-only admin console + audit log** Phase 2; no impersonation | Fatima Al-Sayed, Victor Lang |
| 44 | Image / asset handling | **Firebase Storage** + client resize + thumbnails + ClamAV; 5 MB limit; **alt text required** | Nora Patel, Clara Voss |
| 45 | Rich text editor | **Tiptap** — JSON storage; basic formatting Phase 2 | Lena Petrova, Sophia Laurent |
| 46 | Customer billing portal | **Stripe Customer Portal Phase 2** (card, invoices, cancel); plan changes Phase 2.1 | Owen Reilly |
| 47 | Team invitation flow | **Phase 2.1** — email invite, role selected by owner, magic link accept | Fatima Al-Sayed, Aria Bennett |
| 48 | Error monitoring | **Sentry** Phase 2 — builder + Functions; owner Mira Solano | Mira Solano |
| 49 | Form rate limiting | **Phase 2** — App Check + reCAPTCHA v3 + 10/hr/IP + honeypot | Victor Lang, Priya Sharma |
| 50 | Leads / CRM inbox | **Simple table** + search/filters + detail drawer + CSV export; Kanban Phase 2.1 | Sophia Laurent, Samuel Ruiz |
| 51 | Ecommerce product editor | **Basic form** — name, description, price, images, SKU, publish; no variants Phase 2 | Samuel Ruiz, Owen Reilly |
| 52 | Mobile builder | **Read-only Phase 2**; desktop required to edit | Sophia Laurent, Amir Khan |
| 53 | Rollback UI | **No Version History UI Phase 2**; user-facing restore Phase 2.1; support restore via admin | Samuel Ruiz |

---

## 21. Expert Review & Amendment Pass (Q54–Q62)

Full parallel panel review: [`expert-review-memo.md`](../planning/expert-review-memo.md)

| # | Amendment | Status |
|---|-----------|--------|
| Q54 | Pro package card vs live total (£39.99 vs £39.94) | ☑ Applied |
| Q55 | Remove all “stub legal pages” language | ☑ Applied |
| Q56 | Firestore required in MVP for signups + waitlist | ☑ Applied |
| Q57 | Email-only MVP signup (no password) | ☑ Applied |
| Q58 | Success copy + simulation banner + testimonial label + VAT-inclusive | ☑ Applied |
| Q59 | Marketing phases renamed M0–M4 | ☑ Applied |
| Q60 | Custom domain UI = Platform Phase 2.1 | ☑ Applied |
| Q61 | Sentry required before PII endpoints | ☑ Applied |
| Q62 | Leads route → `/dashboard/leads` | ☑ Applied |

---

## 22. Next Step

All **sixty-two** product decisions + **Q54–Q62 amendments** resolved. **M0–M4 (marketing site + configurator)** cleared for implementation. Platform Phase 2 builder starts from [`builder-ui-spec.md`](builder-ui-spec.md) when marketing MVP ships.

**Approved for implementation (M0–M4):** ☑ Expert panel consensus — post amendment pass ([review memo](../planning/expert-review-memo.md))

---

## 23. Firebase Extensions Strategy

**Dr. Kai Nakamura (CTO)** + **Dr. Owen Reilly (Stripe)** + **Dr. Nora Patel (Storage)** + **Dr. Clara Voss (ClamAV)** + **Dr. Patrick O'Brien (GDPR)**

Firebase Extensions are **not used in M0–M4** (marketing site stays lightweight). Platform Phase 2 adopts a **selective extension strategy**: use Extensions where they reduce boilerplate; avoid where the team already chose a superior custom path.

### By phase

| Phase | Extensions | Notes |
|-------|------------|-------|
| **M0–M4** (marketing) | **None** | Callable Functions + Sentry + App Check (SDK, not Extension) only |
| **Platform Phase 2** | Stripe, Resize Images, Delete User Data | See below |
| **Platform Phase 3+** | Consider Firestore → BigQuery Export | When reporting/analytics matures |

### Recommended (Platform Phase 2)

| Extension / capability | Verdict | Role |
|------------------------|---------|------|
| **Stripe** (`firestore-stripe-payments` or current official extension) | **Strongly recommended** | Checkout Sessions, Customer/Subscription docs, webhook verification |
| **Resize Images** | **Recommended** | Auto-generate thumbnails/WebP variants on Storage upload |
| **Delete User Data** | **Recommended** | GDPR account deletion — recursive purge under `companies/{companyId}` |
| **App Check** | **Required** (Firebase product, not classic Extension) | Public forms, site renderer, Callable Functions (Q49) |

### Avoid / defer

| Extension | Verdict | Reason |
|-----------|---------|--------|
| **Trigger Email** | **Avoid** | Q41 — SendGrid via Cloud Functions for templates, deliverability, ownership (Aria Bennett) |
| **Export Collections to BigQuery** | **Defer Phase 3+** | No serious reporting need yet; Amina Laurent |
| **Firestore BigQuery Export** | **Defer Phase 3+** | Same |

### Integration with multi-tenant architecture

**Stripe (Q63):**

```
Marketing /get-started (Platform Phase 2)
  → Stripe Extension creates Checkout Session
  → Extension writes customers/{uid} + checkout_sessions + subscriptions
  → Custom Cloud Function on checkout.session.completed:
        map stripeCustomerId → companies/{companyId}
        provisionTenant()
        sync featureIds[] ↔ Stripe subscription items
        handle one-time £149 (add_invoice_items or Extension line item)
```

- Extension owns: webhook signature verification, Customer/Subscription Firestore mirrors, PCI scope reduction
- **Custom Functions own:** `provisionTenant`, company mapping, feature-flag sync, onboarding redirect, dunning emails (SendGrid)
- Store `stripeCustomerId` and `stripeSubscriptionId` on `companies/{companyId}`

**Resize Images + ClamAV (Q64):**

```
Builder upload → Storage (companies/.../assets/...)
  → Custom Function: ClamAV scan (onObjectFinalized, first handler)
       → infected: delete + notify
       → clean: continue
  → Resize Images Extension: generate 400px WebP thumb + optional sizes
  → Custom Function (or client): write assets/{assetId} metadata doc
  → Builder UI: alt text required before insert (not Extension concern)
```

- **Resize Images Extension** owns thumbnail/variant generation (replaces custom resize Function from Q44)
- **Custom Cloud Function** owns ClamAV scan (Extension cannot replace this — Clara Voss)
- **Builder UI + Zod schema** own alt text enforcement (Nadia Sokolov)

**Delete User Data:**

- Configure paths: `companies/{companyId}`, `users/{uid}`, related Storage prefix
- Triggered on Auth user delete or owner “Delete account” dashboard action
- Complements Q42 Phase 3 full export; handles erasure (GDPR Art. 17)

### Decision log (Extensions)

| # | Question | Decision | Owners |
|---|----------|----------|--------|
| **Q63** | Stripe Extension vs fully custom? | **Official Stripe Extension + custom Functions on top** — Extension for Checkout/webhooks/Customer docs; custom for `provisionTenant`, company mapping, feature sync, £149 one-time | Owen Reilly, Kai Nakamura |
| **Q64** | Resize Images Extension vs custom thumbnails? | **Extension for resize/thumbnails** + **custom Function for ClamAV only** — alt text stays in builder | Nora Patel, Clara Voss |
| **Q65** | How does marketing show real pre-built templates? | **Platform demo tenants** on site-renderer — slug = `templateId`, CI-seeded published homepages from `templates/` seeds; marketing links in new tab; no `component-registry` in marketing | Samuel Ruiz, Michael Chen, Rafael Ortiz |
| **Q66** | Project plan §6 "no iframe" vs full preview? | **Keep mock inline preview**; **external** "Preview full site" link to demo subdomain (not iframe) — Phase 2.1 Wave 19 | Sophia Laurent, Theo Laurent |
| **Q67** | Multiple starter templates for first site selection? | **10 library starters sufficient for launch** — presented as **starter designs**; Wave 19 preview + ENG-027 filters; expand +4 in Wave 20 (B10-001) | Samuel Ruiz, Sophia Laurent, Theo Laurent, Marcus Klein |
| **Q68** | How are new starter templates generated? | **Manual JSON authoring** (now); scaffold script Wave 20 (B10-002); AI-assisted **Phase 2.2+**; CI `validate:templates` + `seedVersion` bump required | Rafael Ortiz, Alex Rivera, Samuel Ruiz |
| **Q69** | `new-template.mjs` manifest authority? | **Skeleton only** — human PR updates manifest, `lib/templates.ts`, reserved slugs, demo seed, thumbnails | Alex Rivera, Rafael Ortiz |
| **Q70** | Wave 20 new template IDs finalized? | **Yes** — `wellness-clinic`, `clear-accounting`, `focus-photography`, `fit-hub` + 3 new categories | Samuel Ruiz, Marcus Chen |
