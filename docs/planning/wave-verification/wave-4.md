# Wave 4 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** ENG-013, ENG-014, ENG-015, and ENG-016 are done  
**Milestone:** M2 — the configurator is **live on the homepage**, with preview, annual toggle, and marketing sections  
**Status when this was written:** Not yet shipped — use this guide when Wave 4 closes.

---

## In one sentence

After Wave 4, the homepage feels like the real product: hero, package cards, the full three-step configurator with live preview, annual/monthly toggle, and shareable links — all on one scrollable page.

---

## Before you start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

Terminal:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## What you should see in the browser

### Homepage (`/`) — top to bottom

| Section | What to look for |
|---------|------------------|
| **Hero** | Single main headline (only one `<h1>` on the page), subtext, CTA that scrolls to configurator |
| **Package cards** | Starter, Growth (**Most Popular**), Pro, Custom — above the configurator |
| **Configurator** (`#configurator`) | Three-step progress indicator (Templates → Features → Preview/summary area) |
| **Step 1** | Grid of 10 templates + Custom Design card |
| **Step 2** | Grouped feature toggles with `+ £X.XX/mo` labels |
| **Preview panel** (desktop) | Mock browser window; theme changes when you pick templates; badges for enabled features |
| **Pricing sidebar** (desktop, right) | Line items, live total in cyan, Copy link, Get Started |
| **Mobile pricing bar** | Bottom sticky bar on narrow screens — tap to expand full breakdown |
| **Annual toggle** | Switch monthly ↔ annual; “Save £XX per year” badge when annual |
| **How It Works / Testimonials / FAQ** | Section shells (placeholders OK — full FAQ copy may come Wave 5) |
| **Footer** | Same as Wave 2 |

### Visual behaviour

- Pick **Trade Pro** template → preview chrome/theme shifts
- Enable **CRM** → preview shows a CRM badge; total increases
- Click **Growth** package → features pre-fill; total **£24.96/mo** (not £24.99)
- **Get Started** greyed out until you pick a template

---

## Manual test checklist

### A — Hero & landing (ENG-016)

- [ ] Exactly **one** H1 on the page (View Source or accessibility tree)
- [ ] Hero CTA scrolls smoothly to `#configurator`
- [ ] Testimonials labelled as example stories (Q58 — not fake real people)
- [ ] Page still has header + footer

### B — Configurator wiring (ENG-015)

- [ ] `#configurator` section exists — URL `/#configurator` jumps there
- [ ] Step indicator shows 3 steps; current step has `aria-current="step"`
- [ ] Can jump between steps non-linearly (click step labels if supported)
- [ ] All Wave 3 components visible and interactive

### C — Templates (ENG-008 regression)

- [ ] 10 templates + custom visible
- [ ] Selected template has visible ring/check
- [ ] Custom card → billing mode toggle (recurring vs one-time £149 note in sidebar)
- [ ] Keyboard: arrow keys move between template cards

### D — Features (ENG-009 regression)

- [ ] Toggle CRM on → total updates immediately
- [ ] Toggle CRM off again → total drops
- [ ] Site Import card visible, **not** clickable as a feature; shows ~£6.99
- [ ] Waitlist email expand works (no submit to server yet)

### E — Pricing & packages (ENG-010, ENG-011, ENG-014)

- [ ] Base plan only → **£9.99/mo**
- [ ] Growth preset → **£24.96/mo** in sidebar (2496 pence)
- [ ] Pro preset → **£39.94/mo** (3994 pence)
- [ ] Package card may say £24.99 / £39.99 — footnote says exact total in summary
- [ ] Switch to **Annual** → total changes; savings badge shows whole pounds/pence (no decimals drift)
- [ ] One-time custom template → £149 line at checkout section, **not** added to monthly total
- [ ] Copy link → toast “Configuration link copied!” → paste in new tab → same setup

### F — URL persistence (ENG-007)

- [ ] Select template + features → wait 1 second → URL has `?template=...&features=...`
- [ ] **Refresh page** → choices preserved
- [ ] Browser Back does not create spam history on every toggle (uses replace, not push)
- [ ] Invalid URL `/?template=fake&features=crm` → CRM kept, template cleared (Q40)

### G — Preview (ENG-013)

- [ ] Preview panel visible on desktop Steps 1–3
- [ ] Changing template animates or updates theme colours
- [ ] Enabled features show badges on preview
- [ ] Mobile: preview collapses to tab or stacked layout

### H — Mobile bar (ENG-012)

- [ ] Resize to 375px width (iPhone SE)
- [ ] Desktop sidebar hidden; bottom bar visible
- [ ] Expand sheet → same line items and total as desktop
- [ ] **Esc** closes sheet; focus trapped inside when open
- [ ] Get Started reachable without scrolling past entire page

### I — Deep links

- [ ] Open `/?package=growth#configurator` → Growth selected, features filled, scrolls to configurator
- [ ] Open `/?template=serenity-spa#configurator` → spa template selected

### J — Regression

- [ ] `/privacy` and `/terms` still load
- [ ] `npm test` still green

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Token demo still on `/` | ENG-015 not merged — configurator not wired |
| Total shows £24.99 | Showing card label instead of engine — sidebar must use `monthlyTotalPence` |
| URL does not update | `useConfigUrlState` not wrapped in `<Suspense>` |
| Annual savings wrong | Must use integer pence formula from ENG-004 |
| Preview static | ENG-013 not integrated |

---

## Expert alignment

Aligned with **Dr. Sophia Laurent** (step flow), **Dr. Marcus Klein** (annual Q6), **Dr. Nadia Sokolov** (a11y), **Ms. Rebecca Flynn** (Q58 testimonial labelling).
