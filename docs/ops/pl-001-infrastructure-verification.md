# PL-001 — Production infrastructure verification

**Ticket:** PL-001 (Wave 21, INF lane)  
**Owner:** Dr. Daniel Moreau (FinOps / CI)  
**Gate:** [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.1  
**Related:** [`finops-slos.md`](../planning/finops-slos.md) §3.4 deploy gates · [`monorepo-layout-spec.md`](../planning/monorepo-layout-spec.md) §3.1

**Aligned with Dr. Daniel Moreau on FinOps deploy order and post-deploy checks.**

---

## 1. Overview

This runbook covers all **§2.1 Infrastructure** items for the first production cutover on Firebase project **`codedpixels`**. Each item has either an **automated script** or a **documented manual step** with pass/fail criteria.

| Script | Purpose |
|--------|---------|
| `npm run deploy:production` | Ordered deploy: rules → indexes → storage → functions → App Hosting |
| `npm run verify:production:infra` | Offline repo + optional `--live` Firebase checks |
| `npm run verify:production:dns` | DNS checklist; `--live` runs `dig` |

Save deploy CLI output as the **ordered deploy log** required for §2.1 #4.

---

## 2. §2.1 checklist

### #1 — GCP project `codedpixels` with `europe-west2` default

| Step | Type | Action | Pass |
|------|------|--------|------|
| 1.1 | Auto | `.firebaserc` default project = `codedpixels` | `npm run verify:production:infra` PASS |
| 1.2 | Manual | [Firebase Console](https://console.firebase.google.com/project/codedpixels/overview) → Blaze plan active | Billing enabled |
| 1.3 | Manual | Cloud Functions region = **europe-west2** (see `functions/src/index.ts` `setGlobalOptions`) | All Callables in London |
| 1.4 | Manual | App Hosting backends created with **primary region europe-west2** | Console → App Hosting → each backend → Region |

**One-time backend creation (if not yet provisioned):**

```bash
# Per backend — connect GitHub repo or use firebase deploy --only apphosting
npx firebase apphosting:backends:create \
  --project codedpixels \
  --backend marketing \
  --primary-region europe-west2 \
  --root-dir apps/marketing

npx firebase apphosting:backends:create \
  --project codedpixels \
  --backend builder \
  --primary-region europe-west2 \
  --root-dir apps/builder

npx firebase apphosting:backends:create \
  --project codedpixels \
  --backend site-renderer \
  --primary-region europe-west2 \
  --root-dir apps/site-renderer
```

---

### #2 — Three App Hosting backends from `main` SHA

| Backend | Package | Domains | Config |
|---------|---------|---------|--------|
| `marketing` | `@codedpixels/marketing` | `codedpixels.co.uk`, `www.codedpixels.co.uk` | `apps/marketing/apphosting.yaml` |
| `builder` | `@codedpixels/builder` | `app.codedpixels.co.uk` | `apps/builder/apphosting.yaml` |
| `site-renderer` | `@codedpixels/site-renderer` | `*.codedpixels.co.uk` | `apps/site-renderer/apphosting.yaml` |

| Step | Type | Action | Pass |
|------|------|--------|------|
| 2.1 | Auto | `firebase.json` lists three `apphosting` backends | `verify:production:infra` |
| 2.2 | Manual | Deploy from merged `main` commit | `git rev-parse origin/main` matches Hosting rollout SHA |
| 2.3 | Live | `npx firebase apphosting:backends:list --project codedpixels` | Three backends listed |
| 2.4 | Live | `npx firebase apphosting:rollouts:list marketing --project codedpixels` | Latest rollout commit = target SHA |

**Git-connected rollouts (alternative to CLI deploy):**

```bash
git fetch origin main
SHA=$(git rev-parse origin/main)
npx firebase apphosting:rollouts:create marketing --project codedpixels --git-commit "$SHA"
npx firebase apphosting:rollouts:create builder --project codedpixels --git-commit "$SHA"
npx firebase apphosting:rollouts:create site-renderer --project codedpixels --git-commit "$SHA"
```

---

### #3 — DNS → correct backends

| Hostname | Backend | Notes |
|----------|---------|-------|
| `codedpixels.co.uk` | marketing | Apex — A/AAAA or ALIAS per App Hosting wizard |
| `www.codedpixels.co.uk` | marketing | CNAME or redirect to apex |
| `app.codedpixels.co.uk` | builder | CNAME to builder custom domain target |
| `*.codedpixels.co.uk` | site-renderer | Wildcard CNAME — probe `sparkle-clean.codedpixels.co.uk` |

| Step | Type | Action | Pass |
|------|------|--------|------|
| 3.1 | Auto | Offline checklist | `npm run verify:production:dns` |
| 3.2 | Live | DNS resolution | `npm run verify:production:dns -- --live` |
| 3.3 | Manual | Firebase Console → App Hosting → Custom domains | All domains **Connected** (TLS active) |
| 3.4 | Manual | Spot-check HTTP 200 | `curl -I https://codedpixels.co.uk` · `https://app.codedpixels.co.uk` · `https://sparkle-clean.codedpixels.co.uk` |

---

### #4 — Firestore rules + indexes **before** Functions

| Step | Type | Action | Pass |
|------|------|--------|------|
| 4.1 | Auto | Deploy script order | `scripts/deploy-production.mjs` phases |
| 4.2 | Deploy | `npm run deploy:production` (or `--dry-run` first) | Log shows rules → indexes → storage → functions → apphosting |
| 4.3 | Manual | Archive deploy log | Timestamped output attached to wave handoff |

**Partial deploy (rules/indexes only):**

```bash
npm run deploy:production -- --skip-gates --skip-build --only=firestore-rules,firestore-indexes,storage-rules
```

---

### #5 — Cloud Functions deployed; secrets configured

**Callables (must all be deployed in `europe-west2`):**

- `submitSignup`, `submitSiteImportWaitlist`, `publishSite`, `submitLead`
- `manageProduct`, `createPortalSession`, `createCheckoutSession`, `createAssetUpload`

**Triggers (deploy with Functions):** `onStripeCheckoutSessionUpdated`, `onAssetObjectFinalized`

| Step | Type | Action | Pass |
|------|------|--------|------|
| 5.1 | Auto | Callable list matches `functions/src/index.ts` | `verify:production:infra` |
| 5.2 | Live | `npx firebase functions:list --project codedpixels --json` | All Callables present |
| 5.3 | Manual | Functions logs clean after deploy | `npx firebase functions:log --project codedpixels` |

**Required runtime configuration (Secret Manager / Functions env — never in repo):**

| Secret / env | Used by | Set via |
|--------------|---------|---------|
| `RECAPTCHA_SECRET_KEY` | `submitLead` | `firebase functions:secrets:set RECAPTCHA_SECRET_KEY` |
| `REVALIDATE_SECRET` | `publishSite` → site-renderer ISR | Secret Manager + Functions binding |
| `SITE_RENDERER_URL` | `publishSite` revalidation caller | e.g. `https://sparkle-clean.codedpixels.co.uk` (platform base URL) |
| `STRIPE_API_KEY` | Stripe Extension + checkout | Extension install wizard |
| `STRIPE_WEBHOOK_SECRET` | Extension webhook | Extension install wizard |

**Must NOT be set in production:**

| Env | Reason |
|-----|--------|
| `DISABLE_APP_CHECK` | Disables Callable App Check (B9-001) |
| `DISABLE_RECAPTCHA` | Disables bot protection on public forms |

---

### #6 — App Check enforced; debug tokens disabled (B9-001)

| Step | Type | Action | Pass |
|------|------|--------|------|
| 6.1 | Auto | `functions/src/lib/callableOptions.ts` enforces App Check when `DISABLE_APP_CHECK` unset | `verify:production:infra` |
| 6.2 | Manual | Firebase Console → App Check → Apps | reCAPTCHA Enterprise / Play Integrity registered per web app |
| 6.3 | Manual | **Remove** debug tokens from production apps | No debug provider in production builds |
| 6.4 | Manual | Client env set per app | `NEXT_PUBLIC_FIREBASE_APP_CHECK_RECAPTCHA_SITE_KEY` in App Hosting secrets |
| 6.5 | Live | App Check metrics | Attestation failure rate **< 5%** (finops-slos.md §6.2) |

Reference: B9-001 — `enforceAppCheck: true` on marketing Callables; `submitLead` uses `submitLeadCallableOptions`.

---

### #7 — Firebase Auth for builder (Q57)

| Step | Type | Action | Pass |
|------|------|--------|------|
| 7.1 | Manual | Console → Authentication → Sign-in method | **Email/Password** and/or **Email link (magic link)** enabled |
| 7.2 | Manual | Authorized domains include `app.codedpixels.co.uk` | Listed under Auth → Settings |
| 7.3 | Manual | Smoke test | Sign in at `https://app.codedpixels.co.uk` after checkout provisioning |
| 7.4 | Manual | Production apps use real Firebase config | `NEXT_PUBLIC_USE_MOCK_AUTH` unset; valid `NEXT_PUBLIC_FIREBASE_*` in builder App Hosting secrets |

---

## 3. Production deploy procedure

### 3.1 Pre-deploy (Nathan / FinOps)

```bash
npm ci
npm run lint && npm run typecheck && npm test && npm run test:rules
npm run build
npm run verify:production:infra
```

### 3.2 Deploy

```bash
# Dry run first
npm run deploy:production -- --dry-run

# Full ordered deploy
npm run deploy:production

# Or skip gates when CI already verified the SHA
npm run deploy:production -- --skip-gates --skip-build
```

### 3.3 Post-deploy verification

```bash
npm run verify:production:infra -- --live
npm run verify:production:dns -- --live
```

Complete **manual** rows in §2 above. Run FinOps §6.2 Firebase console checklist within 24 h.

---

## 4. Rollback (pointer)

Full rollback steps live in PL-005 `docs/ops/production-runbook.md`. Quick reference:

- **App Hosting:** `firebase apphosting:rollouts:list <backend>` → roll back to prior commit
- **Functions:** redeploy previous git SHA with `npm run deploy:production -- --only=functions --skip-gates --skip-build`
- **Rules:** revert commit → `npm run deploy:production -- --only=firestore-rules,firestore-indexes --skip-gates --skip-build`

---

## 5. Acceptance (PL-001)

| §2.1 item | Automated | Documented manual | Status |
|-----------|-----------|-------------------|--------|
| #1 GCP project + region | `verify:production:infra` | Console Blaze + region | ☐ |
| #2 Three backends + main SHA | `verify:production:infra --live` | Rollout SHA match | ☐ |
| #3 DNS | `verify:production:dns -- --live` | Custom domains Connected | ☐ |
| #4 Ordered deploy | `deploy-production.mjs` + log | Archive CLI output | ☐ |
| #5 Functions + secrets | `verify:production:infra --live` | Secret Manager audit | ☐ |
| #6 App Check | `verify:production:infra` | Debug tokens removed | ☐ |
| #7 Builder Auth | — | Console + smoke login | ☐ |

**Expert:** Dr. Daniel Moreau · **Coordinator handoff:** Dr. Nathan Cole
