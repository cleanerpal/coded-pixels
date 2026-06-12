# Wave 7 — Callables + analytics (consent-gated)

**Written by:** Mia Thompson  
**Wave closes when:** INF-003 and ENG-022 are done  
**Milestone:** Signups and waitlist write to Firebase via Cloud Functions; GA4 loads only after cookie Accept  
**Status:** Shipped

---

## In one sentence

After Wave 7, the backend can store signups safely (no direct database writes from the browser), and Google Analytics stays off until you accept cookies.

---

## What you should see

| Feature | Where | What to look for |
|---------|-------|------------------|
| **Callable wiring** | Code / emulator | `submitSignup` and `submitSiteImportWaitlist` exist in `functions/` |
| **GA4 gate** | Any page | Network tab: no `google-analytics` until cookie **Accept** |
| **Analytics helper** | Console (dev) | `trackEvent` no-ops when consent rejected |

The **get-started UI** lands in **Wave 8** — Wave 7 only wires the plumbing.

---

## Emulator smoke test (optional)

```bash
# .env.local
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
DISABLE_APP_CHECK=true

npm run emulators   # terminal 1
npm run dev         # terminal 2
```

---

## Automated checks

```bash
npm test              # includes functions + analytics unit tests
npm run test:rules    # still 15 rules tests
```

---

## What you should **not** expect yet

- Full `/get-started` page flow (Wave 8)
- Site Import waitlist form in configurator (Wave 8)
- Real Stripe payment

---

## Templates note

Signup payloads will **include** `templateId` from the configurator — but Wave 7 does not create template **page content** in Firestore. That is **B1-001** (see [roadmap.md](roadmap.md)).
