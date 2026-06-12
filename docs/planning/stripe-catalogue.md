# Stripe Product & Price Catalogue

**Ticket:** DOC-004 · Platform Phase 2 prep (P2-W1)  
**Document owner:** Dr. Lena Moreau  
**Domain experts:** Dr. Owen Reilly (Stripe) · Dr. Marcus Klein (pricing)  
**Status:** Approved for B6 implementation  
**Last updated:** 12 June 2026  
**Blocks:** B6-001 (Stripe Extension + provisioningJobs)  
**Related:** [`../specs/codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md) Q38, Q63 · [`../specs/firestore-schema.md`](../specs/firestore-schema.md) §6, §8 · `lib/features.ts`, `lib/packages.ts`, `lib/pricing.ts`

**Aligned with Dr. Owen Reilly on Q63** — Official Stripe Firebase Extension for Checkout/webhooks/Customer docs; custom Cloud Functions for `provisionTenant`, company mapping, feature ↔ subscription item sync, and £149 one-time handling.

---

## 1. Purpose

This document is the **implementation contract** for Platform Phase 2 billing:

- Stripe Product and Price IDs (placeholder pattern until Dashboard provisioning)
- Mapping from configurator `featureIds[]` and `billingCycle` to Stripe subscription items
- One-time £149 custom template line item strategy
- Package presets (Growth/Pro) vs à la carte checkout — same underlying prices
- Firebase Stripe Extension collection paths
- Webhook → `provisionTenant()` flow summary
- Test mode vs live mode checklist

**Source of truth for pence values:** `lib/features.ts`, `lib/pricing.ts`. Stripe `unit_amount` values must match these integers exactly.

---

## 2. Architecture summary (Q63)

| Layer | Owner | Responsibility |
|-------|-------|----------------|
| **Stripe Firebase Extension** | Extension | Checkout Session creation, webhook signature verification, `customers/`, `products/`, `checkout_sessions/`, `subscriptions/` mirrors |
| **Custom Cloud Functions** | B6-001 | `checkout.session.completed` handler → `provisionTenant()`, `companies/{companyId}` Stripe field mapping, `plan.featureIds[]` ↔ subscription items sync, one-time £149, dunning emails (SendGrid) |
| **Marketing `/get-started`** | ENG-020+ | Builds Checkout Session doc from config snapshot; no direct Stripe API calls from browser |
| **Configurator pricing engine** | ENG-004 | Authoritative pence arithmetic; Stripe prices must mirror engine output |

```
Marketing /get-started
  → Stripe Extension: create Checkout Session (subscription + optional one-time line)
  → User pays / starts trial
  → Extension webhook → custom Function: checkout.session.completed
  → provisionTenant() + map stripeCustomerId → companies/{companyId}
  → Redirect app.codedpixels.co.uk/onboarding
```

---

## 3. ID placeholder pattern

Until B6-001 provisions real Stripe Dashboard objects, use this naming convention in code comments, env vars, and Extension product sync metadata:

| Placeholder | Pattern | Example (test) |
|-------------|---------|----------------|
| Product ID | `prod_cp_{slug}_{mode}` | `prod_cp_base_test` |
| Monthly price ID | `price_cp_{slug}_monthly_{mode}` | `price_cp_crm_monthly_test` |
| Annual price ID | `price_cp_{slug}_annual_{mode}` | `price_cp_crm_annual_test` |
| One-time price ID | `price_cp_{slug}_onetime_{mode}` | `price_cp_custom_template_onetime_test` |

Where:

- `{slug}` = kebab-case catalogue key (see §4 table)
- `{mode}` = `test` \| `live` (never share IDs across modes)

**Metadata on every Product/Price (required):**

```json
{
  "codedpixels_slug": "crm",
  "codedpixels_kind": "base|feature|one-time",
  "codedpixels_feature_id": "crm",
  "codedpixels_monthly_pence": "499"
}
```

Omit `codedpixels_feature_id` on base and one-time products. Custom Functions use metadata to reconcile subscription items ↔ `plan.featureIds[]`.

---

## 4. Catalogue — base plan

| Catalogue slug | Stripe Product (placeholder) | Feature ID | Monthly pence | Monthly price ID (test) | Annual pence¹ | Annual price ID (test) |
|----------------|------------------------------|------------|---------------|-------------------------|---------------|------------------------|
| `base` | `prod_cp_base_test` | *(base — not in featureIds)* | **999** (£9.99) | `price_cp_base_monthly_test` | **9950** | `price_cp_base_annual_test` |

¹ Annual pence per line: `Math.round(monthlyPence × 12 × 83 / 100)` — same formula as `annualTotalPence()` in `lib/pricing.ts`, applied **per item** when using multi-item subscriptions.

**Subscription rule:** Every checkout includes exactly one base-plan subscription item, even for Starter (no add-ons).

---

## 5. Catalogue — add-on features (subscription items)

Each add-on is a **separate Stripe Product** with monthly and annual **recurring** Prices. At checkout, selected features become **subscription items** on a single Subscription (not separate subscriptions).

| Feature ID | Catalogue slug | Product (test) | Monthly pence | Monthly price ID (test) | Annual pence¹ | Annual price ID (test) |
|------------|----------------|----------------|---------------|-------------------------|---------------|------------------------|
| `crm` | `crm` | `prod_cp_crm_test` | 499 | `price_cp_crm_monthly_test` | 4970 | `price_cp_crm_annual_test` |
| `email-automation` | `email-automation` | `prod_cp_email_automation_test` | 599 | `price_cp_email_automation_monthly_test` | 5966 | `price_cp_email_automation_annual_test` |
| `analytics-seo` | `analytics-seo` | `prod_cp_analytics_seo_test` | 399 | `price_cp_analytics_seo_monthly_test` | 3974 | `price_cp_analytics_seo_annual_test` |
| `sms` | `sms` | `prod_cp_sms_test` | 299 | `price_cp_sms_monthly_test` | 2978 | `price_cp_sms_annual_test` |
| `ecommerce` | `ecommerce` | `prod_cp_ecommerce_test` | 999 | `price_cp_ecommerce_monthly_test` | 9950 | `price_cp_ecommerce_annual_test` |
| `vat-mtd` | `vat-mtd` | `prod_cp_vat_mtd_test` | 499 | `price_cp_vat_mtd_monthly_test` | 4970 | `price_cp_vat_mtd_annual_test` |
| `booking` | `booking` | `prod_cp_booking_test` | 699 | `price_cp_booking_monthly_test` | 6962 | `price_cp_booking_annual_test` |
| `ai-content` | `ai-content` | `prod_cp_ai_content_test` | 399 | `price_cp_ai_content_monthly_test` | 3974 | `price_cp_ai_content_annual_test` |
| `custom-template` | `custom-template-recurring` | `prod_cp_custom_template_recurring_test` | 1499 | `price_cp_custom_template_recurring_monthly_test` | 14930 | `price_cp_custom_template_recurring_annual_test` |
| `white-label` | `white-label` | `prod_cp_white_label_test` | 999 | `price_cp_white_label_monthly_test` | 9950 | `price_cp_white_label_annual_test` |
| `priority-support` | `priority-support` | `prod_cp_priority_support_test` | 499 | `price_cp_priority_support_monthly_test` | 4970 | `price_cp_priority_support_annual_test` |

**Stripe Price object settings (all recurring prices):**

| Field | Monthly | Annual |
|-------|---------|--------|
| `currency` | `gbp` | `gbp` |
| `recurring.interval` | `month` | `year` |
| `recurring.interval_count` | `1` | `1` |
| `unit_amount` | monthly pence from table | annual pence from table |
| `tax_behavior` | `inclusive` | `inclusive` |

**Annual discount:** 17% off monthly equivalent (Q6). Engine formula: `annualMonthlyEquivalent = Math.round(monthlyTotal × 83 / 100)`; `annualTotal = Math.round(monthlyTotal × 12 × 83 / 100)`. Stripe annual Prices implement this **per line item**, not via a global coupon — totals must match `lib/pricing.ts` for any config snapshot.

---

## 6. One-time £149 custom template (Q13)

| Catalogue slug | Product (test) | Kind | Pence | Price ID (test) | Billing |
|----------------|----------------|------|-------|-----------------|---------|
| `custom-template-onetime` | `prod_cp_custom_template_onetime_test` | one-time | **14900** (£149) | `price_cp_custom_template_onetime_test` | Single charge at signup |

**Configurator behaviour (Q13):**

- Default: `custom-template` add-on bills **recurring** (+1499 pence/mo) — include `price_cp_custom_template_recurring_*` subscription item.
- Toggle “Pay once instead”: `customTemplateBilling === 'one-time'` — **exclude** recurring custom-template subscription item; add one-time line instead.

**Checkout Session strategy (Q38, Q63):**

| Approach | Verdict | Notes |
|----------|---------|-------|
| Checkout `line_items` with `mode: payment` one-time Price alongside subscription | **Preferred** | Single Checkout Session; Extension supports subscription + one-time line items |
| `invoiceitem` added post-subscription | Fallback | Use only if Extension session builder cannot mix modes — custom Function adds `invoiceItems.create` before first invoice |

**Rules:**

- One-time fee is **not** included in `monthlyTotalPence()` or `annualTotalPence()` (`lib/pricing.ts`).
- Annual billing toggle does **not** affect the £149 amount.
- `getOneTimeLineItems()` id: `custom-template-one-time` — map to `price_cp_custom_template_onetime_*` at checkout build time.
- Do **not** create a subscription item for `custom-template` when `customTemplateBilling === 'one-time'`.

---

## 7. Package presets vs à la carte (Growth/Pro sync)

**Decision:** Stripe has **no separate Growth or Pro products**. Package cards are marketing presets only (`lib/packages.ts`). Checkout always expands presets to the same à la carte Price IDs.

| Package ID | Preset `featureIds` | Live monthly total (pence) | Card display (pence) | Stripe items at checkout |
|------------|---------------------|------------------------------|----------------------|--------------------------|
| `starter` | `[]` | 999 | 999 | base only |
| `growth` | `crm`, `email-automation`, `analytics-seo` | **2496** | 2499 (Q1, Q54) | base + 3 feature prices |
| `pro` | Growth + `ecommerce`, `vat-mtd` | **3994** | 3999 (Q54) | base + 5 feature prices |
| `custom` | user-selected | calculated | null | base + selected feature prices |

**Critical rule for B6:** Charge **live engine totals** (2496, 3994, etc.), not card display rounding (2499, 3999). The configurator summary and Stripe Checkout must show the same pence the engine computes.

**Post-preset edits (Q10):** User may toggle features off after selecting Growth/Pro. Checkout uses final `featureIds[]`, not package name. Store `packageId` on `companies.plan` for analytics only.

**Growth/Pro sync checklist:**

- [ ] Growth checkout = base + crm + email-automation + analytics-seo (4 subscription items)
- [ ] Pro checkout = Growth items + ecommerce + vat-mtd (6 subscription items)
- [ ] `plan.featureIds[]` on `companies/{companyId}` matches active subscription item metadata after webhook
- [ ] Phase 2.1 plan changes: dashboard mutates `featureIds[]` → Stripe Subscription Items API add/remove (Q46)

---

## 8. Trial and billing cycle

| Setting | Value | Notes |
|---------|-------|-------|
| Free trial | **14 days** (Phase 2 launch) | Card required; configurable in Stripe Dashboard / Checkout Session |
| Trial scope | Whole subscription | Applies to recurring items; one-time £149 typically charged at signup (confirm with Owen Reilly in B6 if trial should defer one-time) |
| `billingCycle: 'monthly'` | Monthly Price IDs | All subscription items use `*_monthly_*` prices |
| `billingCycle: 'annual'` | Annual Price IDs | All subscription items use `*_annual_*` prices — mixed intervals on one subscription are **not** supported |

**Failed payment (Q38):** No `provisionTenant()` until `checkout.session.completed` with `payment_status` paid (or trialing with valid setup). `invoice.payment_failed` → dunning email; do not provision new tenants.

---

## 9. Firebase Stripe Extension — collection paths

From [`firestore-schema.md`](../specs/firestore-schema.md) §8. Extension **writes**; app and custom Functions **read** (Checkout Session create is client-triggered via Extension callable/doc pattern per extension docs).

| Collection path | Purpose | Writer |
|-----------------|---------|--------|
| `customers/{uid}` | Stripe Customer ID mirror; `{uid}` = Firebase Auth UID | Extension |
| `products/{stripeProductId}` | Product + Price catalogue sync from Stripe | Extension |
| `checkout_sessions/{sessionId}` | Checkout Session status + `url` for redirect | Extension (+ client create doc) |
| `subscriptions/{subscriptionId}` | Active subscription state mirror | Extension |

**Company linkage fields** (`companies/{companyId}` — custom Function writes after webhook):

| Field | Source |
|-------|--------|
| `stripeCustomerId` | `customers/{uid}` or Checkout Session |
| `stripeSubscriptionId` | `subscriptions/{id}` or Checkout Session |
| `plan.featureIds` | Config snapshot + subscription item metadata reconciliation |
| `plan.billingCycle` | Config snapshot |
| `plan.monthlyTotalPence` | `monthlyTotalPence()` at checkout time |
| `plan.annualTotalPence` | `annualTotalPence()` when annual |
| `plan.customTemplateBilling` | Config snapshot |
| `plan.packageId` | Config snapshot (optional) |
| `status` | Synced from Stripe subscription status webhooks |

---

## 10. Webhook → `provisionTenant()` flow

**Trigger:** Custom Cloud Function on `checkout.session.completed` (Extension verifies signature; app listens to Extension-emitted events or Stripe webhook per B6-001 implementation choice).

```
1. User completes /get-started form
      → configSnapshot stored on signups/{id}
      → Client creates checkout_sessions/{id} doc (Extension pattern)
      → Redirect to Stripe Checkout URL

2. checkout.session.completed (payment_status: paid | no_payment_required for trial)
      → Extension updates checkout_sessions/{id}, subscriptions/{id}, customers/{uid}

3. Custom Function (idempotent — key on session.id or signup id):
      a. Load signups/{id} + configSnapshot
      b. Assert payment succeeded / trialing allowed
      c. Resolve stripeCustomerId, stripeSubscriptionId
      d. Map subscription items → featureIds[] via price metadata
      e. Call provisionTenant() — firestore-schema.md §13:
            - slugs/{slug}, companies/{companyId}, members, sites, pages, users
            - plan object from snapshot + Stripe IDs
            - signups.status = converted
            - Auth custom claims
      f. Write stripeCustomerId + stripeSubscriptionId on companies/{companyId}

4. Redirect customer to app.codedpixels.co.uk/onboarding (success_url)

5. Async: SendGrid “Plan confirmed” email (Q41)
```

**Do not provision when:**

- `payment_status` is `unpaid`
- Subscription items do not match snapshot feature set (fail closed → support alert)
- Slug collision (transaction abort per schema §13)

**Ongoing sync (post-provision):**

| Stripe event | Custom Function action |
|--------------|------------------------|
| `customer.subscription.updated` | Update `plan.featureIds[]`, `companies.status` |
| `customer.subscription.deleted` | Set status cancelled; retain data per retention policy |
| `invoice.payment_failed` | Dunning email; optional grace period (B6 config) |

---

## 11. Checkout Session build reference

Pseudocode for B6-001 — aligns with Extension doc-create pattern:

```typescript
// Recurring line items from configSnapshot
const priceIds = [
  priceId('base', billingCycle),
  ...configSnapshot.featureIds
    .filter(id => !(id === 'custom-template' && configSnapshot.customTemplateBilling === 'one-time'))
    .map(id => priceId(id, billingCycle)),
];

// Optional one-time
const oneTimeLineItems =
  configSnapshot.customTemplateBilling === 'one-time'
    ? [{ price: priceId('custom-template-onetime', 'onetime'), quantity: 1 }]
    : [];

// mode: 'subscription', trial_period_days: 14, metadata: { signupId, packageId, ... }
```

Validate session total against `monthlyTotalPence()` / `annualTotalPence()` + `oneTimeFeesPence()` before redirect.

---

## 12. Test mode vs live mode checklist

Complete before B6-001 merge and again before production cutover.

### 12.1 Stripe Dashboard

| Step | Test mode | Live mode |
|------|-----------|-----------|
| Create all Products + Prices per §4–§6 | ☐ | ☐ |
| Replace placeholder IDs in Firebase Extension config / env | `*_test` IDs | `*_live` IDs |
| Configure 14-day trial on subscription Prices or Checkout | ☐ | ☐ |
| Enable Customer Portal (Q46) | ☐ | ☐ |
| Register webhook endpoint (Extension-managed) | ☐ | ☐ |
| Verify GBP, tax-inclusive pricing display | ☐ | ☐ |

### 12.2 Firebase / application

| Step | Test mode | Live mode |
|------|-----------|-----------|
| Extension installed with **test** secret key | ☐ | — |
| Extension installed with **live** secret key | — | ☐ |
| `STRIPE_*` / Extension params never committed to git | ☐ | ☐ |
| Firestore rules: Extension collections deny client writes | ☐ | ☐ |
| `checkout.session.completed` → `provisionTenant` idempotency tested | ☐ | ☐ |
| Growth preset → 4 subscription items, total 2496 pence/mo | ☐ | ☐ |
| Pro preset → 6 subscription items, total 3994 pence/mo | ☐ | ☐ |
| Annual Growth → sum of annual line items = 24860 pence/yr | ☐ | ☐ |
| Annual Pro → sum of annual line items = 39780 pence/yr | ☐ | ☐ |
| One-time £149 checkout adds payment line, no recurring custom-template item | ☐ | ☐ |
| Failed card → no company doc created | ☐ | ☐ |
| `companies.stripeCustomerId` populated after success | ☐ | ☐ |

### 12.3 Test cards (test mode only)

| Scenario | Card |
|----------|------|
| Success | `4242 4242 4242 4242` |
| Decline | `4000 0000 0000 0002` |
| 3DS | `4000 0027 6000 3184` |

### 12.4 Go-live gate

- [ ] All test-mode checklist items green
- [ ] Live Products/Prices created and IDs swapped in Extension config
- [ ] Live webhook delivering to production Functions
- [ ] One real micro-charge or team dogfood signup verified end-to-end
- [ ] Customer Portal link tested from app settings (B8)

---

## 13. Environment variables (reference)

| Variable | Scope | Notes |
|----------|-------|-------|
| Extension Stripe secret key | Firebase Extension config | Test vs live — set in Firebase console |
| `STRIPE_WEBHOOK_SECRET` | Extension-managed | Do not duplicate in app unless custom endpoint |
| Price ID map | Functions config / Remote Config | Optional JSON map `{ featureId: { monthly, annual } }` — placeholders in §4–§6 until provisioned |

---

## 14. Phase 2.1 extensions (out of B6 scope)

| Capability | Stripe surface |
|------------|----------------|
| Add/remove features in dashboard | Subscription Items API |
| Customer billing portal | Stripe Customer Portal sessions (Q46) |
| Tenant ecommerce “Buy” buttons | `products.stripePriceId` per site product (schema §7) |
| Usage overages | Metered billing — Phase 3 (Q32) |

---

## 15. Expert sign-off

| Expert | Domain | Status |
|--------|--------|--------|
| Dr. Owen Reilly | Stripe Extension, Checkout, webhooks | ☑ Aligned Q63 |
| Dr. Marcus Klein | Pence catalogue, annual formula, package vs à la carte | ☑ Aligned Q1, Q6, Q13, Q54 |
| Dr. Kai Nakamura | Extension vs custom Function split | ☑ Per Q63 |
| Dr. Rafael Ortiz | `companies` Stripe fields | ☑ Per firestore-schema.md |
| Dr. Lena Moreau | Documentation | ☑ Published DOC-004 |

---

## 16. Verification (B6-001 acceptance)

Before marking B6-001 complete, Nathan verifies:

1. This catalogue’s Price IDs exist in Stripe (test) and Extension `products/` sync
2. Checkout for Starter, Growth, Pro, and Custom (with one-time template) matches `lib/pricing.test.ts` totals
3. Webhook creates `companies/{companyId}` with correct `plan.featureIds[]` and Stripe IDs
4. Test-mode checklist §12 fully checked
