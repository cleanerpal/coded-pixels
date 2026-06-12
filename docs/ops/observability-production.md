# Observability production setup (PL-004)

**Ticket:** PL-004 · Wave 21 · INF lane  
**Document owner:** Dr. Mira Solano (Sentry / observability)  
**FinOps owner:** Dr. Daniel Moreau  
**Status:** Production runbook — 12 June 2026  
**Gate:** [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.4

**Aligned with Dr. Mira Solano on Q61** — Sentry required on all surfaces that handle or transit PII; separate DSNs per deployable; `beforeSend` denylist active before first customer signup.

---

## 1. Purpose

Operational checklist for **observability prerequisites** before the first real customer is provisioned on production Firebase.

| §2.4 # | Item | Section |
|--------|------|---------|
| 1 | Sentry DSNs — marketing, builder, site-renderer, Functions (separate projects) | [§2](#2-sentry-projects-and-dashboards) |
| 2 | PII scrubbing (`beforeSend`) on all surfaces | [§3](#3-pii-scrubbing-beforesend) |
| 3 | Synthetic probes: `/`, `/get-started`, demo tenant, `/api/health` | [§4](#4-synthetic-probes) |
| 4 | FinOps §6 weekly checklist — assigned owner | [§5](#5-finops-weekly-monitoring-checklist) |
| 5 | Error budget policy — deploy pause on P0/P1 | [§6](#6-error-budget-and-deploy-pause) |

**Related docs:**

- [`finops-slos.md`](../planning/finops-slos.md) — SLOs, error budget, incident tiers (§2, §5, §6)
- [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) — deploy order, DNS, App Check (B9-001)
- [`expert-review-memo.md`](../planning/expert-review-memo.md) — Q61 Sentry + PII scrubbing amendment

---

## 2. Sentry projects and dashboards

Create **four separate Sentry projects** in one organisation. Do not share a DSN across backends — FinOps cost attribution and alert routing depend on per-surface isolation ([`finops-slos.md`](../planning/finops-slos.md) §4.4).

Replace `{org}` and project slugs below with your live Sentry org after provisioning.

| Surface | Package / deployable | Sentry project slug (recommended) | Dashboard |
|---------|----------------------|-----------------------------------|-----------|
| Marketing | `@codedpixels/marketing` · App Hosting `marketing` | `codedpixels-marketing` | `https://sentry.io/organizations/{org}/projects/codedpixels-marketing/` |
| Builder | `@codedpixels/builder` · App Hosting `builder` | `codedpixels-builder` | `https://sentry.io/organizations/{org}/projects/codedpixels-builder/` |
| Site-renderer | `@codedpixels/site-renderer` · App Hosting `site-renderer` | `codedpixels-site-renderer` | `https://sentry.io/organizations/{org}/projects/codedpixels-site-renderer/` |
| Cloud Functions | `functions/` · `europe-west2` Callables + triggers | `codedpixels-functions` | `https://sentry.io/organizations/{org}/projects/codedpixels-functions/` |

### 2.1 Environment variables (production)

Set in **App Hosting secrets** (Next.js apps) or **Secret Manager** (Functions). Never commit DSNs or auth tokens to the repo.

| App | Client DSN | Server DSN | Build upload (optional) |
|-----|------------|------------|-------------------------|
| Marketing | `NEXT_PUBLIC_SENTRY_DSN` | `SENTRY_DSN` | `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` |
| Builder | `NEXT_PUBLIC_SENTRY_DSN` | `SENTRY_DSN` | same |
| Site-renderer | `NEXT_PUBLIC_SENTRY_DSN` | `SENTRY_DSN` | same |
| Functions | — | `SENTRY_DSN` (runtime secret) | N/A — source maps via CI if adopted |

| Env | Value |
|-----|-------|
| `SENTRY_ENVIRONMENT` | `production` |

**Verify DSN wiring:**

```bash
# Marketing + builder — configs present in repo
test -f apps/marketing/sentry.client.config.ts
test -f apps/builder/sentry.client.config.ts

# After deploy — trigger a test error in staging only; confirm event lands in correct project
```

### 2.2 Release tagging (deploy gate)

Per [`finops-slos.md`](../planning/finops-slos.md) §3.4 — tag each production deploy in all four projects:

| Backend | Release name |
|---------|--------------|
| marketing | `marketing@{git-sha}` |
| builder | `builder@{git-sha}` |
| site-renderer | `site-renderer@{git-sha}` |
| functions | `functions@{git-sha}` |

Match App Hosting rollout SHA from PL-001 §2.1 #2.

### 2.3 Alert routing (minimum)

| Alert | Project(s) | Severity |
|-------|--------------|----------|
| New issue spike (> 2× 7-day baseline) | All four | Email → Mira Solano + Nathan Cole |
| Callable 5xx grouped by function | `codedpixels-functions` | P1 if sustained 5 min |
| `publishSite` success + revalidation non-2xx breadcrumb | `codedpixels-functions` + `codedpixels-site-renderer` | P2 |
| Confirmed PII in event payload | Any | **P0** — immediate freeze (§6) |

---

## 3. PII scrubbing (`beforeSend`)

**Gate:** B9-001 (App Check + live forms + builder Sentry) and INF-004 (marketing Sentry + scrubber) must be live before Callable PII endpoints accept production traffic.

### 3.1 Implementation status

| Surface | Config path | `beforeSend` | `sendDefaultPii` |
|---------|-------------|--------------|------------------|
| Marketing | `apps/marketing/lib/sentry/shared-options.ts` | `scrubPiiFromSentryEvent` | `false` |
| Builder | `apps/builder/lib/sentry/shared-options.ts` | `scrubPiiFromSentryEvent` | `false` |
| Site-renderer | *Production prerequisite* — mirror marketing pattern | Required before go-live | `false` |
| Functions | *Production prerequisite* — `@sentry/node` init in `functions/src` | Required before go-live | `false` |

Shared denylist (email, phone, config payloads) — [`apps/marketing/lib/sentry/pii-scrubber.ts`](../../apps/marketing/lib/sentry/pii-scrubber.ts) · tests: `pii-scrubber.test.ts`.

**Denied keys (non-exhaustive):** `email`, `userEmail`, `phone`, `phoneNumber`, `password`, `config`, `configState`, `configSnapshot`. Email patterns in strings replaced with `[Filtered]`.

### 3.2 Verification steps

| Step | Type | Action | Pass |
|------|------|--------|------|
| 3.1 | Auto | Unit tests green | `npm test` — `pii-scrubber.test.ts` |
| 3.2 | Manual | Sentry → Project Settings → Security & Privacy | **Allow server-side PII** = off; **Data scrubbing** defaults on |
| 3.3 | Manual | Staging test event with fake email in breadcrumb | Event shows `[Filtered]` — not raw email |
| 3.4 | Manual | Production smoke after deploy | No waitlist/signup/lead payloads in Sentry issue details |

**P0 override:** Any confirmed PII leak pauses all deploys and triggers incident per §6 — Dr. Mira Solano + Dr. Patrick O'Brien.

---

## 4. Synthetic probes

Minimum uptime set for launch gate ([`finops-slos.md`](../planning/finops-slos.md) §1.1, §1.3, §6.4). Demo tenant slug **`sparkle-clean`** is the platform template preview tenant ([`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md)).

| ID | URL | Backend | SLO tier |
|----|-----|---------|----------|
| `marketing-home` | `https://codedpixels.co.uk/` | marketing | Tier A 99.9% |
| `marketing-get-started` | `https://codedpixels.co.uk/get-started` | marketing | Tier A 99.9% |
| `site-renderer-demo-tenant` | `https://sparkle-clean.codedpixels.co.uk/` | site-renderer | Tier A 99.9% |
| `site-renderer-health` | `https://sparkle-clean.codedpixels.co.uk/api/health` | site-renderer | Tier A 99.9% |

Health route implementation: `apps/site-renderer/app/api/health/route.ts` — expects JSON `{ "status": "ok" }`.

### 4.1 Local verification script

```bash
# Offline checklist
npm run verify:production:probes

# Live HTTP checks (after DNS + deploy green per PL-001)
npm run verify:production:probes -- --live

# Optional timeout override (ms)
npm run verify:production:probes -- --live --timeout-ms=20000
```

Probe definitions: `scripts/lib/production-probes.mjs` · runner: `scripts/verify-production-probes.mjs`.

### 4.2 Production uptime job (manual provisioning)

Schedule **5-minute** synthetic checks on all four URLs. Suggested owners:

| Job | Owner | Tooling (examples) |
|-----|-------|-------------------|
| External uptime | Dr. Daniel Moreau | GCP Uptime Check, Better Stack, Pingdom |
| On-call notification | Dr. Nathan Cole | Route failures → P1 if > 2 consecutive misses |

**Pass criteria:** HTTP 2xx; health probe JSON `status === "ok"`. Probe failure consumes error budget ([`finops-slos.md`](../planning/finops-slos.md) §2.1).

### 4.3 Post-deploy

Run live probes within **15 minutes** of every production promote (Nathan wave close + FinOps §6.2).

```bash
npm run verify:production:probes -- --live
```

---

## 5. FinOps weekly monitoring checklist

Source: [`finops-slos.md`](../planning/finops-slos.md) **§6**.

| Cadence | Owner | Scope |
|---------|-------|-------|
| **Weekly** (standing) | **Dr. Daniel Moreau** | Full §6 checklist — Sentry, Firebase, Stripe, synthetic |
| **Sentry subsection** (§6.1) | **Dr. Mira Solano** | Error rates, PII audit, release triage, Callable 5xx grouping |
| **After each production deploy** | Dr. Nathan Cole → handoff | §6.2 Firebase console + §4 live probes |

### 5.1 §6.1 Sentry (Mira Solano — weekly)

- [ ] Error rate stable vs 7-day baseline — four projects/DSNs
- [ ] No PII in events — `beforeSend` scrubbing verified (§3)
- [ ] New issues from latest release triaged within 24 h
- [ ] `publishSite` success but revalidation non-2xx — breadcrumb alert configured
- [ ] Callable failures grouped by function name; 5xx spike → P1

### 5.2 §6.2 Firebase console (Daniel Moreau — weekly)

- [ ] App Hosting — three backends healthy; deploy SHA matches `main`
- [ ] Functions — error count, p95 latency per Callable
- [ ] Firestore — read/write spikes; rules deny spikes
- [ ] Auth, App Check (< 5% attestation failures), Storage, Extensions

### 5.3 §6.3 Stripe (Owen Reilly — weekly)

See [`stripe-production-setup.md`](stripe-production-setup.md) — webhook delivery, MRR guardrails.

### 5.4 §6.4 Synthetic & product (Daniel Moreau — weekly)

- [ ] Uptime probes green — `npm run verify:production:probes -- --live`
- [ ] GA4 configurator events; `signup_completed` anomaly review
- [ ] Optional scheduled Lighthouse vs [`perf-budget.md`](../planning/perf-budget.md)

**Record keeping:** Tick §6 items in weekly FinOps thread; link Sentry dashboard URLs from §2.

---

## 6. Error budget and deploy pause

Source: [`finops-slos.md`](../planning/finops-slos.md) §2 (error budget) and §5 (incident response).

### 6.1 Deploy pause triggers (mandatory)

**Pause all production deploys** when any of the following is true:

| Condition | Tier | Action |
|-----------|------|--------|
| Active **P0** incident | P0 | Freeze deploys immediately — only mitigations allowed |
| Active **P1** incident | P1 | Freeze deploys until mitigated or IC downgrades to P2 |
| Error budget **< 10%** or exhausted | Budget | Freeze per §2.2 — reliability fixes only |
| Callable 5xx **> 1%** for 5 min | Escalation | Immediate freeze review (§2.3) |
| Confirmed **PII in Sentry** | P0 | Freeze all surfaces — security override |

**Incident commander:** Dr. Nathan Cole declares pause and lift. **FinOps advisor:** Dr. Daniel Moreau classifies PRs as reliability-fix vs feature during freeze.

### 6.2 P0 / P1 definitions (summary)

| Tier | Definition | Response target |
|------|------------|-----------------|
| **P0** | Complete outage, signup/payment broken, PII breach | 15 min ack · 1 h mitigate |
| **P1** | Major feature unavailable — `publishSite`, builder login, wildcard DNS | 30 min ack · 4 h mitigate |

Full examples: [`finops-slos.md`](../planning/finops-slos.md) §5.1.

### 6.3 Deploy pause procedure

1. **Detect** — Sentry alert, synthetic probe failure, Firebase metrics, or user report.
2. **Triage** — Nathan assigns P0–P3; open incident thread.
3. **Pause** — Post in `#codedpixels-ops` (or equivalent): *"Deploy freeze — P{n} — {summary}"*. CI/CD: hold App Hosting rollouts and `npm run deploy:production`.
4. **Mitigate** — Rollback App Hosting release (PL-005), revert Functions, disable feature flag. See [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) §4 rollback pointer.
5. **Lift** — IC confirms probes green + Sentry stable 30 min → resume deploys. Log error budget consumption explicitly.
6. **Post-incident** — Blameless review within 5 business days; update this runbook if gaps found.

### 6.4 Error budget states (non-incident)

When no active P0/P1 but budget is low ([`finops-slos.md`](../planning/finops-slos.md) §2.2):

| Budget remaining | Delivery mode |
|------------------|---------------|
| > 50% | Normal |
| 25–50% | Caution — no optional infra changes |
| 10–25% | Slowdown — freeze non-critical features |
| < 10% | Freeze — reliability only |

---

## 7. Acceptance (PL-004)

| §2.4 item | Automated | Documented manual | Status |
|-----------|-----------|-------------------|--------|
| #1 Sentry DSNs (4 projects) | Config files exist (marketing, builder) | Console projects + App Hosting secrets | ☐ |
| #2 PII `beforeSend` | `npm test` (scrubber tests) | Staging event spot-check | ☐ |
| #3 Synthetic probes | `verify:production:probes` | Uptime job scheduled 5 min | ☐ |
| #4 FinOps §6 owner | — | Daniel Moreau weekly; Mira §6.1 | ☐ |
| #5 Deploy pause P0/P1 | — | IC procedure §6.3 documented | ☐ |

**Expert:** Dr. Mira Solano · **Coordinator handoff:** Dr. Nathan Cole
