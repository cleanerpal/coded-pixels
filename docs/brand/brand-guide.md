# CodedPixels — Brand Guide

**Document owner:** Dr. Marcus Chen (Brand Strategy & Visual Identity)  
**Plain-language review:** Mia Thompson  
**Status:** MVP foundation locked · Final logo SVG before public launch  
**Last updated:** 12 June 2026  
**Related:** `../specs/codedpixels-project-plan.md` §9–10, Q7 · ENG-002 · ENG-005

---

## 1. Brand at a glance

| | |
|--|--|
| **Name** | CodedPixels |
| **Domain** | codedpixels.co.uk |
| **One-line position** | Professional websites without agency prices |
| **Audience** | UK small businesses and sole traders who want clarity, control, and fair pricing |
| **Personality** | Clear · Trustworthy · Modern · No-nonsense · Upgrade-friendly |
| **Anti-patterns** | Pushy sales, hidden fees, jargon-heavy “enterprise” tone, lock-in contracts |

CodedPixels is not positioned as a cheap DIY toy or a luxury agency. It sits in the middle: **serious enough for a tradesperson or solicitor, simple enough that pricing and choices feel obvious within seconds.**

---

## 2. Naming rules

| Context | Use |
|---------|-----|
| Product UI, buttons, header | **CodedPixels** (camelCase, one word) |
| Marketing prose, press, legal | **CodedPixels** or **Coded Pixels** (both acceptable) |
| URLs, email, schema | `codedpixels`, `codedpixels.co.uk` (lowercase) |
| Client sites (default) | Small “Powered by CodedPixels” unless **White-label** add-on removes it |
| Agency dashboard white-label | Phase 3+ — not MVP |

**Decision Q7 (Elena Voss + Marcus Chen):** Name and domain are confirmed. Do not rebrand during M0–M4 unless there is a strategic reason — renaming touches URLs, Stripe, Firestore, and all docs.

---

## 3. Logo

### MVP (build now)

**Type:** Text wordmark only — no icon mark required for engineering start.

```
CodedPixels
^^^^^       ^^^^^^
indigo      cyan
#4F46E5     #06B6D4
```

| Part | Colour | Hex |
|------|--------|-----|
| “Coded” | Deep indigo | `#4F46E5` |
| “Pixels” | Electric cyan | `#06B6D4` |

**Implementation (ENG-005):**
- Header: wordmark as styled text or inline SVG stub
- Font: **Inter**, weight **700**, slightly tight letter-spacing
- Minimum clear space: height of the “C” on all sides
- Do not stretch, outline, or add drop shadows to the wordmark

### Before public launch (M4)

Replace placeholder with a **final SVG wordmark** (optional subtle pixel motif — e.g. one letter or dot grid hint). Deliverables:

- [ ] `logo.svg` — full colour, horizontal
- [ ] `logo-mono.svg` — single colour for dark backgrounds
- [ ] `favicon.ico` / `apple-touch-icon.png`
- [ ] Open Graph image (`1200×630`) — wordmark + headline on off-white or dark hero

**Not required for MVP coding:** Icon-only mark, animated logo, brand pattern library.

---

## 4. Colour palette

All colours are defined as CSS variables in `globals.css` (ENG-002). Use tokens in components — avoid hardcoded hex in JSX.

### Core brand colours

| Token | Hex | RGB | Role | Rationale |
|-------|-----|-----|------|-----------|
| **Primary** | `#4F46E5` | 79, 70, 229 | Links, selected states, focus rings, “Coded” in logo | Deep indigo — trust + tech without corporate grey |
| **Accent** | `#06B6D4` | 6, 182, 212 | Primary CTAs, **live price total**, “Pixels” in logo | Electric cyan — energy, clarity, “live” feeling |
| **Success** | `#10B981` | 16, 185, 129 | Annual savings badge, positive confirmations | Emerald — money saved, not alarm green |

### Neutrals & surfaces

| Token | Hex | Role |
|-------|-----|------|
| **Background** | `#FAFAFA` | Page background — warm off-white, not pure `#FFFFFF` everywhere |
| **Surface** | `#FFFFFF` | Cards, configurator panels |
| **Dark section** | `#0F172A` | Footer, optional dark hero bands — slate navy |
| **Text primary** | `#0F172A` or `#1E293B` | Body copy on light backgrounds |
| **Text muted** | `#64748B` | Secondary labels, helper text |
| **Border** | `#E2E8F0` | Card borders, dividers |

### Semantic usage

| Element | Colour |
|---------|--------|
| Primary button | Accent fill `#06B6D4`, white text |
| Secondary button | White/outline, primary border or text |
| Selected template card | `ring-2 ring-primary` (`#4F46E5`) |
| Live monthly total | Accent `#06B6D4` |
| “Most Popular” package badge | Primary or accent pill on Growth card |
| Error / validation | Use accessible red (define as `--color-error` if needed — not in MVP tokens yet) |

**Accessibility (Dr. Nadia Sokolov):** Body text contrast ≥ **4.5:1**. Do not use colour alone for selected/on states — add ring, checkmark, or `aria-checked`.

---

## 5. Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| **Body** | [Inter](https://fonts.google.com/specimen/Inter) | 400 | All UI copy, FAQ, legal (legal may use 400–500) |
| **Headlines** | Inter | 700 | H1–H3; optional display font deferred — Inter 700 is MVP default |
| **Labels / badges** | Inter | 500–600 | Package names, step labels |
| **Price figures** | Inter | 700 | Live total slightly larger than body — accent colour |

**Scale (guidance):**
- Hero H1: ~2.25–3rem mobile → 3.5rem desktop
- Section H2: ~1.75–2.25rem
- Body: 1rem (16px) minimum on mobile
- Micro-copy (VAT note, footnotes): 0.875rem

**Loading:** Inter via `next/font/google` — no FOUT on critical path.

---

## 6. Shape, space & motion

| Token | Value | Use |
|-------|-------|-----|
| **Card radius** | `rounded-xl` (~12px) | Package cards, template tiles, configurator panels |
| **Pills / badges** | `rounded-full` | “Most Popular”, savings badge, filter chips |
| **Shadow default** | `shadow-sm` | Resting cards |
| **Shadow hover** | `shadow-lg` | Template/package hover lift |
| **Live price pulse** | Scale 150ms ease | When total changes — subtle, not flashy |
| **Transitions** | CSS transitions default | Prefer CSS over heavy JS animation |

**Icons:** Lucide React — stroke icons, 1.5–2px stroke, aligned with Inter’s clean geometry.

**Density:** Generous whitespace on marketing pages; configurator can be denser but never cramped on 375px mobile.

---

## 7. Voice & tone

**Owners:** Ms. Lila Moreau (copy) · Mia Thompson (plain language) · Mr. Theo Laurent (conversion)

### Principles

1. **Say the price out loud** — Every add-on shows `+ £X.XX/mo`. No “contact us for pricing” on the configurator.
2. **UK-first** — VAT-inclusive prices, £ symbol, plain English, no US spellings in customer copy.
3. **Honest MVP** — Simulated checkout is labelled. Testimonials are **“Example customer stories”**. No fake “email sent” promises.
4. **No lock-in fear** — Repeat: cancel anytime, upgrade/downgrade anytime.
5. **Confidence without hype** — “Professional” and “minutes”, not “revolutionary” or “disruptive”.

### Tone spectrum

| Do | Don’t |
|----|-------|
| “Build your professional website in minutes.” | “Unlock synergistic digital transformation.” |
| “Pay only for what you need.” | “Limited time offer — act now!!!” |
| “We’ve saved your plan — we’ll be in touch soon.” | “Check your inbox for instant access!” (when email isn’t live) |
| “Estimated · launching soon” (Site Import) | Implying unavailable features are included |

---

## 8. Key messaging & copy library

### Positioning line (CEO — Elena Voss)

> **Professional websites without agency prices.**

### Hero (landing `/`)

| Element | Copy |
|---------|------|
| **Headline** | Build your professional website in minutes. Pay only for what you need. |
| **Subheadline** | Starting at £9.99/mo · Instant preview · Cancel anytime |
| **Primary CTA** | Start Building → scroll to `#configurator` |
| **Secondary CTA** | Browse Templates → `/templates` |

### Package section micro-copy

> Upgrade or downgrade anytime — no lock-in contracts.

**Growth card:** “Most Popular” badge.

### Configurator

| Moment | Copy |
|--------|------|
| Custom template toggle | Prefer a one-time fee? Switch to £149. |
| Site Import (coming soon) | Import your existing site — launching soon · +£6.99/mo estimated |
| Copy link success | Configuration link copied! |
| Annual savings | Save £XX per year (computed live) |

### Get Started / success (Q58, Q19)

| Element | Copy |
|---------|------|
| Simulation banner | Clear label that checkout is simulated in MVP |
| Success primary message | We’ve saved your plan — we’ll be in touch soon |
| Primary CTA | Start building my site now → “almost ready” modal |
| Secondary | Copy configuration link · Back to home |

### Footer trust bar

> UK-based · Secure payments · GDPR compliant · Cancel anytime

### Pricing display rule (Q58)

All customer-facing prices **include UK VAT** where applicable. FAQ must state “Prices include VAT.”

---

## 9. UI patterns (brand in product)

These patterns *are* the brand on the marketing site:

| Pattern | Brand expression |
|---------|------------------|
| **Live configurator** | Transparency — price moves as you choose |
| **Package cards + live total** | Card price is marketing; sidebar total is truth |
| **Template grid** | Professional verticals (trades, beauty, legal…) — shows range without clutter |
| **Preview panel** | Mock browser chrome — “your site, instantly” |
| **Sticky mobile pricing bar** | Conversion — total always visible, expandable sheet |
| **Dark footer** | Anchor trust signals on `#0F172A` |

---

## 10. Template gallery aesthetic (customer sites)

The **marketing brand** (indigo/cyan, Inter) wraps the **template previews** — each template has its own palette inside the preview mockup. Templates are products, not the CodedPixels brand colours.

| # | Name | Category | Mood |
|---|------|----------|------|
| 1 | Sparkle Clean | Cleaning & Trades | Professional cleaning, quote form |
| 2 | TradePro | Cleaning & Trades | Trades portfolio, emergency CTA |
| 3 | Serenity Spa | Beauty & Wellness | Calm salon/spa aesthetic |
| 4 | Glow Studio | Beauty & Wellness | Bold beauty, booking CTA |
| 5 | Apex Legal | Professional Services | Trust-focused, conservative |
| 6 | Corner Shop | Retail | Product showcase, store-ready |
| 7 | The Local | Hospitality | Restaurant/pub, menu & reservations |
| 8 | LearnHub | Education | Courses, schedules, enrollment |
| 9 | Business Core | General Business | Flexible multi-section corporate |
| 10 | Startup Launch | General Business | Modern single-page startup |
| — | **Custom Template** | Bespoke | “Bespoke design” badge; enables custom-template add-on |

**MVP:** Template preview placeholders — gradient + category icon per template (project plan §4); replace with WebP screenshots before or after launch.

---

## 11. Photography & imagery (guidance)

**MVP:** Template preview illustrations/screenshots — no custom photo shoot required for launch.

| Use | Direction |
|-----|-----------|
| Template thumbnails | Clean mockups; diverse but generic UK small-business contexts |
| Hero | Optional abstract gradient (primary → accent at low opacity) or simple product UI screenshot |
| Testimonials | Avatar placeholders or initials — labelled fictional |
| Icons | Lucide only — no mixed icon sets |

**Avoid:** Stock photos with obvious watermarks, US-centric imagery, cluttered collages.

---

## 12. White-label & branding on client sites

| Product feature | What it means |
|-----------------|---------------|
| **Default** | Client’s published site may show “Powered by CodedPixels” |
| **White-label add-on** (+£9.99/mo) | Remove CodedPixels branding on **client sites** |
| **Agency platform white-label** | Reseller-branded dashboard — **Phase 3+**, not MVP |

Marketing site always remains CodedPixels-branded.

---

## 13. Brand checklist by milestone

### M0 — Start building (minimum)

- [x] Name, domain, positioning (Q7)
- [x] Colour tokens + Inter (ENG-002)
- [ ] Text wordmark in header (ENG-005)
- [ ] Hero headline/subheadline as specced

### M4 — Before public launch

- [ ] Final SVG logo + favicon + OG image
- [ ] All prices VAT-inclusive copy verified
- [ ] Testimonials labelled “Example customer stories”
- [ ] Simulation banner on Get Started
- [ ] Privacy/Terms live (legal brand trust)

### Phase 2+ (optional evolution)

- [ ] Display font for marketing headlines only
- [ ] Icon mark / app icon for builder dashboard
- [ ] Brand guidelines PDF for partners
- [ ] Template preview art refresh

---

## 14. Quick reference — CSS tokens (implement in ENG-002)

```css
:root {
  /* Brand */
  --color-primary: #4F46E5;
  --color-accent: #06B6D4;
  --color-success: #10B981;

  /* Surfaces */
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-dark: #0F172A;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

---

## 15. Who to ask

| Question | Owner |
|----------|-------|
| Logo, colours, visual identity | Dr. Marcus Chen |
| Headlines, CTAs, conversion copy | Mr. Theo Laurent · Ms. Lila Moreau |
| Plain-language / stakeholder summaries | Mia Thompson |
| Accessibility contrast & inclusive UX | Dr. Nadia Sokolov |
| Legal/trust copy on site | Dr. Patrick O'Brien · Ms. Rebecca Flynn |

---

**Summary:** CodedPixels looks **clean, indigo-and-cyan, Inter-driven, and price-transparent**. The logo for now is a two-tone wordmark; the product experience *is* the brand until Phase 2 adds a dashboard and published customer sites with their own template identities.

— **Dr. Marcus Chen** · reviewed for clarity by **Mia Thompson**
