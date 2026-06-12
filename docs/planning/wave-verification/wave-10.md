# Wave 10 — Phase 2 prep (docs only)

**Written by:** Mia Thompson  
**Wave closes when:** DOC-003 through DOC-008 are done  
**Milestone:** Engineering specs for builder, Stripe, monorepo, template seeding  
**Status:** Shipped  
**Browser change:** **None**

---

## In one sentence

Wave 10 wrote the blueprints for Platform Phase 2. You will not see anything new in the browser — open the docs if you want to read ahead.

---

## What landed (files, not features)

| Doc | What it tells us |
|-----|------------------|
| [add-on-deliverables.md](../add-on-deliverables.md) | What each add-on unlocks in builder/dashboard |
| [stripe-catalogue.md](../stripe-catalogue.md) | How Stripe products/prices map to configurator |
| [builder-ui-spec.md](../../specs/builder-ui-spec.md) §5.1–5.2 | Builder interactions expanded |
| [site-renderer-architecture.md](../../specs/site-renderer-architecture.md) | How `*.codedpixels.co.uk` will work |
| [monorepo-layout-spec.md](../monorepo-layout-spec.md) | Turborepo folder layout (Wave 11 implements) |
| [template-seeding-ci-spec.md](../template-seeding-ci-spec.md) | When real template **page content** hits Firestore (B1) |

---

## How to verify Wave 10

- [ ] Files exist (see table above)
- [ ] `npm test` still passes — no app code changed
- [ ] Browser unchanged from Wave 9

---

## What to expect next

**Wave 11** moves code into a monorepo — still the same website.  
**Wave 12+** starts Firestore template seeds and tenant schema — see [roadmap.md](roadmap.md) and [phase-2-preview.md](phase-2-preview.md).
