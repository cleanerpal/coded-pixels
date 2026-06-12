# Stripe Firebase Extension setup (B6-001)

**Aligned with Dr. Owen Reilly on Q63**

## Install (test mode)

```bash
firebase ext:install stripe/firestore-stripe-payments --project=codedpixels
```

Copy parameter placeholders from `extensions/firestore-stripe-payments.env`. Set secrets in Firebase Console only:

- `STRIPE_API_KEY` — test restricted key
- `STRIPE_WEBHOOK_SECRET` — from Extension install wizard

## Collection paths

| Parameter | Value |
|-----------|-------|
| `CUSTOMERS_COLLECTION` | `customers` |
| `PRODUCTS_COLLECTION` | `products` |

Checkout sessions: `customers/{uid}/checkout_sessions/{id}` (Extension default).

## Custom Functions (this repo)

| Export | Role |
|--------|------|
| `createCheckoutSession` | Callable — signup + Extension checkout doc |
| `onStripeCheckoutSessionUpdated` | Firestore trigger → `provisionTenant()` |

## Marketing feature flag

Set `NEXT_PUBLIC_CHECKOUT_MODE=stripe` when Extension + test Prices are provisioned.
