# Platform Phase 2 — Shipped (Waves 12–17)

**Written by:** Mia Thompson  
**For:** Andrew — what Platform Phase 2 added and **where to verify it**  
**Status file:** [project-status.md](../project-status.md) · **Full timeline:** [roadmap.md](roadmap.md)

**Platform Phase 2 core (B0–B8) is complete.** This doc is a plain-language recap; use the wave guides for checklists.

---

## The big picture

**Marketing MVP (Waves 1–9)** is the public website: configure a plan, pick a template name, sign up with email (simulated by default — Stripe when configured).

**Platform Phase 2 (Waves 11–17)** added the **product** behind that marketing site:

1. Real **tenant data** in Firestore (your business, your sites) — **Wave 12**
2. A **builder** at `app.codedpixels.co.uk` (local `:3001`) — **Wave 13**
3. **Publish** pipeline — **Wave 14**
4. **Published sites** at `yourname.codedpixels.co.uk` (local `:3002`) — **Wave 15**
5. **Stripe checkout** + post-pay onboarding — **Wave 16**
6. File uploads, CRM inbox, products, billing portal — **Wave 17**

---

## Wave-by-wave — shipped

### Wave 12 — B1 tenant foundation — [wave-12.md](wave-12.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B1-001** | Tenant schema in Firestore; template **seed JSON** → `templates/{id}` | **Nothing new** on marketing site unless you open Firebase console |
| **B1-002** | Expanded security rules + 52 rules tests | **Nothing new** in browser |

**Templates milestone:** Real page layouts (hero, features, etc.) live in seed files and can be seeded to Firestore. Customers could not edit them until Wave 13.

**Verify:** `npm run validate:templates` + `npm run test:rules` green.

---

### Wave 13 — B2 builder shell — [wave-13.md](wave-13.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B2-001** | Builder app shell — dashboard, demo editor | **`http://localhost:3001`** — dashboard + demo site editor |
| **B2-002** | Shared component registry (sections/blocks packages) | Real section types on the builder canvas |

**First time you could open an editor UI** — publish and live sites came in Waves 14–15.

---

### Wave 14 — B3 publish pipeline — [wave-14.md](wave-14.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B3-001** | Publish flow + revalidation API | **Publish** button in builder; draft vs published state |

---

### Wave 15 — B4 live customer sites — [wave-15.md](wave-15.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B4-001** | Site renderer + wildcard `*.codedpixels.co.uk` | **`http://localhost:3002`** with `SITE_RENDERER_DEV_SLUG` — real published homepage (not configurator mock) |

Template seeds become **visible to end visitors** on a live subdomain after publish.

---

### Wave 16 — B6 real payments + onboarding — [wave-16.md](wave-16.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B6-001** | Stripe Extension, provisioning jobs | **Real checkout** when `NEXT_PUBLIC_CHECKOUT_MODE=stripe`; simulation banner hidden |
| **B6-002** | Post-pay onboarding wizard | After pay: wizard at `/onboarding`; polling until tenant is ready |

**Templates milestone:** `provisionTenant` copies seeded template sections into the customer’s first draft site.

---

### Wave 17 — B7 storage + B8 CRM/products — [wave-17.md](wave-17.md)

| Ticket | What engineers built | What **you** see |
|--------|----------------------|------------------|
| **B7-001** | Firebase Storage, virus scan, image resize | Asset upload modal in builder |
| **B8-001** | Leads inbox, products, Stripe customer portal | `/dashboard/leads`, `/dashboard/products`, `/dashboard/billing` |

---

## Template lifecycle (current)

| Stage | When | What it means |
|-------|------|---------------|
| Names in configurator | **Done** (Wave 1) | Pick “Sparkle Clean” — ID saved in URL/signup |
| Preview colours | **Done** (Wave 4) | Mock browser in configurator |
| Firestore seed files | **Done** (Wave 12) | Full section tree in `templates/` |
| Customer’s draft site | **Done** (Wave 16) | Cloned into tenant after checkout |
| Public live site | **Done** (Waves 14–15) | Publish + `slug.codedpixels.co.uk` |

Detail: [roadmap.md](roadmap.md) · [template-seeding-ci-spec.md](../template-seeding-ci-spec.md)

---

## What stays the same by default

- Marketing site at `/` — same configurator UX
- `/get-started` — **simulated** signup unless `NEXT_PUBLIC_CHECKOUT_MODE=stripe`
- Cookie banner + consent-gated analytics
- Template gallery — metadata + “Use this template” deep links

---

## How you know a Phase 2 wave landed

1. [project-status.md](../project-status.md) — tickets under **Completed**
2. Matching **[wave-N.md](wave-12.md)** guide with browser or terminal checklist
3. [roadmap.md](roadmap.md) **Shipped?** column updated

---

## Expert alignment

Aligned with **Dr. Samuel Ruiz** (Phase 2 scope), **Dr. Maya Patel** (ticket waves), **Dr. Rafael Ortiz** (B1 templates), **Mr. Theo Laurent** (builder UX), **Dr. Owen Reilly** (B6 Stripe).
