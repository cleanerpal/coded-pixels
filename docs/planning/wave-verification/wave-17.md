# Wave 17 — Storage pipeline + CRM/products (B7-001, B8-001)

**Written by:** Mia Thompson  
**Wave closes when:** B7-001 and B8-001 are done  
**Milestone:** Asset uploads with virus scan + image resize; dashboard leads inbox, products editor, Stripe billing portal  
**Status:** Shipped  
**Browser change:** **Builder** — upload modal + dashboard CRM/products/billing routes

---

## In one sentence

Wave 17 adds file uploads to the builder (with backend scanning and thumbnails), plus dashboard pages for leads, ecommerce products, and Stripe billing — the add-ons you configured in marketing start to have real homes in the product.

---

## Before you start

```bash
npm install
npm run dev:builder      # http://localhost:3001
```

Storage pipeline needs emulators for full upload flow:

```bash
# Terminal 1 — include storage emulator
npm run emulators

# Terminal 2
npm run dev:builder
```

Terminal checks:

```bash
npm test
npm run test:rules       # storage path rules if expanded in B7
```

Add-on scope reference: [add-on-deliverables.md](../add-on-deliverables.md)

---

## What shipped

| Ticket | What landed |
|--------|-------------|
| **B7-001** | Firebase Storage rules; `initiateAssetUpload` Callable (signed URL); ClamAV scan trigger on upload; Resize Images Extension hook; builder asset upload modal stub |
| **B8-001** | `/dashboard/leads` — CRM inbox UI; `/dashboard/products` — product list/editor; `/dashboard/billing` — Stripe customer portal link; aligned with add-on deliverables matrix |

---

## What you should see in the browser

### Builder dashboard (`http://localhost:3001`)

| URL | What to look for |
|-----|------------------|
| `/dashboard/leads` | Leads inbox — list/table UI; empty state if no leads |
| `/dashboard/products` | Products manager — add/edit product rows; draft vs published status |
| `/dashboard/billing` | Billing page with link to Stripe customer portal (test mode when configured) |

### Builder editor (`/sites/demo-site/edit`)

| Feature | What to look for |
|---------|------------------|
| **Asset upload** | Upload modal accessible from builder chrome; file type/size validation messages |
| **After upload** (emulators + Functions) | Pending → clean scan → thumbnail metadata |

### Marketing + site-renderer

Unchanged on ports 3000 and 3002.

---

## Dev commands to verify

```bash
npm test
test -f functions/src/triggers/clamAvAssetScan.ts
test -f apps/builder/components/builder/AssetUploadModal.tsx
test -f apps/builder/app/dashboard/leads/page.tsx
test -f apps/builder/app/dashboard/products/page.tsx
test -f apps/builder/app/dashboard/billing/page.tsx
```

---

## Manual checklist

- [ ] `/dashboard/leads` loads — inbox UI, no console crash
- [ ] `/dashboard/products` loads — can view mock or seeded products
- [ ] `/dashboard/billing` loads — portal link or empty-state copy
- [ ] Asset upload modal opens from builder editor; shows validation for bad file types
- [ ] `npm test` green — upload validation + asset scan handler tests
- [ ] `initiateAssetUpload` Callable exported from Functions
- [ ] Marketing site unchanged; Phase 2 core (B0–B8) complete per [project-status.md](../project-status.md)

---

## What’s next

**Wave 18:** DOC-009 FinOps SLOs or Phase 2 polish (B9 observability). Platform Phase 2 **core** is complete — see [roadmap.md](roadmap.md).

---

## Expert alignment

Aligned with **Dr. Clara Voss** (storage pipeline Q44/Q64), **Dr. Samuel Ruiz** (B8 add-on deliverables), **Dr. Owen Reilly** (Stripe customer portal), **Dr. Maya Patel** (wave mapping).
