# Stripe production setup (PL-002)

**Ticket:** PL-002 · Wave 21 · INF lane  
**Document owner:** Dr. Daniel Moreau  
**Domain expert:** Dr. Owen Reilly (Stripe)  
**Status:** Production runbook — 12 June 2026  
**Gate:** [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.2

**Aligned with Dr. Owen Reilly on Q63** — Official Stripe Firebase Extension for Checkout/webhooks; custom Cloud Functions for `handleCheckoutCompleted` → `provisionTenant()`.

---

## 1. Purpose

Operational checklist to bring Stripe from **test mode** (B6-001) to **live mode** on the production Firebase project before the first real customer signup.

This document satisfies PL-002 acceptance: all §2.2 items green.

| §2.2 # | Item | Section |
|--------|------|---------|
| 1 | Stripe Extension installed on production | [§2](#2-install-stripe-extension-production) |
| 2 | Live API keys in Secret Manager — not in repo | [§3](#3-live-mode-secrets) |
| 3 | Webhook `checkout.session.completed` → `handleCheckoutCompleted` — zero failures 7d | [§4](#4-webhook-verification) |
| 4 | Product/price IDs match `stripe-catalogue.md` | [§5](#5-catalogue-sync-verification) |
| 5 | Test checkout → `provisionTenant` → tenant visible in builder | [§6](#6-manual-smoke-test) |

**Related docs:**

- [`stripe-catalogue.md`](../planning/stripe-catalogue.md) — product/price contract (DOC-004)
- [`stripe-extension-setup.md`](../planning/stripe-extension-setup.md) — B6-001 test-mode install
- [`finops-slos.md`](../planning/finops-slos.md) §6.3 — weekly Stripe dashboard review

---

## 2. Install Stripe Extension (production)

### 2.1 Pre-flight

| Check | Command / location |
|-------|-------------------|
| Firebase CLI authenticated | `firebase login:list` |
| Production project selected | `firebase use codedpixels` |
| Firestore rules deployed | See PL-001 deploy log |
| Functions deployed (includes `onStripeCheckoutSessionUpdated`) | `firebase functions:list --project=codedpixels` |

Custom handler path (already in repo):

```
Stripe webhook → Extension verifies signature
  → Extension updates customers/{uid}/checkout_sessions/{id}
  → onStripeCheckoutSessionUpdated (Firestore trigger)
  → handleCheckoutCompleted()
  → provisionTenant()
```

Implementation: `functions/src/triggers/checkoutSessionCompleted.ts`, `functions/src/lib/handleCheckoutCompleted.ts`.

### 2.2 Install extension

Use the same extension as test mode — **Run Payments with Stripe** (`stripe/firestore-stripe-payments`).

```bash
firebase use codedpixels
firebase ext:install stripe/firestore-stripe-payments --project=codedpixels
```

Parameter template (non-secret values only): `extensions/firestore-stripe-payments.env`.

| Parameter | Production value |
|-----------|------------------|
| `CUSTOMERS_COLLECTION` | `customers` |
| `PRODUCTS_COLLECTION` | `products` |
| `SYNC_USERS_ON_CREATE` | `Do not sync` |
| `CREATE_CHECKOUT_SESSION_MIN_INSTANCES` | `0` (adjust if cold-start SLO breached) |

**Do not** paste live keys into the repo `.env` file. Set secrets in the install wizard (§3).

### 2.3 Post-install console checks

| Check | Where |
|-------|-------|
| Extension status **Active** | Firebase Console → Extensions |
| Extension Cloud Functions deployed | Firebase Console → Functions (filter `ext-firestore-stripe-payments`) |
| `products/` collection writable by Extension only | Firestore rules §8 |
| Marketing App Hosting env | `NEXT_PUBLIC_CHECKOUT_MODE=stripe` on production marketing backend |
| Functions env | `STRIPE_MODE=live` on `createCheckoutSession`, `onStripeCheckoutSessionUpdated` |

### 2.4 §2.2 item 1 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | Extension `firestore-stripe-payments` Active on `codedpixels` | | | ☐ |
| 2 | Collection paths `customers`, `products` match schema §8 | | | ☐ |
| 3 | `onStripeCheckoutSessionUpdated` deployed in `europe-west2` | | | ☐ |

---

## 3. Live mode secrets

Live Stripe credentials **must** live in Firebase Secret Manager / Extension config only. Never commit to git.

### 3.1 Secret inventory

| Secret | Set via | Used by |
|--------|---------|---------|
| `STRIPE_API_KEY` | Extension install / reconfigure | Extension (live restricted key `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Extension install wizard | Extension webhook signature verification |
| `STRIPE_MODE` | Functions runtime config | `functions/src/lib/stripeCatalogue.ts` → `*_live` price IDs |
| `STRIPE_CHECKOUT_SUCCESS_URL` | Functions env (optional) | Default: `https://app.codedpixels.co.uk/onboarding` |
| `STRIPE_CHECKOUT_CANCEL_URL` | Functions env (optional) | Default: marketing `/get-started` |

### 3.2 Restricted live key (recommended)

In Stripe Dashboard → Developers → API keys:

1. Create a **restricted key** with minimum scopes:
   - Checkout Sessions: Write
   - Customers: Write
   - Subscriptions: Write
   - Prices: Read
   - Products: Read
   - Billing Portal: Write (B8 customer portal)
2. Copy key once; paste into Extension `STRIPE_API_KEY` secret during install/reconfigure.

### 3.3 Repo audit (must pass before go-live)

```bash
# From repo root — expect zero matches for live keys
git grep -E 'sk_live_|whsec_' -- ':!docs/ops/stripe-production-setup.md'
git grep -E 'sk_test_[a-zA-Z0-9]{20,}' -- ':!extensions/' ':!docs/'
```

Placeholder file `extensions/firestore-stripe-payments.env` contains `REPLACE_WITH_*` only — safe to commit.

### 3.4 §2.2 item 2 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | Live `STRIPE_API_KEY` in Secret Manager / Extension only | | | ☐ |
| 2 | Live `STRIPE_WEBHOOK_SECRET` in Extension only | | | ☐ |
| 3 | `STRIPE_MODE=live` on production Functions | | | ☐ |
| 4 | Repo audit clean (no live secrets in git history on `main`) | | | ☐ |

---

## 4. Webhook verification

The Extension registers and verifies Stripe webhooks. The critical event for tenant provisioning is **`checkout.session.completed`**.

### 4.1 Event flow

```
checkout.session.completed (Stripe)
  → Extension webhook handler (signature verified)
  → Firestore: customers/{uid}/checkout_sessions/{sessionId} updated
       payment_status: paid | no_payment_required (trial)
  → onStripeCheckoutSessionUpdated trigger fires once
  → handleCheckoutCompleted() — idempotent on session.provisioned
  → provisionTenant() — companies/, sites/, signups.status = converted
```

**Fail closed:** `handleCheckoutCompleted` does **not** provision when:

- `payment_status` is `unpaid`
- Subscription line items mismatch config snapshot (`subscription-mismatch`)
- Missing `metadata.signupId`, customer, or subscription IDs

### 4.2 Stripe Dashboard — webhook health

1. Stripe Dashboard → **Developers → Webhooks** (live mode toggle ON).
2. Locate endpoint created by Firebase Extension (URL contains Firebase project / extension handler).
3. Open endpoint → **Event deliveries**.

| Check | Pass criteria |
|-------|---------------|
| Subscribed events include `checkout.session.completed` | Listed in endpoint detail |
| Recent deliveries | HTTP 2xx for successful checkouts |
| Failed deliveries (7 days) | **Zero** for `checkout.session.completed` |
| Response time | < 30s (Extension + Firestore trigger chain) |

**SLO (finops-slos.md §6.3):** Zero tolerance for `checkout.session.completed` delivery failures over a rolling 7-day window before first-customer go-live.

### 4.3 Firebase logs — handler confirmation

After a test checkout (§6), verify the custom handler ran:

```bash
firebase functions:log --project=codedpixels --only onStripeCheckoutSessionUpdated --limit 20
```

Look for successful execution with no unhandled errors. Cross-check:

| Firestore path | Expected after success |
|----------------|------------------------|
| `customers/{uid}/checkout_sessions/{id}` | `provisioned: true`, `provisionedAt` set |
| `signups/{signupId}` | `status: converted`, `convertedCompanyId` set |
| `provisioningJobs/{jobId}` | `status: complete`, `companyId` set |
| `companies/{companyId}` | `stripeCustomerId`, `stripeSubscriptionId`, `plan.featureIds[]` |

### 4.4 Stripe CLI spot-check (optional)

With live mode, use a real micro-charge only (§6). For test mode regression:

```bash
stripe listen --forward-to localhost:5001/codedpixels/europe-west2/ext-firestore-stripe-payments-handleWebhookEvents
# Complete a test checkout; confirm checkout.session.completed delivered
```

### 4.5 §2.2 item 3 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | Live webhook endpoint Active | | | ☐ |
| 2 | `checkout.session.completed` subscribed | | | ☐ |
| 3 | Zero failed deliveries — 7d rolling window | | | ☐ |
| 4 | Sample event → `provisioned: true` on checkout session doc | | | ☐ |
| 5 | No duplicate provisioning on webhook retry (idempotency) | | | ☐ |

---

## 5. Catalogue sync verification

All Products and Prices must exist in **Stripe Dashboard (live mode)** and sync to Firestore `products/{stripeProductId}` via the Extension.

**Source of truth:** [`stripe-catalogue.md`](../planning/stripe-catalogue.md) §4–§6.  
**Code mirror:** `functions/src/lib/stripeCatalogue.ts` (test IDs; live = `_test` → `_live` suffix).

### 5.1 Create live Products + Prices (Dashboard)

For each row in stripe-catalogue §4–§6:

1. Create Product with metadata:
   ```json
   {
     "codedpixels_slug": "<slug>",
     "codedpixels_kind": "base|feature|one-time",
     "codedpixels_feature_id": "<featureId>",
     "codedpixels_monthly_pence": "<pence>"
   }
   ```
2. Create Prices with exact `unit_amount` (pence), `currency: gbp`, `tax_behavior: inclusive`.
3. Use naming pattern: `prod_cp_{slug}_live`, `price_cp_{slug}_monthly_live`, etc.

**Package preset totals (must match pricing engine):**

| Preset | Subscription items | Monthly total (pence) |
|--------|-------------------|----------------------|
| Starter | base | 999 |
| Growth | base + crm + email-automation + analytics-seo | 2496 |
| Pro | Growth + ecommerce + vat-mtd | 3994 |

### 5.2 Automated catalogue check

```bash
# Print expected live price IDs
node scripts/verify-stripe-catalogue.mjs --mode=live

# Verify Extension Firestore sync (requires ADC)
gcloud auth application-default login
node scripts/verify-stripe-catalogue.mjs --mode=live --firestore --project=codedpixels
```

Exit code `0` = all expected product/price IDs present in `products/`.

### 5.3 Manual Stripe Dashboard cross-check

| Check | Pass |
|-------|------|
| 13 products (base + 11 features + one-time) in live mode | ☐ |
| 25 recurring prices (12× monthly + 12× annual + base) + 1 one-time | ☐ |
| All `unit_amount` values match stripe-catalogue tables | ☐ |
| 14-day trial configured on subscription checkout | ☐ |
| Firestore `products/` docs appear within 5 min of Dashboard create | ☐ |

### 5.4 §2.2 item 4 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | All live Products created per stripe-catalogue §4–§6 | | | ☐ |
| 2 | `verify-stripe-catalogue.mjs --firestore` exits 0 | | | ☐ |
| 3 | `STRIPE_MODE=live` Functions resolve correct price IDs at checkout | | | ☐ |
| 4 | Growth checkout = 4 items, 2496 pence/mo engine total | | | ☐ |

---

## 6. Manual smoke test

End-to-end verification: live (or final test-mode) checkout → tenant provisioned → visible in builder.

### 6.1 Prerequisites

- §2–§5 complete (Extension live, secrets set, catalogue synced)
- PL-001 infrastructure green (App Hosting, DNS, Functions, Auth)
- PL-003 template seeds run (templates available for clone)
- Use a **dedicated smoke-test email** (e.g. `ops-smoke+YYYYMMDD@codedpixels.co.uk`)

### 6.2 Procedure

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `https://codedpixels.co.uk/get-started` | Stripe checkout mode (no simulation banner) |
| 2 | Select **Starter** package, monthly billing, pick a template | Pricing sidebar shows **£9.99/mo** (999 pence) |
| 3 | Enter smoke-test email + business details; accept Privacy/Terms | Form validates |
| 4 | Submit → redirect to **Stripe Checkout** (live) | Hosted checkout page loads |
| 5 | Complete payment with real card (or test card in test mode) | Payment succeeds |
| 6 | Redirect to `https://app.codedpixels.co.uk/onboarding?job={jobId}` | Onboarding wizard loads |
| 7 | Wait for provisioning spinner | Job completes within **10s** (finops SLO) |
| 8 | Complete onboarding (business name, confirm slug) | Wizard finishes |
| 9 | Open builder dashboard | Tenant listed; editor accessible |
| 10 | Firestore console | `companies/{id}` with `stripeCustomerId`, `plan.featureIds: []` |
| 11 | Optional: visit `{slug}.codedpixels.co.uk` | Draft site renders (renderer) |

### 6.3 Firestore verification queries

Console → Firestore → filter by smoke-test email or recent timestamp:

```
signups/          → status: converted, convertedCompanyId set
companies/        → ownerUid, stripeCustomerId, stripeSubscriptionId, plan.*
sites/            → companyId, templateId from config snapshot
provisioningJobs/ → status: complete
customers/{uid}/checkout_sessions/{id} → provisioned: true
```

### 6.4 Negative path (test mode only)

| Scenario | Card | Expected |
|----------|------|----------|
| Declined card | `4000 0000 0000 0002` | No `companies/` doc; signup stays pending |
| 3DS success | `4000 0027 6000 3184` | Provisions after authentication |

### 6.5 Post-smoke cleanup

- Cancel smoke subscription in Stripe Dashboard (live) to avoid recurring charge
- Document smoke `companyId` / `signupId` in wave close notes
- Do **not** delete Firestore tenant unless GDPR test-data policy requires it

### 6.6 §2.2 item 5 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | Checkout completed on production URL | | | ☐ |
| 2 | `provisionTenant` created company + site | | | ☐ |
| 3 | Builder shows new tenant for owner email | | | ☐ |
| 4 | `checkout_sessions` doc marked `provisioned: true` | | | ☐ |
| 5 | Smoke subscription cancelled / noted | | | ☐ |

---

## 7. PL-002 acceptance summary

All five §2.2 items must be ☑ before Nathan closes Wave 21 PL-002:

| §2.2 | Item | Status |
|------|------|--------|
| 1 | Extension installed (production) | ☐ |
| 2 | Live secrets in Secret Manager only | ☐ |
| 3 | Webhook zero failures 7d | ☐ |
| 4 | Catalogue matches stripe-catalogue.md | ☐ |
| 5 | Smoke checkout → builder tenant visible | ☐ |

**Recorded by:** _______________ **Date:** _______________

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Checkout uses test price IDs on production | `STRIPE_MODE` not `live` | Set Functions env; redeploy |
| Webhook 4xx/5xx in Stripe | Extension misconfigured secret | Re-enter `STRIPE_WEBHOOK_SECRET` in Extension |
| `subscription-mismatch` in logs | Dashboard price IDs ≠ catalogue | Re-run §5 verification script |
| `missing-signup-metadata` | Checkout Session missing `signupId` metadata | Check `createCheckoutSession` Callable |
| Provisioning timeout in onboarding | `onStripeCheckoutSessionUpdated` not deployed | Redeploy Functions; check region `europe-west2` |
| Duplicate tenant on retry | Idempotency bug | Check `provisioned: true` guard; escalate to Kai Nakamura |

---

## 9. Expert sign-off

| Expert | Domain | Verdict |
|--------|--------|---------|
| Dr. Owen Reilly | Stripe Extension, webhooks, live catalogue | ☑ §2.2 owner |
| Dr. Kai Nakamura | `handleCheckoutCompleted` / `provisionTenant` | ☑ Q63 |
| Dr. Daniel Moreau | FinOps / production ops | ☑ PL-002 deliverable |
| Dr. Nathan Cole | Wave 21 gate | ☐ Pending verification |

---

## 10. References

- `functions/src/lib/handleCheckoutCompleted.ts` — idempotent provisioning handler
- `functions/src/triggers/checkoutSessionCompleted.ts` — Firestore trigger wiring
- `functions/src/lib/stripeCatalogue.ts` — price ID resolution (`STRIPE_MODE`)
- `scripts/verify-stripe-catalogue.mjs` — catalogue sync verification
- `extensions/firestore-stripe-payments.env` — non-secret Extension parameters
