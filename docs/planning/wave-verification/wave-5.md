# Wave 5 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** Pages, Firebase, legal, cookie consent, GA4, get-started flow, and waitlist UI are done  
**Milestone:** M3 — a visitor can browse, configure, sign up (simulated), and read real legal pages  
**Status when this was written:** Not yet shipped — use this guide when Wave 5 closes.

---

## In one sentence

After Wave 5, the marketing site is feature-complete for launch prep: real Privacy/Terms, template gallery, pricing comparison, email signup with order summary, cookie banner blocking analytics until you opt in, and Firebase storing signups safely.

---

## Before you start

```bash
npm install
npm run dev
```

For signup/waitlist tests you also need the **Firebase emulator** (see project docs for INF-001/INF-003):

```bash
# Example — exact command may vary after INF-001 lands
npm run emulators
```

Terminal:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

---

## What you should see in the browser

### New / updated routes

| URL | What to look for |
|-----|------------------|
| `/templates` | Gallery with categories; “Use this template” → configurator with template pre-selected |
| `/pricing` | Comparison table; footnote on card vs live totals; deep links to configure |
| `/get-started` | Order summary from URL config; email-only form; simulation banner |
| `/privacy` | **Real** legal content (not stub) — VAT, subprocessors, retention |
| `/terms` | **Real** terms — simulated checkout disclaimer |

### Site-wide

| Feature | What to look for |
|---------|------------------|
| **Cookie banner** | Blocks bottom of screen on first visit; Accept / Reject |
| **Analytics** | GA4 **does not** load until Accept (check Network tab — no google-analytics until consent) |
| **Sentry** | Errors scrubbed — no email in reports (INF-004) |
| **FAQ / How It Works** | Real copy on homepage or dedicated sections |

### Get Started flow (ENG-020)

1. Configure on `/` → click **Get Started**
2. See order summary matching your choices
3. One-time £149 line if custom template one-time mode
4. **Email only** — no password field
5. Clear **simulation** banner — not real payment
6. Submit → success message “We’ll be in touch soon” + copy link + optional modal

### Site Import waitlist (ENG-023)

- Expand email on coming soon card → consent checkbox + Privacy link → submit calls Firebase Callable (emulator in dev)

---

## Manual test checklist

### A — Legal pages (DOC-002)

- [ ] `/privacy` — full policy, not “placeholder”
- [ ] `/terms` — full terms, simulated checkout called out
- [ ] Footer links open correct pages
- [ ] Privacy linked from signup and waitlist forms
- [ ] DPO/contact placeholders replaced OR clearly flagged for product owner

### B — Cookie consent (ENG-021) & GA4 (ENG-022)

- [ ] First visit → banner visible
- [ ] **Reject** → banner dismisses; reload → choice remembered
- [ ] Before Accept → no GA4 requests in Network tab
- [ ] **Accept** → GA4 loads (if `NEXT_PUBLIC_GA_ID` set)
- [ ] Reload → banner does not reappear

### C — Templates page (ENG-017)

- [ ] `/templates` loads; header/footer present
- [ ] Category filters work
- [ ] 10 templates + custom shown
- [ ] “Use this template” → `/?template=<id>#configurator` with correct selection

### D — Pricing page (ENG-018)

- [ ] `/pricing` comparison table renders
- [ ] Footnote: card prices vs live configurator total
- [ ] “Configure this plan” links pre-fill package/features

### E — FAQ & content (ENG-019)

- [ ] 8–10 FAQ items with sensible answers
- [ ] Cancel anytime copy matches MVP simulation stance

### F — Get Started (ENG-020) — happy path

- [ ] From configurator with template + Growth → Get Started
- [ ] Order summary shows £24.96/mo recurring (+ one-time line if applicable)
- [ ] Simulation banner visible
- [ ] Form: email only, consent checkbox required
- [ ] Submit with emulator running → success state
- [ ] Success shows compact summary + copy link restores config

### G — Security & PII gate

- [ ] No password field anywhere on get-started
- [ ] Browser Network tab → signup goes to **Callable**, not direct Firestore write
- [ ] Test error in Sentry (if configured) does not contain submitted email

### H — Waitlist (ENG-023)

- [ ] Site Import expand → email + consent
- [ ] Submit stores waitlist entry with config snapshot (check emulator Firestore)

### I — Wave 4 regression

- [ ] Full configurator on `/` still works
- [ ] URL share + refresh still works
- [ ] Mobile pricing bar still matches desktop total

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Signup 403 / CORS | Emulator not running or App Check misconfigured |
| GA4 loads immediately | ENG-021 gate broken — analytics must wait for consent |
| Privacy still stub | DOC-002 not merged |
| Get Started without config | URL params not passed — check ENG-006 encode on link |

---

## Expert alignment

Aligned with **Dr. Patrick O'Brien** (GDPR/consent), **Ms. Rebecca Flynn** (simulated checkout), **Dr. Kai Nakamura** (Callables), **Dr. Amina Laurent** (GA4 Q20 events).
