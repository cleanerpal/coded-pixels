# Wave 6 — Firestore rules + cookie consent

**Written by:** Mia Thompson  
**Wave closes when:** INF-002 and ENG-021 are done  
**Milestone:** M3 **part 2** — deny-by-default Firestore rules; cookie banner on marketing site  
**Status:** Shipped

**Continues in:** [wave-7.md](wave-7.md) (Callables + GA4) → [wave-8.md](wave-8.md) (get-started)  
**Full M4 QA checklist:** [wave-9.md](wave-9.md) (E2E, SEO, Lighthouse — originally drafted as “Wave 6” before we split waves)

---

## In one sentence

After Wave 6, visitors see a **cookie banner** on first visit, and Firestore is locked down so the marketing site cannot write PII directly — signup Callables arrive in Wave 7.

---

## Before you start

```bash
npm install
npm run dev
```

---

## What you should see in the browser

| Feature | What to look for |
|---------|------------------|
| **Cookie banner** | Blocks bottom of screen on first visit; Accept / Reject |
| **Choice remembered** | Reload after Reject → banner stays dismissed |
| **Wave 5 routes** | `/templates`, `/pricing`, `/privacy`, `/terms` unchanged |

### What you should **not** expect yet

- GA4 loading only after Accept → **Wave 7** (ENG-022)
- Signup or waitlist forms calling Firebase → **Waves 7–8**
- `/get-started` page → **Wave 8**

---

## Manual test checklist

### A — Cookie consent (ENG-021)

- [ ] First visit → banner visible
- [ ] **Reject** → banner dismisses; reload → choice remembered
- [ ] **Accept** → banner dismisses; reload → choice remembered
- [ ] Privacy policy linked from banner

### B — Firestore rules (INF-002) — terminal

- [ ] `npm run test:rules` passes (15 tests at Wave 6; expands to 52+ after Wave 12 B1-002)
- [ ] Rules file exists: `firestore.rules` with deny-by-default pattern

### C — Wave 5 regression

- [ ] `/templates` gallery still works
- [ ] Configurator on `/` still works
- [ ] Legal pages still full content

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Banner never appears | ENG-021 not merged or localStorage cleared every load |
| Banner reappears every visit | Consent storage key broken |

---

## Expert alignment

Aligned with **Dr. Patrick O'Brien** (cookie categories), **Dr. Victor Lang** / **Dr. Rafael Ortiz** (Firestore rules INF-002).
