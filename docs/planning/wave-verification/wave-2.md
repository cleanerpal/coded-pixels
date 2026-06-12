# Wave 2 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** ENG-004, ENG-005, and ENG-006 are done  
**Milestone:** M0 complete — the site looks like a real product shell, and the pricing/URL maths work in tests (still no configurator on screen)

---

## In one sentence

After Wave 2, every page has a proper header and footer, Privacy/Terms stub pages exist, and behind the scenes the pricing engine and shareable URL encoding are fully tested — but the homepage is still the token demo from Wave 1.

---

## Before you start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

Terminal checks (must pass):

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

You should see **58 tests passing** (14 pricing + 44 config-state).

---

## What you should see in the browser

### Every page — header (ENG-005)

| What | What to look for |
|------|------------------|
| **Logo** | “Coded” in indigo + “Pixels” in cyan wordmark, top left |
| **Navigation** | “Templates” and “Pricing” links (pages may 404 until Wave 5 — that is OK) |
| **Get Started** | Cyan CTA button, top right |
| **Sticky bar** | Header stays visible when you scroll |
| **Mobile** | Narrow the window (< 768px) — hamburger menu appears; tap to open nav |

### Every page — footer (ENG-005)

| What | What to look for |
|------|------------------|
| **Dark band** | Navy/dark footer at bottom |
| **Trust line** | “UK-based · Secure payments · GDPR compliant · Cancel anytime” |
| **Legal links** | Privacy and Terms links |

### Homepage (`/`)

Same token demo as Wave 1, **plus** header and footer wrapping it.

### Privacy (`/privacy`) and Terms (`/terms`)

- [ ] Each page loads (stub content is fine — real copy comes in Wave 5)
- [ ] Header and footer still present
- [ ] Not a 404

### What you should **not** see yet

- Configurator UI on the homepage (Wave 4 wires it)
- Live price updating as you click (Wave 4)
- `/templates` or `/pricing` gallery pages (Wave 5)

---

## Manual test checklist

### A — Layout & navigation (ENG-005)

- [ ] Header visible on `/`, `/privacy`, `/terms`
- [ ] Footer visible on all three routes
- [ ] Click **Privacy** in footer → lands on `/privacy`
- [ ] Click **Terms** in footer → lands on `/terms`
- [ ] Click logo → returns to `/`
- [ ] Resize to phone width → menu button works; links reachable
- [ ] Tab through header links — visible focus ring (indigo outline)

### B — Metadata (ENG-005)

- [ ] View page source on `/` — `<html lang="en-GB">`
- [ ] `<title>` contains CodedPixels
- [ ] Meta description mentions £9.99/mo (roughly)

### C — Pricing engine (ENG-004) — terminal proof

Run:

```bash
npm test -- lib/pricing.test.ts
```

- [ ] All 14 tests pass
- [ ] Output mentions Growth **2496** pence and Pro **3994** pence

Manual spot-check (optional): open `lib/pricing.test.ts` and confirm Growth/Pro totals match marketing card labels (£24.99 / £39.99 are *labels*, not engine totals).

### D — URL config state (ENG-006) — terminal proof

Run:

```bash
npm test -- lib/config-state.test.ts
```

- [ ] All 44 tests pass
- [ ] Tests cover invalid params → partial restore (Q40)

Browser note: shareable URLs are **not** wired to the UI until Wave 3–4. Wave 2 only proves encode/decode in tests.

### E — Regression from Wave 1

- [ ] Token demo card still renders correctly
- [ ] Colours still match brand (indigo + cyan + green)

---

## Quick “did Wave 2 really land?” command block

Copy-paste this — all checks should succeed:

```bash
npm test
test -f lib/pricing.ts && test -f lib/config-state.ts
test -f components/layout/Header.tsx && test -f components/layout/Footer.tsx
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/privacy | grep -q 200 && echo "privacy OK"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/terms | grep -q 200 && echo "terms OK"
```

*(Run `npm run dev` first for the curl checks.)*

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Header missing | `app/layout.tsx` not importing `Header` / `Footer` |
| Pricing tests fail | `lib/pricing.ts` formula drift — Growth must be 2496, Pro 3994 |
| Config-state tests fail | URL param names changed — check `implementation-tickets.md` ENG-006 |
| Templates/Pricing nav 404 | Expected until Wave 5 — link existence in header is enough for Wave 2 |

---

## Expert alignment

Aligned with **Dr. Marcus Klein** (Q1/Q54 pricing), **Dr. Lena Petrova** (layout), **Dr. Lena Petrova** on **Q40** (partial URL restore).
