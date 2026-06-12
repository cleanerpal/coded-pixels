# FinOps SLOs & error budget addendum (DOC-009)

**Experts:** Dr. Daniel Moreau (FinOps/CI), Dr. Mira Solano (observability)  
**Spec:** [`codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md) — §1 success metrics, Q5 (App Hosting), Q24 (wildcard site-renderer)  
**Related:** [`perf-budget.md`](perf-budget.md) (QA-003), [`monorepo-layout-spec.md`](monorepo-layout-spec.md) §7 (CI), [`site-renderer-architecture.md`](../specs/site-renderer-architecture.md) §7–8  
**Ticket:** DOC-009 · **Phase:** Post-launch ops (M4 shipped, Platform Phase 2 live)

This document defines **service level objectives (SLOs)**, **error budgets**, **CI/CD gates**, **cost guardrails**, and **incident response** for CodedPixels. It complements the frontend performance budget in [`perf-budget.md`](perf-budget.md) — that file covers Lighthouse and bundle size; this file covers availability, backend latency, reliability policy, and FinOps.

---

## 1. Service level objectives by surface

Three **Firebase App Hosting** backends plus **Cloud Functions** (`europe-west2`) share one GCP project ([`monorepo-layout-spec.md`](monorepo-layout-spec.md) §3.1). SLOs are measured over a **28-day rolling window** unless noted.

### 1.1 Marketing site (`codedpixels.co.uk`)

| SLO | Target | Measurement |
|-----|--------|-------------|
| **Availability** | **99.9%** | Synthetic checks on `/`, `/get-started`, `/pricing` (5-min interval) |
| **TTFB (p95)** | **< 800 ms** | App Hosting + CDN; exclude deploy windows |
| **Lighthouse Performance (mobile, `/`)** | **≥ 90** | QA-003 — see [`perf-budget.md`](perf-budget.md) |
| **Lighthouse Accessibility (mobile, `/`)** | **≥ 95** | QA-003 — see [`perf-budget.md`](perf-budget.md) |
| **Configurator client JS** | **< 80 KB gzip** | QA-003 — `scripts/lighthouse-budget.mjs` |
| **First interaction (throttled 4G)** | **< 1 s** | Manual wave verification per [`perf-budget.md`](perf-budget.md) |
| **Time to first price interaction** | **< 5 s** | Project plan §1 success metric |

**Success-metric alignment (product):** Configurator completion rate ≥ 40% of visitors who scroll to configurator — tracked in GA4; not an infra SLO but reviewed monthly alongside error budget.

### 1.2 Builder (`app.codedpixels.co.uk`)

| SLO | Target | Measurement |
|-----|--------|-------------|
| **Availability** | **99.5%** | Synthetic on `/dashboard`, authenticated canvas route |
| **TTFB (p95)** | **< 1.2 s** | App Hosting; auth-gated routes |
| **Save draft (client → Firestore write)** | **p95 < 2 s** | Client-reported; Sentry breadcrumb on timeout |
| **Publish trigger (button → Callable accepted)** | **p95 < 3 s** | Time to `{ success: true }` from `publishSite` — full publish pipeline has separate SLO below |

Builder mobile viewport is read-only (Q52); SLOs apply to desktop edit flows only.

### 1.3 Site-renderer (`{slug}.codedpixels.co.uk`)

| SLO | Target | Measurement |
|-----|--------|-------------|
| **Availability** | **99.9%** | Synthetic on wildcard tenant + `/api/health` |
| **TTFB (p95)** | **< 600 ms** | Cached HTML at App Hosting edge |
| **Fresh content after publish** | **< 5 s (p95)** | `publishSite` → revalidation API → CDN — [`site-renderer-architecture.md`](../specs/site-renderer-architecture.md) §7.3 |
| **Stale content bound (revalidation failure)** | **≤ 1 h** | ISR default `revalidate = 3600` — alert if revalidation fails |

Customer-facing sites are highest priority after payment flows; availability matches marketing.

### 1.4 Cloud Functions (Callables, `europe-west2`)

All sensitive writes use Callables per [`firestore-rules-spec.md`](../specs/firestore-rules-spec.md) §6. Latency measured **server-side** (Function execution time, excluding client network).

| Function | Availability | **p95 latency** | Notes |
|----------|--------------|-----------------|-------|
| `submitSignup` | 99.9% | **< 2 s** | App Check + rate limit 5/hr/IP |
| `submitSiteImportWaitlist` | 99.9% | **< 2 s** | Same hardening as signup |
| `submitLead` | 99.5% | **< 2.5 s** | reCAPTCHA v3 + App Check; public forms |
| `publishSite` | 99.5% | **< 5 s** | Includes revalidation HTTP call |
| `provisionTenant` | 99.5% | **< 10 s** | Post-Stripe; multi-doc write |
| `submitLead` error rate | — | **< 0.5%** 5xx | Exclude App Check / rate-limit 4xx |

**Aggregate Callable SLO:** 99.9% success rate (non-client-error responses) across all production Callables.

---

## 2. Error budget policy

An **error budget** is the allowed unreliability below 100% over the 28-day window. When budget is **exhausted**, feature work pauses in favour of reliability fixes.

### 2.1 Budget allocation

| Tier | SLO | Monthly error budget (approx.) |
|------|-----|--------------------------------|
| **Tier A** — marketing, site-renderer, core Callables | 99.9% | ~43 min downtime / 0.1% failed requests |
| **Tier B** — builder, `publishSite`, `provisionTenant` | 99.5% | ~3.6 h downtime / 0.5% failed requests |

Budget consumes on: HTTP 5xx, synthetic probe failure, Callable 5xx, SLO latency breach sustained > 15 min.

Budget does **not** consume on: planned deploys (≤ 15 min, announced), client 4xx (validation, rate limit, App Check), DDoS mitigated by Cloud Armor / rate limits.

### 2.2 Policy states

| Budget remaining | Action |
|------------------|--------|
| **> 50%** | Normal delivery — features, docs, Phase 2 tickets |
| **25–50%** | **Caution** — no optional infra changes; increase monitoring cadence |
| **10–25%** | **Slowdown** — freeze non-critical features; prioritise reliability tickets |
| **< 10% or exhausted** | **Freeze** — only fixes for SLO breaches, security, or compliance until budget resets |

**Coordinator (Dr. Nathan Cole)** declares freeze; **Dr. Daniel Moreau** advises on whether a given PR is reliability-fix vs feature.

### 2.3 Escalation triggers (immediate freeze review)

- Any **P0** incident (§5.1)
- Callable 5xx rate **> 1%** for 5 min
- Marketing or site-renderer availability **< 99%** in 24 h
- Stripe webhook / Extension processing failure affecting new signups
- Sentry PII leak confirmed (override all other work — Dr. Mira Solano + Dr. Patrick O'Brien)

---

## 3. CI/CD gates

**Owner:** Dr. Daniel Moreau — aligned with [`monorepo-layout-spec.md`](monorepo-layout-spec.md) §7.2 and [`development-workflow-rules.md`](../process/development-workflow-rules.md) §3.

### 3.1 Required on every merge to `main` (blocking)

Nathan runs at **wave close**; CI should mirror:

```bash
npm ci
npm run lint
npm run typecheck
npm test              # full Vitest suite — zero failures
npm run test:rules    # Firestore rules — firebase emulators
npm run build         # turbo run build — all apps + functions
```

| Gate | Fail policy |
|------|-------------|
| `lint` | Block merge |
| `typecheck` | Block merge |
| `test` | Block merge — no skipped suites |
| `test:rules` | Block merge when `firestore.rules` or rules tests change |
| `build` | Block merge — production build all workspaces |

**Monorepo note:** Post-B0, prefer `turbo run lint typecheck test build` from repo root; `test:rules` remains a root script (not turbo-cached initially).

### 3.2 Recommended on PR (non-blocking unless configured)

| Gate | Command | Notes |
|------|---------|-------|
| E2E smoke | `npm run test:e2e` or `test:e2e:spine` | Playwright — configurator + get-started |
| Template validation | `npm run validate:templates` | When seed JSON changes |
| Lighthouse + bundle | `npm run test:lighthouse` | QA-003 — see [`perf-budget.md`](perf-budget.md) |

### 3.3 Optional Lighthouse (post-build job)

Per [`perf-budget.md`](perf-budget.md): `test:lighthouse` is **not** part of `npm test`. Wire as a **separate CI job** when a production build + server is available:

```yaml
- run: npm run build
- run: npm run start &   # or per-app start for marketing
- run: npm run test:lighthouse
  env:
    LIGHTHOUSE_BASE_URL: http://localhost:3000
```

**Daniel Moreau policy:** Lighthouse job failure **warns** by default; promote to **blocking** only after Wave 10+ baseline is stable in `.lighthouseci/`. Keeps unit-test job independent so Lighthouse infra gaps do not block hotfixes.

### 3.4 Deploy gates (App Hosting)

| Check | When |
|-------|------|
| All §3.1 gates green on commit SHA | Before promote to production |
| Sentry release tagged | Marketing, builder, site-renderer, Functions |
| Firestore rules deployed before Functions that depend on them | Ordered deploy |
| Seed template `contentHash` unchanged or `manifest.seedVersion` bumped | [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) §5.2 |

**FinOps:** Enable Turborepo remote cache before parallel B2+ agent waves; local cache sufficient for solo B0 ([`monorepo-layout-spec.md`](monorepo-layout-spec.md) §7.2).

---

## 4. Cost guardrails

Single GCP project, shared Firestore, three App Hosting backends (Q23, Q24). Costs scale with tenants, traffic, and Storage — not per-tenant Firebase projects.

### 4.1 Monthly review thresholds (alert → action)

| Service | Warning | Critical | Action |
|---------|---------|----------|--------|
| **Firebase / GCP (total)** | > £150/mo | > £250/mo | Daniel Moreau review: Functions cold starts, Firestore indexes, App Hosting instances |
| **Cloud Functions invocations** | > 500k/mo | > 1M/mo | Audit Callable callers; tighten rate limits; cache read-heavy paths |
| **Firestore reads** | > 2M/mo | > 5M/mo | Review client listeners; prefer server components on site-renderer |
| **App Hosting (all backends)** | > £80/mo | > £120/mo | Check build minutes; ISR vs SSR ratio; image optimisation |
| **Firebase Storage** | > £30/mo | > £60/mo | ClamAV + resize pipeline; enforce 5 MB upload cap (Q44) |
| **Stripe fees** | > 3.5% of GMV | Dispute rate > 0.5% | Owen Reilly — catalogue vs actual MRR |

Set **GCP billing budget alerts** at 50%, 80%, 100% of monthly cap in Google Cloud Console.

### 4.2 Build & CI cost controls

- **Turbo remote cache:** enable before high parallel agent count — reduces duplicate `build` minutes.
- **Lighthouse CI:** run on `main` nightly or weekly, not every PR, unless promoting to blocking.
- **Emulator CI:** `test:rules` uses Firestore emulator only — no production reads in CI.
- **Seed job:** production seed via manual approval gate ([`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) §6.1).

### 4.3 Stripe / Extension guardrails

- **Run Invoices / Checkout Extension** — monitor failed payments and webhook delivery in Stripe Dashboard.
- No raw card data in Firestore or logs (PCI — Dr. Owen Reilly).
- `provisionTenant` idempotency — duplicate webhook must not double-provision (cost + data integrity).

### 4.4 App Hosting backends (cost attribution)

| Backend | Package | Cost driver |
|---------|---------|-------------|
| `marketing` | `@codedpixels/marketing` | Traffic spikes, marketing campaigns |
| `builder` | `@codedpixels/builder` | Authenticated sessions, lower traffic |
| `site-renderer` | `@codedpixels/site-renderer` | Per-tenant public traffic — scales with customer count |

Tag releases in Sentry by backend DSN to correlate error spikes with spend.

---

## 5. Incident response tiers

### 5.1 Severity definitions

| Tier | Definition | Examples | Response target |
|------|------------|----------|-----------------|
| **P0** | Complete outage or data/security breach | All sites 5xx; signup/payment broken; PII in Sentry | **15 min** acknowledge · **1 h** mitigate |
| **P1** | Major feature unavailable | `publishSite` failing; builder login down; wildcard DNS broken | **30 min** acknowledge · **4 h** mitigate |
| **P2** | Degraded performance or partial impact | p95 latency breach; single tenant site down; revalidation failures | **2 h** acknowledge · **1 business day** |
| **P3** | Minor defect, workaround exists | Non-critical UI bug; optional Lighthouse regression | Next sprint |

### 5.2 Roles

| Role | Owner |
|------|-------|
| Incident commander | Dr. Nathan Cole (Coordinator) |
| Infra / CI / cost | Dr. Daniel Moreau |
| Observability / Sentry | Dr. Mira Solano |
| Security / PII | Dr. Victor Lang, Dr. Patrick O'Brien |
| Payments | Dr. Owen Reilly |
| Comms (customer-facing) | Ms. Rebecca Flynn, Mia Thompson |

### 5.3 Response checklist

1. **Detect** — Sentry alert, synthetic probe, user report, Firebase status.
2. **Triage** — Assign P0–P3; open incident thread; pause deploys if P0/P1.
3. **Mitigate** — Rollback App Hosting release, disable feature flag, scale Functions, revert rules.
4. **Communicate** — Internal: Coordinator + domain expert; external (P0/P1): status note if customer impact > 15 min.
5. **Post-incident** — Blameless review within 5 business days; update runbook; consume error budget explicitly.

---

## 6. Post-launch monitoring checklist

Run **weekly** (Daniel Moreau) and **after each production deploy** (lane handoff to Nathan).

### 6.1 Sentry (Dr. Mira Solano)

- [ ] Error rate stable vs 7-day baseline — separate projects/DSNs: marketing, builder, site-renderer, Functions
- [ ] No PII in events — email, phone, full form payloads scrubbed (`beforeSend`)
- [ ] New issues from latest release triaged within 24 h
- [ ] `publishSite` success but revalidation non-2xx — breadcrumb alert configured
- [ ] Callable failures grouped by function name; 5xx spike → P1

### 6.2 Firebase console

- [ ] **App Hosting** — three backends healthy; last deploy SHA matches `main`
- [ ] **Functions** — error count, execution time p95 per Callable; cold start frequency
- [ ] **Firestore** — read/write spikes; index errors; rules deny spikes (misconfigured client?)
- [ ] **Authentication** — unusual sign-in patterns (builder)
- [ ] **App Check** — attestation failure rate < 5% (exclude dev debug tokens)
- [ ] **Storage** — upload volume vs ClamAV reject rate
- [ ] **Extensions** — Stripe Extension + Resize Images status green

### 6.3 Stripe dashboard (Dr. Owen Reilly)

- [ ] Successful checkout / subscription creates vs `provisionTenant` completions
- [ ] Failed payments and card errors — trend vs prior week
- [ ] Webhook delivery failures — zero tolerance for `checkout.session.completed`
- [ ] Disputes and refunds — flag if > 0 in rolling 7 days
- [ ] MRR / fee ratio within guardrails (§4.1)

### 6.4 Synthetic & product metrics

- [ ] Uptime probes green for `/`, `/get-started`, sample `{slug}` tenant, `/api/health`
- [ ] GA4: configurator events firing post-consent; anomaly on `signup_completed` drop
- [ ] Optional: `npm run test:lighthouse` on schedule — compare to QA-003 baselines in [`perf-budget.md`](perf-budget.md)

---

## 7. Related documents

| Document | Purpose |
|----------|---------|
| [`perf-budget.md`](perf-budget.md) | QA-003 Lighthouse + bundle gates |
| [`monorepo-layout-spec.md`](monorepo-layout-spec.md) | Turbo pipeline, CI invocation |
| [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) | Seed CI job, production approval |
| [`site-renderer-architecture.md`](../specs/site-renderer-architecture.md) | ISR, revalidation, form Callables |
| [`firestore-rules-spec.md`](../specs/firestore-rules-spec.md) | Callable hardening, rate limits |
| [`development-workflow-rules.md`](../process/development-workflow-rules.md) | Wave close quality gates |

---

## 8. Acceptance (DOC-009)

- [x] File exists at `docs/planning/finops-slos.md`
- [x] References [`perf-budget.md`](perf-budget.md) and QA-003 targets (§1.1, §3.3, §6.4)
- [x] Aligned with **Dr. Daniel Moreau** on FinOps SLOs, error budget, CI gates, and cost guardrails

**Coordinator handoff:** DOC-009 · Lane F · Expert: Dr. Daniel Moreau · Spec: project plan §1, Q5, Q24 · Cross-ref: Dr. Mira Solano (§5–6 observability)
