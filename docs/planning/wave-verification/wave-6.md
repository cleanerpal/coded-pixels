# Wave 6 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** QA-001 through QA-006 (and related quality tickets) pass  
**Milestone:** M4 — launch quality gate; automated E2E, performance, SEO, and rules tests green  
**Status when this was written:** Not yet shipped — use this guide when Wave 6 closes.

---

## In one sentence

After Wave 6, you can trust the whole journey — configure, share a link, sign up, and waitlist — with robots and scripts continuously proving it works, fast, and accessible.

---

## Before you start

```bash
npm install
npm run dev
```

Full quality gate (Nathan runs before wave commit):

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e          # Playwright — after QA-001/002/006 land
npm run test:rules        # Firestore rules — after QA-005 lands
```

---

## What you should see in the browser

From a visitor’s perspective, Wave 6 should look **the same as Wave 5** — this wave is about **confidence**, not new features.

You should notice:

| Area | Expectation |
|------|-------------|
| **Speed** | Configurator feels snappy on mobile |
| **Accessibility** | Keyboard-only use works end-to-end |
| **Stability** | No console errors during normal flows |
| **SEO** | View source shows sensible meta, sitemap, robots.txt |
| **Trust** | Legal, cookie, and simulation messaging still clear |

---

## Manual test checklist

These complement automated Playwright specs — run them before sign-off.

### A — Full spine walkthrough (mirrors QA-006)

Do this once in Chrome and once in Safari or Firefox:

- [ ] Land on `/`
- [ ] Click **Growth** package → confirm **£24.96/mo**
- [ ] Pick any template
- [ ] Toggle **CRM** off → total drops
- [ ] Copy configuration link → open in **new incognito window** → same state
- [ ] Click **Get Started** → summary matches
- [ ] Submit email (emulator) → success page
- [ ] Copy link from success → config restores

### B — Configurator E2E scenarios (QA-001)

- [ ] URL refresh mid-configuration preserves state
- [ ] Invalid param `/?template=bogus&features=crm,sms` → CRM+SMS kept, template cleared, no crash
- [ ] Mobile 375px: sticky bar total = desktop sidebar total for same config
- [ ] Custom template one-time → £149 on get-started, not in monthly total

### C — Get Started E2E (QA-002)

- [ ] Shared URL → get-started order summary matches configurator
- [ ] Simulation banner always visible pre-submit
- [ ] Empty email blocked with clear message
- [ ] Success: no password prompt, friendly confirmation copy

### D — Waitlist path

- [ ] Site Import waitlist submit with config snapshot (compare emulator data)

### E — Performance (QA-003)

Run Lighthouse on `/` (mobile):

- [ ] Performance ≥ **90**
- [ ] Accessibility ≥ **95**
- [ ] Configurator JS chunk < **80kb** gzip (build output or bundle analyser)

Manual feel checks:

- [ ] First interaction < 1s on throttled 4G (DevTools → Network → Slow 4G)
- [ ] No layout jump when pricing bar mounts on mobile

### F — SEO (QA-004)

- [ ] `/robots.txt` exists and allows crawling
- [ ] `/sitemap.xml` lists key routes
- [ ] `/pricing` has JSON-LD (View Source → `application/ld+json`)
- [ ] Each public page has unique `<title>` and meta description

### G — Security (QA-005)

- [ ] `npm run test:rules` — all green
- [ ] Confirm in browser DevTools: no direct Firestore writes from marketing site on signup/waitlist

### H — Full regression matrix

Quick tick-list of routes:

- [ ] `/`
- [ ] `/templates`
- [ ] `/pricing`
- [ ] `/get-started` (with query params)
- [ ] `/privacy`
- [ ] `/terms`

All: header, footer, no 500, no console errors.

### I — Automated suite (terminal)

- [ ] `npm test` — zero failures
- [ ] `npm run test:e2e` — zero failures (when present)
- [ ] `npm run test:rules` — zero failures (when present)
- [ ] CI green on GitHub Actions (if configured)

---

## Sign-off checklist (coordinator)

Before calling M4 done:

- [ ] QA-006 spine spec green against Firebase emulator
- [ ] Dr. Nathan Cole integration gate signed
- [ ] No P0/P1 bugs open on configurator or signup
- [ ] `project-status.md` shows Wave 6 closed with commit SHA

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| E2E flaky on URL timing | Debounce 300ms — tests need `waitForURL` or network idle |
| Lighthouse perf low | Unoptimised images or huge client bundle |
| Rules test fail | Client write path leaked — must be Callable-only |
| a11y score drop | Missing labels on new Wave 5 form fields |

---

## Expert alignment

Aligned with **Dr. Sophia Moreau** (E2E), **Dr. Liam Harper** (unit/rules tests), **Dr. Rajiv Singh** (SEO), **Dr. Nadia Sokolov** (Lighthouse a11y), **Dr. Nathan Cole** (QA-006 integration gate).
