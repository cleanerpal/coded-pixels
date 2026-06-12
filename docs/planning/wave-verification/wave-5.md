# Wave 5 — Legal pages, gallery, pricing, Firebase scaffold

**Written by:** Mia Thompson  
**Wave closes when:** DOC-002, ENG-017, ENG-018, ENG-019, INF-001, INF-004 are done  
**Milestone:** M3 **part 1** — browse templates and pricing, read real legal pages; Firebase + Sentry wired (not full signup yet)  
**Status:** Shipped

**Continues in:** [wave-6.md](wave-6.md) (cookie banner) → [wave-7.md](wave-7.md) (Callables) → [wave-8.md](wave-8.md) (get-started)

---

## In one sentence

After Wave 5, visitors can browse `/templates` and `/pricing`, read real Privacy/Terms, and engineers have Firebase + Sentry ready — but signup, cookie banner, and analytics gating land in **Waves 6–8**.

---

## Before you start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

---

## What you should see in the browser

### New / updated routes

| URL | What to look for |
|-----|------------------|
| `/templates` | Gallery with categories; “Use this template” → configurator with template pre-selected |
| `/pricing` | Comparison table; footnote on card vs live totals; deep links to configure |
| `/privacy` | **Real** legal content (not stub) — VAT, subprocessors, retention |
| `/terms` | **Real** terms — simulated checkout disclaimer |

### Site-wide

| Feature | What to look for |
|---------|------------------|
| **FAQ / How It Works** | Real copy on homepage |
| **Sentry** | Scaffold present (INF-004) — errors scrubbed in production config |
| **Configurator on `/`** | Still works from Wave 4 |

### What you should **not** expect yet (Waves 6–8)

- Cookie banner or consent-gated GA4 → **Wave 6–7**
- `/get-started` signup flow → **Wave 8**
- Site Import waitlist submit → **Wave 8**
- Signups writing to Firestore via Callables → **Wave 7**

---

## Manual test checklist

### A — Legal pages (DOC-002)

- [ ] `/privacy` — full policy, not “placeholder”
- [ ] `/terms` — full terms, simulated checkout called out
- [ ] Footer links open correct pages

### B — Templates page (ENG-017)

- [ ] `/templates` loads; header/footer present
- [ ] Category filters work
- [ ] 10 templates + custom shown
- [ ] “Use this template” → `/?template=<id>#configurator` with correct selection

### C — Pricing page (ENG-018)

- [ ] `/pricing` comparison table renders
- [ ] Footnote: card prices vs live configurator total
- [ ] “Configure this plan” links pre-fill package/features

### D — FAQ & content (ENG-019)

- [ ] 8–10 FAQ items with sensible answers
- [ ] Cancel anytime copy matches MVP simulation stance

### E — Wave 4 regression

- [ ] Full configurator on `/` still works
- [ ] URL share + refresh still works
- [ ] Mobile pricing bar still matches desktop total

---

## Templates note

Wave 5 adds the **gallery page** — template **metadata** still comes from Wave 1 (`apps/marketing/lib/templates.ts`). Firestore template seeds ship in **Wave 12** (B1-001). See [roadmap.md](roadmap.md).

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Privacy still stub | DOC-002 not merged |
| Templates 404 | ENG-017 route missing |
| Configurator broken | Regression — check Wave 4 guide |

---

## Expert alignment

Aligned with **Dr. Patrick O'Brien** (legal pages), **Ms. Rebecca Flynn** (simulated checkout copy), **Dr. Mira Solano** (Sentry INF-004).
