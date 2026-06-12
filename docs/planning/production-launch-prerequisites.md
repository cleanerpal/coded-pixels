# Production Launch Prerequisites

**Document owner:** Dr. Daniel Moreau · Dr. Nathan Cole  
**Ticket series:** Wave 21 (`PL-001`–`PL-005`)  
**Status:** Canonical checklist — 12 June 2026  
**Sources:** [`finops-slos.md`](finops-slos.md) · [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) · [`monorepo-layout-spec.md`](../specs/monorepo-layout-spec.md) · project plan §18

---

## 1. Purpose

Formalize items previously listed as “queued separately” in `project-status.md` into **checkable prerequisites** before the first real customer is fully provisioned on the live Firebase project.

**This document does not replace** FinOps SLOs — it is the **go/no-go gate** for production cutover.

---

## 2. Non-negotiable prerequisites

### 2.1 Infrastructure (PL-001)

| # | Item | Verify |
|---|------|--------|
| 1 | GCP project `codedpixels` (or production ID) with `europe-west2` default | Firebase console |
| 2 | Three App Hosting backends deployed from `main` SHA: marketing, builder, site-renderer | Hosting console |
| 3 | DNS: `codedpixels.co.uk`, `www`, `app.`, wildcard `*.` → correct backends | `dig` / Hosting custom domains |
| 4 | Firestore rules + indexes deployed **before** Functions | Ordered deploy log |
| 5 | Cloud Functions (all Callables) deployed; secrets configured | `firebase functions:log` |
| 6 | App Check enforced on production Callables (debug tokens disabled) | B9-001 config |
| 7 | Firebase Auth — email/password or magic link for builder (per Q57 amendment) | Auth console |

### 2.2 Stripe (PL-002)

| # | Item | Verify |
|---|------|--------|
| 1 | **Stripe Extension for Firebase** installed on production project | Extensions console |
| 2 | Live mode API keys in Secret Manager — **not** in repo | Secret audit |
| 3 | Webhook `checkout.session.completed` → `handleCheckoutCompleted` — zero delivery failures 7d | Stripe dashboard |
| 4 | Product/price IDs match [`stripe-catalogue.md`](stripe-catalogue.md) | Extension sync |
| 5 | Test checkout → `provisionTenant` → tenant visible in builder | Manual smoke |

### 2.3 Seed data (PL-003)

| # | Item | Verify |
|---|------|--------|
| 1 | `npm run seed:templates` — manual approval gate passed | CI / runbook |
| 2 | `npm run seed:template-demos` — 10 demo tenants live | Preview URLs 200 |
| 3 | `PLATFORM_DEMO_OWNER_UID` set in production env | Seed script log |
| 4 | Demo tenants `noindex` verified on production subdomains | `curl -I` |

### 2.4 Observability (PL-004)

| # | Item | Verify |
|---|------|--------|
| 1 | Sentry DSNs: marketing, builder, site-renderer, Functions — separate projects | Sentry console |
| 2 | PII scrubbing active (`beforeSend`) on all surfaces | B9-001 + INF-004 |
| 3 | Synthetic probes: `/`, `/get-started`, sample tenant slug, `/api/health` | Uptime job |
| 4 | FinOps §6 weekly checklist assigned owner | [`finops-slos.md`](finops-slos.md) §6 |
| 5 | Error budget policy documented — deploy pause on P0/P1 | finops §5 |

### 2.5 Governance (PL-005)

| # | Item | Verify |
|---|------|--------|
| 1 | Production runbook on disk (`docs/ops/production-runbook.md` — PL-005 deliverable) | File exists |
| 2 | Rollback procedure for App Hosting + Functions | Runbook § |
| 3 | Incident contacts + Stripe/Firebase support escalation | Runbook § |
| 4 | GDPR: Privacy Policy + Terms live URLs match production domain | Legal review |
| 5 | Coordinator sign-off (Nathan Cole) recorded in `project-status.md` | Gate closed |

---

## 3. Explicitly out of first-customer scope

These remain Phase 2.1 platform waves (22+) — **not** launch blockers if subdomain-only MVP is acceptable:

- Custom domain DNS UI (Wave 22)
- Team invites (Wave 23)
- Dashboard plan changes (Wave 25)
- Client-site ecommerce (Wave 26)

---

## 4. Cost and FinOps guards

From [`finops-slos.md`](finops-slos.md) §4:

- Billing alerts at 50% / 80% / 100% of monthly budget
- Firestore read/write anomaly alerts
- Functions concurrency limits documented
- ClamAV + Resize Images Extension cost reviewed

---

## 5. Wave 21 ticket mapping

| Ticket | Delivers | Acceptance |
|--------|----------|------------|
| **PL-001** | Deploy scripts + DNS verification checklist | All §2.1 items green |
| **PL-002** | Extension install doc + live webhook verification | All §2.2 items green |
| **PL-003** | Production seed runbook + first run evidence | All §2.3 items green |
| **PL-004** | Probes + Sentry dashboard links in runbook | All §2.4 items green |
| **PL-005** | `docs/ops/production-runbook.md` + sign-off template | All §2.5 items green |

---

## 6. Expert sign-off

| Expert | Domain | Verdict |
|--------|--------|---------|
| Dr. Daniel Moreau | FinOps / CI | ☑ Checklist owner |
| Dr. Owen Reilly | Stripe | ☑ §2.2 |
| Dr. Mira Solano | Sentry | ☑ §2.4 |
| Dr. Patrick O'Brien | GDPR | ☑ §2.5 legal URLs |
| Dr. Nathan Cole | Coordinator | ☑ Wave 21 gate |

**Aligned with Dr. Daniel Moreau on FinOps SLO integration.**
