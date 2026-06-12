# Expert Review Memo — Spec Sign-Off

**Coordinator:** Dr. Nathan Cole  
**Documentation Owner:** Dr. Lena Moreau  
**Review date:** 12 June 2026  
**Documents reviewed:**
- [`../specs/codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md)
- [`../specs/builder-ui-spec.md`](../specs/builder-ui-spec.md)

---

## Executive Verdict

| Document | Verdict | Phase 0 gate |
|----------|---------|--------------|
| `../specs/codedpixels-project-plan.md` | **APPROVED WITH AMENDMENTS** (Q54–Q62 applied) | Cleared after amendment pass |
| `../specs/builder-ui-spec.md` | **APPROVED AS OUTLINE** | Phase 2 kickoff only; not blocking MVP |

**Panel consensus:** The specs are the strongest pre-build documentation this team has produced. Direction on configurator, pricing, multi-tenant architecture, and builder block model is **unanimously endorsed**. Four blocking contradictions in the marketing spec were patched in the **Q54 Amendment Pass** (see below). Phase 2 builder outline is sound pending hosting model detail at B0 kickoff.

---

## Review Process

Dr. Nathan Cole ran **four parallel review panels** covering all domains in [`.cursor/experts.md`](../../.cursor/experts.md):

| Panel | Leads | Verdict |
|-------|-------|---------|
| Product & UX | Samuel Ruiz, Sophia Laurent, Theo Laurent, Marcus Klein | CHANGES REQUIRED → amended |
| Architecture & Security | Michael Chen, Kai Nakamura, Rafael Ortiz, Victor Lang, Fatima Al-Sayed | CHANGES REQUIRED → amended |
| Compliance & Ops | Patrick O'Brien, Rebecca Flynn, Owen Reilly, Aria Bennett, Mira Solano, Aisha Khan | CHANGES REQUIRED → amended |
| Next.js, Perf, Hosting, a11y | Lena Petrova, Elena Voss, Marcus Wei, Marcus Rivera, Nadia Sokolov | CHANGES REQUIRED → amended |

---

## Unanimous Agreement (No Changes)

The following decisions are **fully endorsed** across all panels:

- Configurator-first journey, URL persistence, copy-config link (Q8, Q11, Q18)
- Package pre-select with user override; live total authoritative (Q10)
- Growth/Pro composition logic with card vs live-total disclosure (Q1, Q54, Q55)
- Custom template recurring default; one-time £149 at checkout only (Q2, Q13)
- Site Import “coming soon” + waitlist with config snapshot (Q4, Q9, Q17)
- Single Firebase project, tenant paths, soft provisioning (Q22–Q29)
- Block-based builder content + versioned publish + ISR (Q34, Q35)
- Stripe Checkout → webhook → `provisionTenant()` (Q38)
- SendGrid transactional email ownership (Q41, Aria Bennett)
- Form abuse protection baseline (Q49)
- Tiptap JSON storage, Firebase Storage + ClamAV for assets (Q44, Q45)
- Sentry Phase 2 builder; **required before MVP PII writes go live** (Q48, Q61)
- Mobile builder read-only Phase 2 (Q52)
- Rollback UI Phase 2.1 (Q53)

---

## Q54 Amendment Pass (Applied to Project Plan)

| # | Issue | Resolution | Owners |
|---|-------|------------|--------|
| **Q54** | Pro package £39.99 card vs £39.94 live total undocumented | Same rule as Q1: card shows **£39.99**; live total **£39.94** on preset; footnote on all package cards: *“Exact total shown in summary”* | Marcus Klein |
| **Q55** | Legal pages contradiction (Q16 vs §7/§14 “stub OK”) | **Real pages required** — all stub language removed | Rebecca Flynn, Lena Moreau |
| **Q56** | Firestore timing contradiction (Q5 vs §8/Q9) | **Firestore in MVP** for `signups` + `waitlist_site_import`; tenant `companies/*` starts Phase 2 | Kai Nakamura |
| **Q57** | MVP password form vs no Firebase Auth | **Email-only signup in MVP** — no password field; Auth + Stripe at Phase 2 | Fatima Al-Sayed, Patrick O'Brien |
| **Q58** | Success email promise without SendGrid in MVP | Copy: *“We’ve saved your plan — we’ll be in touch soon”* — no email delivery promise until SendGrid live | Samuel Ruiz, Aria Bennett |
| **Q59** | Marketing “Phase 2” naming collision | Implementation phases renamed **M0–M4** (marketing build) vs **Platform Phase 2** (builder) | Nathan Cole |
| **Q60** | Custom domain UI phase conflict | Onboarding Step 3 = **subdomain only**; full custom domain UI = **Platform Phase 2.1** | Sophia Laurent, Marcus Rivera |
| **Q61** | Sentry optional Phase 0 while collecting PII | **Sentry required** on marketing site before waitlist/signup endpoints go live | Mira Solano |
| **Q62** | Leads route mismatch | Standard route: **`/dashboard/leads`** (parent Q50 updated) | Michael Chen |

---

## Outstanding Items (Non-Blocking — Phase 2 Kickoff)

These do **not** block Phase 0. Track in builder kickoff or follow-on specs.

| Priority | Item | Owner | Artefact |
|----------|------|-------|----------|
| P1 | Firestore security rules spec | Rafael Ortiz | ☑ [`firestore-rules-spec.md`](../specs/firestore-rules-spec.md) |
| P1 | **Firestore schema** | Rafael Ortiz, Priya Desai | ☑ [`firestore-schema.md`](../specs/firestore-schema.md) |
| P1 | Shared renderer + wildcard hosting model | Marcus Rivera, Michael Chen | builder spec §6 + project §18 Q24 |
| P1 | Monorepo layout (Turborepo) | Marcus Wei | builder B0 + project §7 addendum |
| P2 | Stripe product/price catalogue mapping | Owen Reilly | project §18 Stripe appendix |
| P2 | Post-Stripe Auth provisioning flow | Fatima Al-Sayed | project §18 Auth flow |
| P2 | Add-on deliverables matrix (11 add-ons → surfaces) | Samuel Ruiz | project §19 gap table |
| P2 | Cookie consent UI spec (not placeholder) | Patrick O'Brien | project §7 |
| P2 | Waitlist explicit consent checkbox | Patrick O'Brien | project §5 Q9 |
| P2 | Data retention table | Patrick O'Brien | Privacy Policy + project §18 |
| P3 | Builder a11y spec expansion | Nadia Sokolov | builder spec §11 (new) |
| P3 | `slugs/{slug}` index doc | Michael Chen | ☑ Defined in firestore-schema.md §5.1 |
| P3 | Template seed single source of truth | Marcus Wei | `packages/templates` |
| P3 | revalidation API contract for `publishSite` | Lena Petrova | builder spec §7 |

---

## Panel-Specific Notes (Filed, Not Blocking MVP)

### Product (Samuel Ruiz)
- Add **add-on deliverables matrix** before Platform Phase 2 marketing claims go live for email-automation, VAT, AI, SMS, etc.
- Track `last_package_clicked` in GA4 when user drifts from preset (Q20 extension).

### UX (Sophia Laurent)
- Clarify preview panel visible **Steps 1–3 on desktop** (recommended); mobile Preview tab collapsible.
- Step navigation: **non-linear** — all steps clickable from progress indicator.
- Invalid URL params: **partial restore** preferred over full Starter reset (Q40 refinement).

### Conversion (Theo Laurent)
- Simulated checkout banner: *“No payment taken — this is a sign-up preview”*
- Show one-time £149 in sticky summary when toggle active (not only at checkout).
- Label testimonials *“Example customer stories”*.

### Pricing (Marcus Klein)
- Starter package row copy clarified (templates included; Custom Template is add-on only).
- SMS moved to **Optional add-ons** group (not Growth group) — avoids Growth taxonomy confusion.
- All prices **VAT-inclusive** for UK B2C (document in FAQ + engine).

### Security (Victor Lang, Rafael Ortiz)
- Prefer **Callable Cloud Functions** for waitlist/signup writes over open Firestore client rules.
- `publishSite` must validate gated section types against `featureIds` server-side.
- Firestore rules unit tests in CI (Platform Phase 2 B1).

### Compliance (Patrick O'Brien, Rebecca Flynn)
- Waitlist: unchecked consent checkbox + `consentAt` field.
- Privacy Policy: SendGrid, reCAPTCHA, GA4 subprocessors; retention periods; DPO contact email TBD.
- MVP Terms: simulated sign-up ≠ contract formation.

### Ops (Aria Bennett, Mira Solano)
- Unified SendGrid template registry before Platform Phase 2.
- Sentry `beforeSend` denylist: email, config payloads.

### Engineering (Lena Petrova, Marcus Wei, Marcus Rivera)
- Three App Hosting backends: marketing, builder, site-renderer (wildcard `*.codedpixels.co.uk`).
- `provisionTenant` step 5 = slug mapping doc, not per-tenant Hosting site (shared renderer model).

---

## Sign-Off Register

| Expert | Role | Status |
|--------|------|--------|
| Dr. Nathan Cole | Coordinator | ☑ Amendments accepted |
| Dr. Lena Moreau | Documentation | ☑ Q54–Q62 applied |
| Dr. Samuel Ruiz | Product | ☑ Phase 0 cleared |
| Dr. Sophia Laurent | UX | ☑ With preview/step notes filed |
| Mr. Theo Laurent | Conversion | ☑ With MVP copy amendments |
| Dr. Marcus Klein | Pricing | ☑ Q54–Q55 applied |
| Dr. Michael Chen | Platform | ☑ Phase 2 outline approved |
| Dr. Kai Nakamura | CTO | ☑ Q56 applied |
| Dr. Rafael Ortiz | Firestore/Security | ☑ Rules spec deferred to M3 |
| Dr. Victor Lang | Security | ☑ Function-first writes recommended |
| Dr. Fatima Al-Sayed | Auth | ☑ Q57 applied |
| Dr. Patrick O'Brien | GDPR | ☑ Q55, Q57; consent UI filed |
| Ms. Rebecca Flynn | Consumer | ☑ Q58 applied |
| Dr. Owen Reilly | Stripe | ☑ Phase 2 catalogue filed |
| Dr. Aria Bennett | SendGrid | ☑ Q58 applied |
| Dr. Mira Solano | Observability | ☑ Q61 applied |
| Dr. Aisha Khan | QA | ☑ E2E matrix extension filed |
| Dr. Lena Petrova | Next.js | ☑ Monorepo note filed |
| Dr. Elena Voss | Performance | ☑ Budget gates filed |
| Dr. Marcus Wei | Monorepo | ☑ B0 package layout filed |
| Dr. Marcus Rivera | Hosting | ☑ Shared renderer model filed |
| Dr. Nadia Sokolov | a11y | ☑ A1–A8 filed for M4 + Phase 2 |

---

## Next Step

**Dr. Maya Patel** may decompose **M0** (marketing scaffold) into implementation tickets.  
**Dr. Lena Moreau** owns M3 deploy of rules from [`firestore-rules-spec.md`](firestore-rules-spec.md). Remaining P2 docs: cookie consent UI, add-on deliverables matrix, stripe catalogue.

**Approved for implementation (M0–M4):** ☑ Expert panel consensus (post Q54–Q62)

---

## Firebase Extensions (Q63–Q64)

User final review aligns with expert panel. Full detail: project plan **§23**.

| # | Decision | Owners |
|---|----------|--------|
| **Q63** | **Stripe Extension + custom Functions** — Extension for Checkout/webhooks/Customer docs; custom for `provisionTenant`, `companies/{companyId}` mapping, feature ↔ subscription item sync, £149 one-time | Owen Reilly, Kai Nakamura |
| **Q64** | **Resize Images Extension + custom ClamAV Function** — Extension owns thumbnails; custom Function owns malware scan; alt text in builder UI | Nora Patel, Clara Voss |

| Phase | Extensions |
|-------|------------|
| M0–M4 | None |
| Platform Phase 2 | Stripe, Resize Images, Delete User Data + App Check (SDK) |
| Platform Phase 3+ | BigQuery export (defer) |
| Avoid | Trigger Email (SendGrid Q41) |
