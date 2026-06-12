# Response to Forge & Scale Advisors — Independent SaaS Review

**From:** Dr. Nathan Cole (Coordinator), CodedPixels  
**Date:** 12 June 2026  
**Re:** Independent SaaS Review Team Report (Wave 19 readiness, Phase 2.1 gaps, production launch)

---

## Executive summary

We **accept the review’s core finding**: planning for Wave 19 was strong but not yet at the executable clarity of B-series waves. We have **not spooled Wave 19 code agents** pending this amendment pass.

**Actions taken (same day):**

1. Amended [`marketing-template-preview-spec.md`](marketing-template-preview-spec.md) — §3.4–3.7, §4.5, §5.1, §9 answer all six Wave 19 questions
2. Authored [`template-addition-governance-spec.md`](template-addition-governance-spec.md) (DOC-011) with mandatory checklists + Q69/Q70
3. Authored [`phase-2.1-platform-roadmap.md`](phase-2.1-platform-roadmap.md) — Waves 21–27 decomposition
4. Authored [`production-launch-prerequisites.md`](production-launch-prerequisites.md) — Wave 21 PL-001–PL-005

We request a **follow-up review** against these artefacts before Wave 19 Phase 2 code spool.

---

## Section 1 — Wave 19 responses

### Q1: Demo tenant ownership and lifecycle

| Environment | Model |
|-------------|--------|
| **Identity** | Deterministic `companyId`: `demo-{templateId}`; slug = `templateId` |
| **Owner** | `PLATFORM_DEMO_OWNER_UID` — platform ops only; never customer Auth |
| **Creation** | Admin SDK via `seed:template-demos` only — never `provisionTenant` |
| **Production** | Manual approval gate (same as template catalogue seed) |
| **Lifecycle** | Upsert in place; not deleted on re-seed |

→ **Spec:** [`marketing-template-preview-spec.md`](marketing-template-preview-spec.md) §3.4

### Q2: Behaviour when template seed updates after demo exists

Re-seed compares `templates/{templateId}.contentHash`. If changed: **update published version sections** from latest seed, new UUIDs per clone rule, revalidate `site-slug:{templateId}`. If unchanged: no-op. Removed templates: log warning, no auto-delete.

→ **Spec:** §3.5

### Q3: Where `isPlatformDemo` → `noindex` is implemented

**Not** root `layout.tsx` (no tenant context). Implementation contract:

- Extend `TenantContext` in `apps/site-renderer/lib/tenant-resolution.ts`
- Set `robots: { index: false, follow: false }` in `generateMetadata()` on `apps/site-renderer/app/[[...pageSlug]]/page.tsx`

→ **Spec:** §5.1 · **Architecture:** [`site-renderer-architecture.md`](../specs/site-renderer-architecture.md) §11

### Q4: Thumbnail failure contract

| Layer | Behaviour |
|-------|-----------|
| Generator script | **Fails closed** (exit 1) if any screenshot fails |
| Marketing UI | **Never fails** — gradient fallback when WebP absent |
| Timing | After demo seed; not embedded in seed script |

→ **Spec:** §4.5

### Q5: Reserved slug collision with tests

**We agree a plan was missing; we clarify it was partially a category error.**

- `RESERVED_TEMPLATE_SLUGS` applies to **customer onboarding subdomain pick** (ENG-026) only
- `?template=sparkle-clean` in configurator/tests is **template selection** — unchanged
- Existing marketing E2E and config tests **require no migration**
- New builder slug unit tests added under ENG-026

→ **Spec:** §3.6

### Q6: `@codedpixels/shared-types` surface

| Export | Path |
|--------|------|
| `RESERVED_TEMPLATE_SLUGS`, `isReservedTemplateSlug()` | `packages/shared-types/src/constants/reserved-template-slugs.ts` |
| `Company.isPlatformDemo` | `packages/shared-types/src/firestore/company.ts` |
| `TemplateCategory` unification | **Wave 20** (B10-001) — move from marketing-local |

→ **Spec:** §3.7

---

## Section 2 — Wave 20 responses

### Mandatory DOC-011 items before B10-001

Checklist in [`template-addition-governance-spec.md`](template-addition-governance-spec.md) §3 — five checkable items including expert sign-off and PR template linkage.

### `new-template.mjs` authority

**Skeleton only** (Q69). Manifest, marketing metadata, reserved slugs, demo seed, thumbnails require human PR + CI.

### Finalized B10-001 template IDs

Four IDs confirmed (Q70): `wellness-clinic`, `clear-accounting`, `focus-photography`, `fit-hub` with three new category enum values — see DOC-011 §2.

---

## Section 3 — Phase 2.1 platform decomposition

**Decision:** Serial wave series **after Wave 20**, not an untracked parallel backlog.

| Wave | Focus |
|------|--------|
| 21 | Production launch (PL-001–PL-005) |
| 22 | Custom domains |
| 23 | Team invites + RBAC |
| 24 | Version history + rollback |
| 25 | Dashboard plan changes (Stripe) |
| 26 | Client-site ecommerce |
| 27 | Advanced leads |

**Decomposition owner:** Dr. Maya Patel · Full ticket blocks added to `implementation-tickets.md` when Wave 19 closes.

→ [`phase-2.1-platform-roadmap.md`](phase-2.1-platform-roadmap.md)

---

## Section 4 — Production launch

**Decision:** Formal **Wave 21** ticket series — not handled outside the wave system.

Non-negotiable prerequisites consolidated in [`production-launch-prerequisites.md`](production-launch-prerequisites.md) §2 (infra, Stripe, seeds, observability, governance).

---

## Section 5 — Process and execution model

### Planning-only close before Wave 19 code?

**Yes.** We treat this amendment pass as **Wave 19 Phase 1 completion** (DOC-010 + operational contracts). Phase 2 spools INF-005, ENG-026, etc.

### Full test + build gate at wave close?

**Yes — unchanged.** Marketing-focused waves still run `lint + typecheck + npm test + npm run build` at Nathan wave close. Tailoring is in **scope** (e.g. optional `@template-preview-smoke` E2E tag), not in **quality bar**.

### Existing tests impacted by reserved-slug logic?

**Minimal.** Configurator/provisioning tests use `templateId`; only builder onboarding slug validator gains new tests. Documented in §3.6.

---

## Recommended next outputs — status

| Review recommendation | Status |
|----------------------|--------|
| Fully specified Wave 19 tickets post-DOC-010 | ☑ Spec amended; tickets reference §3–§9 |
| Wave 20 acceptance criteria | ☑ DOC-011 on disk |
| Phase 2.1 decomposition | ☑ Roadmap Waves 21–27 |
| Production launch prerequisites doc | ☑ On disk |
| Updated verification guides | ☑ `wave-19.md` references §5.1; roadmap updated |

---

## Request

Please re-review the four new/amended documents and confirm Wave 19 Phase 2 code spool is unblocked. We remain available for a second iteration on Wave 21–27 ticket detail before those waves spool.

**Coordinator:** Dr. Nathan Cole  
**Documentation:** Dr. Lena Moreau  
**Decomposition:** Dr. Maya Patel

---

## Follow-up review (12 June 2026)

**Verdict from Forge & Scale:** Wave 19 planning **approved for Phase 2 code spool.**

Actions taken in response:

1. Planning close commit — DOC-010 + advisory artefacts + `RESERVED_TEMPLATE_SLUGS` stub
2. Expanded Wave 19 acceptance criteria in `implementation-tickets.md` (spec §3–§9 cross-refs)
3. `packages/shared-types/src/constants/reserved-template-slugs.ts` on disk

**Next:** Spool Wave 19 Phase 2 — INF-005 ∥ ENG-026.

**Status:** Awaiting Forge & Scale narrow follow-up optional; no blockers identified.
