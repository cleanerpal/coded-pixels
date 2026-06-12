# Wave 8 — Get Started + Site Import waitlist

**Written by:** Mia Thompson  
**Wave closes when:** ENG-020 and ENG-023 are done  
**Milestone:** Visitors can submit email with order summary; Site Import waitlist on Step 2  
**Status:** Shipped

---

## In one sentence

After Wave 8, `/get-started` shows your configured plan and accepts email-only signup (simulated — no payment), and the Site Import card can join a waitlist.

---

## Before you start

```bash
npm install
npm run dev
```

For live Callable tests (optional):

```bash
npm run emulators   # terminal 1 — with .env.local emulator flags
npm run dev         # terminal 2
```

---

## What you should see in the browser

### `/get-started?…` (with config in URL)

| What | What to look for |
|------|------------------|
| **Order summary** | Line items match configurator (template, add-ons, total) |
| **One-time £149** | Appears when custom template one-time mode selected |
| **Simulation banner** | “No payment taken — this is a sign-up preview” |
| **Form** | Email only — **no password field** |
| **Consent** | Checkbox + link to `/privacy` |
| **Success** | Compact summary, “We’ll be in touch soon”, copy link, “Start building” modal |

### Configurator → Step 2 → Site Import

| What | What to look for |
|------|------------------|
| **Coming soon card** | Expandable email + consent |
| **Submit** | Calls waitlist Callable; success message |
| **Config snapshot** | Always sent (even if no template — Q17) |

### Pricing sidebar / mobile bar

| What | What to look for |
|------|------------------|
| **Get Started** | Links to `/get-started` with current config in URL |
| **Disabled** | When no template selected (Q40) |

---

## Manual checklist

- [ ] Configure Growth + template → Get Started → summary shows **£24.96/mo** (live engine)
- [ ] Submit email with emulator → success state (or mocked in CI)
- [ ] Reject cookies → still can signup; GA4 does not fire on success
- [ ] Site Import waitlist requires consent checkbox

---

## Templates note

Your chosen template **name** appears in the order summary and is **saved on signup**. It does **not** provision a website yet — see [roadmap.md](roadmap.md) layers 3–4.

---

## Automated checks

```bash
npm test
npm run test:e2e -- --workers=1   # includes get-started + spine specs
```
