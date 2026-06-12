# Wave 16 — Stripe checkout + onboarding (B6-001, B6-002)

**Written by:** Mia Thompson  
**Wave closes when:** B6-001 and B6-002 are done  
**Milestone:** Real Stripe checkout replaces simulation-only signup; post-pay onboarding wizard with provisioning job polling  
**Status:** Shipped  
**Browser change:** **Marketing** `/get-started` (Stripe mode) + **builder** `/onboarding`

---

## In one sentence

Wave 16 turns “email-only preview signup” into **real Stripe checkout** (when configured), then walks new customers through onboarding while a background job provisions their tenant and clones their chosen template into a first draft site.

---

## Before you start

Default (simulation still works without Stripe):

```bash
npm install
npm run dev              # marketing → http://localhost:3000
npm run dev:builder      # http://localhost:3001
```

Stripe test mode (hides simulation banner):

```bash
# In .env.local for apps/marketing
NEXT_PUBLIC_CHECKOUT_MODE=stripe
```

Full local flow needs emulators + Stripe Extension config — see [stripe-extension-setup.md](../stripe-extension-setup.md).

Terminal checks:

```bash
npm test
```

---

## What shipped

| Ticket | What landed |
|--------|-------------|
| **B6-001** | Stripe Firebase Extension wiring; `createCheckoutSession` Callable; `onStripeCheckoutSessionUpdated` trigger → `provisionTenant()`; `provisioningJobs/{jobId}` status docs |
| **B6-002** | Builder `/onboarding` wizard; polling `provisioningJobs` until complete; template clone into customer’s first site |

**Checkout mode:** Without `NEXT_PUBLIC_CHECKOUT_MODE=stripe`, `/get-started` keeps the Wave 8 simulation banner. With Stripe mode, copy switches to secure checkout messaging.

---

## What you should see in the browser

### Marketing `/get-started`

| Mode | What to look for |
|------|------------------|
| **Default (simulated)** | “No payment taken” / sign-up preview banner — same as Wave 8 |
| **`NEXT_PUBLIC_CHECKOUT_MODE=stripe`** | Simulation banner **hidden**; Stripe checkout copy; submit redirects to Stripe test checkout (needs Extension + emulators) |

### Builder `/onboarding`

| Step | What to look for |
|------|------------------|
| **Provisioning wait** | Spinner / status while `provisioningJobs/{jobId}` is pending |
| **Wizard steps** | Business name, site slug, template confirmation (after job completes) |
| **Completion** | Link to dashboard or editor — “your site is ready” messaging |

Mock provisioning for local UI dev:

```bash
NEXT_PUBLIC_USE_MOCK_PROVISIONING=true npm run dev:builder
```

Then open `/onboarding` without a `?job=` param.

---

## Dev commands to verify

```bash
npm test
# Stripe + provisioning unit tests
npm test -- --filter=@codedpixels/functions 2>/dev/null || npm test
```

Key files:

```bash
test -f functions/src/lib/provisionTenant.ts
test -f functions/src/lib/provisioningJobs.ts
test -f apps/builder/components/onboarding/OnboardingWizard.tsx
test -f docs/planning/stripe-extension-setup.md
```

---

## Manual checklist

- [ ] `/get-started` still works in default mode — simulation banner visible
- [ ] With `NEXT_PUBLIC_CHECKOUT_MODE=stripe`, simulation banner hidden
- [ ] `createCheckoutSession` Callable exists in Functions exports
- [ ] `/onboarding` loads without crash; shows provisioning status or wizard
- [ ] `NEXT_PUBLIC_USE_MOCK_PROVISIONING=true` completes onboarding UI locally
- [ ] `npm test` green — includes `provisionTenant` and checkout handler tests
- [ ] After successful provision (emulator): tenant docs in Firestore under `companies/` / `sites/`

---

## What’s next

**Wave 17 (B7 + B8):** File uploads in builder, leads inbox, products dashboard, Stripe customer portal. See [wave-17.md](wave-17.md).

---

## Expert alignment

Aligned with **Dr. Owen Reilly** (Stripe Extension B6-001), **Dr. Kai Nakamura** (`provisionTenant` + provisioningJobs), **Mr. Theo Laurent** (onboarding wizard), **Dr. Maya Patel** (wave mapping).
