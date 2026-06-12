# Production runbook — cutover & incident response (PL-005)

**Ticket:** PL-005 (Wave 21, DOC lane)  
**Document owner:** Dr. Lena Moreau (documentation)  
**Domain experts:** Dr. Patrick O'Brien (GDPR / legal URLs) · Dr. Nathan Cole (coordinator gate)  
**Status:** Master cutover document — 12 June 2026  
**Gate:** [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.5

**Aligned with Dr. Lena Moreau on ops doc structure · Dr. Patrick O'Brien on GDPR legal URL verification · Dr. Nathan Cole on Wave 21 gate closure.**

---

## 1. Purpose

This is the **master production cutover and incident response document** for the first real customer on Firebase project **`codedpixels`**. It satisfies PL-005 acceptance: all §2.5 governance items.

| §2.5 # | Item | Section |
|--------|------|---------|
| 1 | Production runbook on disk | This file |
| 2 | Rollback — App Hosting + Functions | [§5](#5-rollback-procedures) |
| 3 | Incident contacts + Stripe/Firebase escalation | [§6](#6-incident-contacts-and-vendor-escalation) |
| 4 | GDPR — Privacy Policy + Terms live URLs on production domain | [§7](#7-gdpr-legal-url-verification) |
| 5 | Coordinator sign-off (Nathan Cole) | [§8](#8-coordinator-sign-off-wave-21-gate) |

**Sub-runbooks (PL-001–004):** Complete each before cutover. This document links them; detailed steps live in the lane deliverables.

| Ticket | Document | Prerequisites gate |
|--------|----------|-------------------|
| **PL-001** | [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) | §2.1 Infrastructure |
| **PL-002** | [`stripe-production-setup.md`](stripe-production-setup.md) | §2.2 Stripe |
| **PL-003** | [`production-seed-runbook.md`](production-seed-runbook.md) | §2.3 Seed data |
| **PL-004** | [`observability-production.md`](observability-production.md) | §2.4 Observability |

**Deploy entrypoint:** `npm run deploy:production` — ordered phases documented in PL-001 §3.

**Related:** [`finops-slos.md`](../planning/finops-slos.md) §5 (incident tiers) · [`README.md`](README.md) (ops index)

---

## 2. Go/no-go summary

All four sub-runbooks must be **green** before Nathan Cole signs §8 and the first non-smoke customer is invited.

| Gate | Owner | Sub-runbook acceptance table | Status |
|------|-------|------------------------------|--------|
| §2.1 Infrastructure | Dr. Daniel Moreau | PL-001 §5 | ☐ |
| §2.2 Stripe live | Dr. Owen Reilly | PL-002 §7 | ☐ |
| §2.3 Template + demo seeds | Dr. Rafael Ortiz / Daniel Moreau | PL-003 §10 | ☐ |
| §2.4 Observability | Dr. Mira Solano | PL-004 §7 | ☐ |
| §2.5 Governance | Dr. Patrick O'Brien / Nathan Cole | This doc §7–§8 | ☐ |

**Hard stop:** Active P0/P1 incident, deploy freeze ([`observability-production.md`](observability-production.md) §6), or any §2.1–§2.4 row open → **no cutover**.

---

## 3. Cutover sequence (first customer)

Execute in order after all go/no-go rows are green. Record git SHA, operator, and UTC timestamp in §8.

| Step | Action | Reference | Verify |
|------|--------|-----------|--------|
| 1 | Pre-deploy quality gates | PL-001 §3.1 | `lint`, `typecheck`, `test`, `test:rules`, `build` green |
| 2 | Ordered production deploy | PL-001 §3.2 | `npm run deploy:production` log archived |
| 3 | Post-deploy infra + DNS | PL-001 §3.3 | `verify:production:infra --live`, `verify:production:dns --live` |
| 4 | Stripe live mode + webhook health | PL-002 §4–§6 | Zero `checkout.session.completed` failures 7d |
| 5 | Production seeds (if not already run) | PL-003 §6 | Coordinator approval + seed logs |
| 6 | Sentry + synthetic probes | PL-004 §4 | `verify:production:probes --live` |
| 7 | Legal URLs on production domain | This doc §7 | Privacy + Terms HTTP 200, content spot-check |
| 8 | Smoke checkout → builder tenant | PL-002 §6 | Ops smoke email; subscription cancelled post-test |
| 9 | Coordinator sign-off | This doc §8 | Nathan Cole gate closed |
| 10 | First real customer invite | Product | After §8 only |

**Rollback trigger during cutover:** Any step fails verification after deploy → execute [§5](#5-rollback-procedures) before retrying.

---

## 4. Production surface map

Quick reference for incidents and rollbacks.

| Surface | URL / scope | Backend | Rollback |
|---------|-------------|---------|----------|
| Marketing | `https://codedpixels.co.uk` · `www` | App Hosting `marketing` | §5.1 |
| Builder | `https://app.codedpixels.co.uk` | App Hosting `builder` | §5.1 |
| Site-renderer | `https://{slug}.codedpixels.co.uk` | App Hosting `site-renderer` | §5.1 |
| Callables + triggers | `europe-west2` | Cloud Functions | §5.2 |
| Firestore / Storage rules | `codedpixels` | Firebase | §5.3 |
| Stripe Checkout + webhooks | Live mode | Extension + Functions | §5.4 · PL-002 |

**Legal pages (marketing only):**

| Page | Production URL |
|------|----------------|
| Privacy Policy | `https://codedpixels.co.uk/privacy` |
| Terms of Service | `https://codedpixels.co.uk/terms` |

---

## 5. Rollback procedures

**Incident commander:** Dr. Nathan Cole declares rollback. **FinOps:** Dr. Daniel Moreau executes or supervises CLI steps.

**Before rollback:** Note current App Hosting rollout SHA per backend and Functions deploy SHA. Open incident thread per [`finops-slos.md`](../planning/finops-slos.md) §5.3.

### 5.1 App Hosting rollback (all three backends)

Use when a bad frontend deploy causes 5xx, broken checkout UI, renderer errors, or probe failures on a single backend.

**Identify known-good SHA** (previous green `main` commit):

```bash
git fetch origin main
GOOD_SHA=$(git rev-parse origin/main~1)   # or explicit SHA from last green deploy log
echo "Rollback target: $GOOD_SHA"
```

**List current rollouts:**

```bash
PROJECT=codedpixels
for backend in marketing builder site-renderer; do
  echo "=== $backend ==="
  npx firebase apphosting:rollouts:list "$backend" --project "$PROJECT" | head -20
done
```

**Promote prior commit** (repeat per affected backend):

```bash
PROJECT=codedpixels
GOOD_SHA=<known-good-git-sha>

npx firebase apphosting:rollouts:create marketing --project "$PROJECT" --git-commit "$GOOD_SHA"
npx firebase apphosting:rollouts:create builder --project "$PROJECT" --git-commit "$GOOD_SHA"
npx firebase apphosting:rollouts:create site-renderer --project "$PROJECT" --git-commit "$GOOD_SHA"
```

**Alternative:** Firebase Console → App Hosting → select backend → Rollouts → **Roll back** to previous successful rollout.

**Post-rollback verification (within 15 min):**

```bash
npm run verify:production:probes -- --live
npm run verify:production:dns -- --live
```

Confirm Sentry release tags match rollback SHA ([`observability-production.md`](observability-production.md) §2.2).

| Pass | Criteria |
|------|----------|
| Probes | All four probe URLs return 2xx |
| Checkout | `https://codedpixels.co.uk/get-started` loads; no simulation banner in production |
| Builder | `https://app.codedpixels.co.uk` login page loads |
| Demo tenant | `https://sparkle-clean.codedpixels.co.uk/` returns 200 |

### 5.2 Cloud Functions rollback

Use when Callable 5xx spike, `publishSite` / `handleCheckoutCompleted` / `provisionTenant` regression, or bad Functions-only deploy.

**Checkout checkout at known-good commit:**

```bash
git fetch origin main
git checkout <known-good-sha>
npm ci
```

**Redeploy Functions only** (skip App Hosting):

```bash
npm run deploy:production -- --only=functions --skip-gates --skip-build
```

**Verify:**

```bash
npx firebase functions:list --project codedpixels
npx firebase functions:log --project codedpixels --limit 30
```

Spot-check: `onStripeCheckoutSessionUpdated` and critical Callables present in `europe-west2` with no error burst.

**Return to current branch** after incident:

```bash
git checkout main
```

### 5.3 Firestore rules + indexes rollback

Use when a rules deploy causes widespread `PERMISSION_DENIED` or accidental client writes.

```bash
git checkout <known-good-sha>
npm run deploy:production -- --only=firestore-rules,firestore-indexes --skip-gates --skip-build
```

**Caution:** Rules rollback does not undo data written under permissive rules. Escalate to Dr. Rafael Ortiz if data integrity is in question.

### 5.4 Stripe / Extension rollback

Payments regressions are **not** fixed by App Hosting rollback alone.

| Symptom | Action | Owner |
|---------|--------|-------|
| Wrong price IDs at checkout | Set `STRIPE_MODE=live`; verify catalogue — PL-002 §5 | Owen Reilly |
| Webhook signature failures | Re-enter `STRIPE_WEBHOOK_SECRET` in Extension config | Owen Reilly |
| Extension handler 5xx | Redeploy Extension via Console; check Functions logs | Daniel Moreau |
| Need to stop new signups | **Do not** delete Extension — pause marketing `/get-started` via deploy freeze; Stripe Dashboard → disable Checkout if emergency | Nathan Cole + Owen Reilly |

Full Stripe procedures: [`stripe-production-setup.md`](stripe-production-setup.md) §8.

### 5.5 Rollback decision matrix

| Failure mode | First action | Second action |
|--------------|--------------|---------------|
| Marketing 5xx / broken configurator | §5.1 `marketing` backend | §5.2 if Callables also failing |
| Builder login / dashboard broken | §5.1 `builder` backend | Check Auth console (PL-001 §2.1 #7) |
| Customer / demo sites 5xx | §5.1 `site-renderer` backend | Check `publishSite` + revalidation (PL-004) |
| Signup/checkout not provisioning | §5.2 Functions + PL-002 webhook check | §5.4 Stripe |
| Firestore permission errors spike | §5.3 rules rollback | Schema review — Rafael Ortiz |
| PII in Sentry | **Freeze all deploys** — no rollback until scrub verified | Mira Solano + Patrick O'Brien |

---

## 6. Incident contacts and vendor escalation

Source: [`finops-slos.md`](../planning/finops-slos.md) §5.2 · [`observability-production.md`](observability-production.md) §6.

### 6.1 Internal on-call roster

| Role | Owner | Scope | Primary channel |
|------|-------|-------|-----------------|
| **Incident commander** | Dr. Nathan Cole | Declares P0–P3, deploy freeze, rollback, lift | `#codedpixels-ops` (or coordinator direct) |
| Infra / CI / cost | Dr. Daniel Moreau | Deploy, GCP billing, App Hosting, ordered deploy | `#codedpixels-ops` |
| Observability / Sentry | Dr. Mira Solano | DSN projects, PII scrubbing, probe alerts | Sentry alert email + `#codedpixels-ops` |
| Security / PII | Dr. Victor Lang, Dr. Patrick O'Brien | Rules breaches, GDPR, legal URL incidents | Direct to IC + security thread |
| Payments | Dr. Owen Reilly | Stripe live mode, webhooks, catalogue | `#codedpixels-ops` |
| Firestore / schema | Dr. Rafael Ortiz | Data integrity, seed issues | `#codedpixels-ops` |
| Customer comms | Ms. Rebecca Flynn, Mia Thompson | External status (P0/P1 > 15 min) | IC approval required |

**Response targets:** P0 — 15 min ack · 1 h mitigate · P1 — 30 min ack · 4 h mitigate ([`finops-slos.md`](../planning/finops-slos.md) §5.1).

### 6.2 Incident response flow

1. **Detect** — Sentry, `verify:production:probes --live`, Firebase metrics, Stripe dashboard, user report.
2. **Triage** — IC assigns tier; open incident thread with timestamp, impact, current SHA.
3. **Pause** — Post: *"Deploy freeze — P{n} — {summary}"* when P0/P1 or error budget trigger ([`observability-production.md`](observability-production.md) §6.3).
4. **Mitigate** — [§5](#5-rollback-procedures) rollback matrix.
5. **Lift** — Probes green + Sentry stable 30 min → IC resumes deploys.
6. **Post-incident** — Blameless review within 5 business days; update this runbook if gaps found.

### 6.3 Firebase / Google Cloud support escalation

| Tier | When | Path |
|------|------|------|
| **Self-serve** | Probe failure, deploy error, console misconfiguration | [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) · Firebase status page |
| **Firebase support** | Blaze project outage, App Hosting rollout stuck, Auth/App Check platform issue | [Firebase Console](https://console.firebase.google.com/project/codedpixels/support) → Support · include project ID `codedpixels`, region `europe-west2`, backend name, rollout ID |
| **Google Cloud support** | Billing anomaly, IAM, Secret Manager, underlying GCP outage | [Cloud Console Support](https://console.cloud.google.com/support?project=codedpixels) · reference Firebase case if linked |
| **Status pages** | Regional or global outage suspected | [Firebase Status](https://status.firebase.google.com/) · [Google Cloud Status](https://status.cloud.google.com/) |

**Escalation package (attach to vendor ticket):**

- UTC timestamp and duration of impact
- Affected URLs (§4 table)
- App Hosting backend + rollout SHA (`apphosting:rollouts:list`)
- Functions name + recent log excerpt (`firebase functions:log`)
- Sentry issue link (no PII in ticket body)

### 6.4 Stripe support escalation

| Tier | When | Path |
|------|------|------|
| **Dashboard self-serve** | Webhook delivery failures, test/live mode mismatch | Stripe Dashboard → **Developers → Webhooks** · PL-002 §4 |
| **Stripe Support** | Live payment failures, Extension sync broken, dispute spike | Stripe Dashboard → **Help** → contact support · **live mode** context · webhook endpoint ID |
| **Emergency — stop charges** | Fraud or catastrophic misconfiguration | IC + Owen Reilly → disable Checkout / pause subscriptions in Dashboard; deploy freeze |

**Escalation package:**

- Stripe event ID (`checkout.session.completed` or failing event type)
- Firebase Extension version and project `codedpixels`
- Firestore path `customers/{uid}/checkout_sessions/{id}` state (no card data)
- Whether impact is all checkouts or single customer

---

## 7. GDPR legal URL verification

**Expert:** Dr. Patrick O'Brien · Source: [`cookie-consent-legal-spec.md`](../planning/cookie-consent-legal-spec.md) · DOC-002 pages in `apps/marketing/app/privacy` and `apps/marketing/app/terms`.

Privacy Policy and Terms must be **live on the production marketing domain** before any production email capture or checkout consent checkbox ([`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.5 #4).

### 7.1 Required production URLs

| Document | Canonical URL | Also verify |
|----------|---------------|-------------|
| Privacy Policy | `https://codedpixels.co.uk/privacy` | `https://www.codedpixels.co.uk/privacy` (redirect or 200) |
| Terms of Service | `https://codedpixels.co.uk/terms` | `https://www.codedpixels.co.uk/terms` (redirect or 200) |

**Must not** serve legal pages only on `localhost`, staging hostnames, or `app.codedpixels.co.uk` for marketing consent flows. Get Started and waitlist forms on `codedpixels.co.uk` link to **relative** `/privacy` and `/terms` — they resolve to the canonical URLs above.

### 7.2 Automated HTTP checks

Run after marketing App Hosting deploy (PL-001 §2.1 #2) and before §8 sign-off.

```bash
# HTTP status — expect 200 on apex
for path in /privacy /terms; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://codedpixels.co.uk${path}")
  echo "codedpixels.co.uk${path} → HTTP ${code}"
done

# www — expect 200 or 301/308 to apex
for path in /privacy /terms; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://www.codedpixels.co.uk${path}")
  echo "www.codedpixels.co.uk${path} → HTTP ${code}"
done
```

Pass: apex returns **200**; `www` returns **200** or redirects to apex with legal content reachable.

### 7.3 Content spot-check (manual)

| Check | Command / action | Pass |
|-------|------------------|------|
| Privacy title present | `curl -s https://codedpixels.co.uk/privacy \| grep -i 'Privacy Policy'` | Match in HTML |
| Terms title present | `curl -s https://codedpixels.co.uk/terms \| grep -i 'Terms'` | Match in HTML |
| Last updated visible | View page — DOC-002 `LAST_UPDATED` | Date shown on page |
| Cookie section linkable | `https://codedpixels.co.uk/privacy#cookies` returns 200 | Cookie banner link works |
| Get Started consent links | Open `https://codedpixels.co.uk/get-started` | Privacy + Terms links open correct production URLs |
| Sitemap includes legal | `curl -s https://codedpixels.co.uk/sitemap.xml \| grep -E 'privacy|terms'` | Both paths listed |
| No staging hostname in HTML | `curl -s https://codedpixels.co.uk/privacy \| grep -i localhost` | Zero matches |

### 7.4 GDPR subprocessors and placeholders

Legal pages must disclose Firebase, Stripe, SendGrid, reCAPTCHA, GA4 per [`cookie-consent-legal-spec.md`](../planning/cookie-consent-legal-spec.md). Before first customer:

| Placeholder | Resolution | Owner |
|-------------|------------|-------|
| `[PRIVACY_EMAIL]` | Production inbox (e.g. `privacy@codedpixels.co.uk`) | Patrick O'Brien |
| Company legal entity + address | `LEGAL_PLACEHOLDERS` in marketing app | Rebecca Flynn / Patrick O'Brien |

Patrick O'Brien signs §7.5 when URLs and content are production-ready.

### 7.5 §2.5 item 4 — sign-off

| # | Item | Verified by | Date | ☐ |
|---|------|-------------|------|---|
| 1 | `https://codedpixels.co.uk/privacy` HTTP 200 | | | ☐ |
| 2 | `https://codedpixels.co.uk/terms` HTTP 200 | | | ☐ |
| 3 | `www` host legal URLs redirect or 200 | | | ☐ |
| 4 | Get Started / waitlist consent links resolve on production domain | | | ☐ |
| 5 | Sitemap lists `/privacy` and `/terms` | | | ☐ |
| 6 | Legal placeholders resolved or tracked with owner | | | ☐ |

---

## 8. Coordinator sign-off (Wave 21 gate)

**Only Dr. Nathan Cole** closes Wave 21 after PL-001–PL-005 acceptance tables are green and this section is completed.

Copy the block below into wave handoff notes or `project-status.md` when committing Wave 21.

```markdown
## Wave 21 — Production launch gate (PL-001–PL-005)

| Field | Value |
|-------|-------|
| Cutover date (UTC) | YYYY-MM-DD HH:MM |
| Production project | `codedpixels` |
| Deploy SHA (`main`) | `________` |
| Operator / FinOps | |
| Incident commander | Dr. Nathan Cole |

### Sub-runbook acceptance

| Ticket | § gate | All rows green | Evidence link / log |
|--------|--------|----------------|---------------------|
| PL-001 | §2.1 Infrastructure | ☐ | Deploy log + `verify:production:infra --live` |
| PL-002 | §2.2 Stripe | ☐ | PL-002 §7 + smoke checkout |
| PL-003 | §2.3 Seeds | ☐ | PL-003 §9 evidence template |
| PL-004 | §2.4 Observability | ☐ | `verify:production:probes --live` |
| PL-005 | §2.5 Governance | ☐ | This runbook §5–§7 |

### §2.5 governance (PL-005)

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | `docs/ops/production-runbook.md` on disk | ☐ PASS | File at commit SHA |
| 2 | Rollback procedure documented | ☐ PASS | Runbook §5 |
| 3 | Incident contacts + vendor escalation | ☐ PASS | Runbook §6 |
| 4 | Privacy + Terms production URLs | ☐ PASS | Runbook §7 checks |
| 5 | Coordinator sign-off | ☐ PASS | This table |

### Post-cutover verification (within 24 h)

- [ ] `npm run verify:production:probes -- --live` — all green
- [ ] FinOps §6.2 Firebase console checklist started
- [ ] No open P0/P1 incidents
- [ ] First customer invite only after this sign-off

### Expert sign-off

| Expert | Domain | Verdict | Date |
|--------|--------|---------|------|
| Dr. Daniel Moreau | FinOps / PL-001 deploy | ☐ | |
| Dr. Owen Reilly | Stripe PL-002 | ☐ | |
| Dr. Rafael Ortiz | Seeds PL-003 | ☐ | |
| Dr. Mira Solano | Observability PL-004 | ☐ | |
| Dr. Patrick O'Brien | GDPR legal URLs §7 | ☐ | |
| **Dr. Nathan Cole** | **Wave 21 coordinator gate** | ☐ | |

**Coordinator declaration:** I confirm Wave 21 production launch prerequisites §2.1–§2.5 are satisfied and authorize first real customer provisioning.

**Nathan Cole — Coordinator** · Date: __________
```

---

## 9. PL-005 acceptance summary

| §2.5 | Item | Status |
|------|------|--------|
| 1 | Production runbook on disk | ☐ |
| 2 | Rollback App Hosting + Functions | ☐ |
| 3 | Incident contacts + Stripe/Firebase escalation | ☐ |
| 4 | GDPR Privacy + Terms production URLs | ☐ |
| 5 | Coordinator sign-off template | ☐ |

**Recorded by:** _______________ **Date:** _______________

---

## 10. References

- [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) — Wave 21 gate checklist
- [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) — deploy order, DNS, App Check
- [`stripe-production-setup.md`](stripe-production-setup.md) — live Stripe + webhooks
- [`production-seed-runbook.md`](production-seed-runbook.md) — template + demo seeds
- [`observability-production.md`](observability-production.md) — Sentry, probes, deploy pause
- [`finops-slos.md`](../planning/finops-slos.md) — SLOs, error budget, incident tiers
- [`cookie-consent-legal-spec.md`](../planning/cookie-consent-legal-spec.md) — legal page contract
- `scripts/deploy-production.mjs` — ordered deploy script
- `scripts/verify-production-probes.mjs` — synthetic probe runner
