# PL-003 — Production seed runbook

**Ticket:** PL-003 (Wave 21, INF lane)  
**Owner:** Dr. Daniel Moreau (FinOps / CI)  
**Domain expert:** Dr. Rafael Ortiz (Firestore schema)  
**Gate:** [`production-launch-prerequisites.md`](../planning/production-launch-prerequisites.md) §2.3  
**Related:** [`template-seeding-ci-spec.md`](../planning/template-seeding-ci-spec.md) · [`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md) §3–§5 · [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md)

**Aligned with Dr. Rafael Ortiz on Firestore seed shape (`defaultPage.sections`, `contentHash`) · Dr. Daniel Moreau on production manual approval gate.**

---

## 1. Purpose

Operational procedure for the **first production seed** of:

1. **Template catalogue** — `templates/{templateId}` from `packages/templates/seeds/` (`npm run seed:templates`)
2. **Platform demo tenants** — one published site per library template for marketing preview links (`npm run seed:template-demos`)

This runbook satisfies PL-003 acceptance: all §2.3 items documented with verification commands and a first-run evidence template.

| §2.3 # | Item | Section |
|--------|------|---------|
| 1 | `npm run seed:templates` — manual approval gate passed | [§4](#4-manual-approval-gate) · [§6](#6-production-seed-procedure) |
| 2 | `npm run seed:template-demos` — demo tenants live, preview URLs 200 | [§6](#6-production-seed-procedure) · [§7](#7-verification-commands) |
| 3 | `PLATFORM_DEMO_OWNER_UID` set in production env | [§5](#5-environment-variables) |
| 4 | Demo tenants `noindex` on production subdomains | [§7.4](#74-noindex-verification) |

---

## 2. Prerequisites

Complete **before** running production seeds:

| Prerequisite | Verify |
|--------------|--------|
| PL-001 §2.1 infrastructure green | [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) acceptance table |
| Firestore rules deployed (templates client write denied) | B1-002 rules tests green; rules live on `codedpixels` |
| **site-renderer** App Hosting backend live | `curl -sI -o /dev/null -w '%{http_code}' https://sparkle-clean.codedpixels.co.uk` → `404` or `200` (404 expected **before** seed; 200 **after**) |
| Wildcard DNS `*.codedpixels.co.uk` → site-renderer | PL-001 §2.1 #3 |
| Merged `main` SHA includes current `packages/templates/seeds/` | `git fetch origin main && git rev-parse origin/main` |
| Coordinator (Nathan Cole) approval for production write | [§4](#4-manual-approval-gate) |

**Order:** Always run `seed:templates` **before** `seed:template-demos`. Demo seed reads `templates/{templateId}.contentHash` and fails if catalogue is missing.

---

## 3. Service account and credentials

Production seeds use the Firebase Admin SDK (bypasses Firestore rules). Use a dedicated **template-seeder** service account — not a human admin key.

| Item | Value |
|------|-------|
| SA name (recommended) | `template-seeder@codedpixels.iam.gserviceaccount.com` |
| IAM role | `roles/datastore.user` on Firestore only |
| Key storage | GitHub Actions secret `FIREBASE_SERVICE_ACCOUNT` (future CI) **or** local ops workstation via `GOOGLE_APPLICATION_CREDENTIALS` |
| Must **not** have | Auth admin, Storage, Hosting, or broad `Editor` |

**One-time SA creation (GCP Console or gcloud):**

```bash
gcloud iam service-accounts create template-seeder \
  --project=codedpixels \
  --display-name="Template catalogue + demo tenant seeder"

gcloud projects add-iam-policy-binding codedpixels \
  --member="serviceAccount:template-seeder@codedpixels.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud iam service-accounts keys create ./template-seeder-key.json \
  --iam-account=template-seeder@codedpixels.iam.gserviceaccount.com

# Ops workstation only — never commit the JSON file
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/template-seeder-key.json"
```

Rotate or destroy the key file after the run if stored on an ephemeral CI runner.

---

## 4. Manual approval gate

Per [`template-seeding-ci-spec.md`](../planning/template-seeding-ci-spec.md) §6.1 and [`finops-slos.md`](../planning/finops-slos.md) §4:

| Environment | Trigger | Approval |
|-------------|---------|----------|
| Staging | Auto on merge to `main` (when workflow exists) | None |
| **Production** | Manual ops run **or** GitHub Environment `production` on seed workflow | **Required** — Coordinator + FinOps |

**Production first-run gate checklist (Coordinator signs off before `seed:templates`):**

| # | Gate | Owner | Pass |
|---|------|-------|------|
| G1 | PL-001 deploy complete; site-renderer wildcard DNS connected | FinOps | ☐ |
| G2 | `npm run validate:templates` green on target `main` SHA | CI / ops | ☐ |
| G3 | `manifest.seedVersion` bumped if seed content changed (§5.2 idempotency) | Author / reviewer | ☐ |
| G4 | No open P0/P1 blocking production writes | Coordinator | ☐ |
| G5 | Rollback understood — re-seed is idempotent; demo upsert does not delete tenants | FinOps | ☐ |

Record approver name, date, and `main` SHA in [§9 Evidence template](#9-first-run-evidence-template).

**Note:** `.github/workflows/template-seeds.yml` currently runs `validate:templates` on PR/main and emulator thumbnail generation on `workflow_dispatch`. Production Firestore writes are **manual** via this runbook until a `workflow_dispatch` + GitHub Environment `production` job is added (same pattern as template-seeding-ci-spec §6.1).

---

## 5. Environment variables

Set these for **both** seed commands when targeting production Firestore:

| Variable | Required | Purpose | Production value |
|----------|----------|---------|------------------|
| `FIREBASE_PROJECT_ID` | Recommended | Admin SDK project | `codedpixels` |
| `GOOGLE_APPLICATION_CREDENTIALS` | **Yes** (non-emulator) | Path to template-seeder SA JSON | Ops workstation path (never in repo) |
| `PLATFORM_DEMO_OWNER_UID` | **Yes** for `seed:template-demos` | `companies.ownerUid` for all demo tenants | Firebase Auth UID — see §5.1 |
| `REVALIDATE_SECRET` | Optional | On-demand ISR after demo content update | Same secret as `publishSite` / site-renderer |
| `SITE_RENDERER_REVALIDATE_URL` | Optional | Revalidate endpoint base | `https://sparkle-clean.codedpixels.co.uk` (any live demo subdomain works) |

**Do not set** `FIRESTORE_EMULATOR_HOST` for production runs.

### 5.1 `PLATFORM_DEMO_OWNER_UID` — production setup

Demo tenants are owned by platform ops, not customers ([`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md) §3.4).

| Step | Action |
|------|--------|
| 5.1.1 | Firebase Console → **Authentication** → create a dedicated user e.g. `platform-demo@codedpixels.internal` (email/password; password in Secret Manager, not repo) |
| 5.1.2 | Copy the user's **UID** from the Auth user record |
| 5.1.3 | Export as `PLATFORM_DEMO_OWNER_UID` for the seed run |
| 5.1.4 | Confirm seed log prints the UID (script uses env, not default `demo-platform-owner`) |

**Emulator default (local only):** `demo-platform-owner` — see `packages/templates/scripts/seed-demos.mjs`.

**Verify UID applied after seed:**

```bash
# Replace SPARKLE_CLEAN with any library templateId; companyId is demo-{templateId}
npx firebase firestore:get companies/demo-sparkle-clean --project codedpixels
# Expect: ownerUid == $PLATFORM_DEMO_OWNER_UID, isPlatformDemo: true
```

Or Firebase Console → Firestore → `companies/demo-sparkle-clean` → fields `ownerUid`, `isPlatformDemo`.

---

## 6. Production seed procedure

Run from repo root on the approved `main` SHA.

### 6.1 Pre-seed validation

```bash
npm ci
npm run validate:templates
```

Pass criteria: exit code `0`; all 11+ seed files match `lib/templates.ts` metadata; Zod validation clean.

### 6.2 Seed template catalogue

```bash
export FIREBASE_PROJECT_ID=codedpixels
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/template-seeder-key.json

npm run seed:templates
```

**Expected output (first run):**

```
upserted sparkle-clean seedVersion=N
…
seed:templates — done (upserted 15, skipped 0)
```

**Idempotent re-run:** `skipped` count equals unchanged templates; `upserted 0` when `contentHash` matches.

**Archive** full stdout as evidence (§2.3 #1).

### 6.3 Seed platform demo tenants

```bash
export FIREBASE_PROJECT_ID=codedpixels
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/template-seeder-key.json
export PLATFORM_DEMO_OWNER_UID="<production-auth-uid>"

# Optional — refresh ISR when template contentHash changes on re-seed
export REVALIDATE_SECRET="<from-secret-manager>"
export SITE_RENDERER_REVALIDATE_URL="https://sparkle-clean.codedpixels.co.uk"

npm run seed:template-demos
```

**Expected output (first run):**

```
created demo tenant sparkle-clean → demo-sparkle-clean
…
seed:template-demos — done (created 14, updated 0, skipped 0, missing-template 0)
```

Demo count follows `RESERVED_TEMPLATE_SLUGS` in `packages/shared-types/src/constants/reserved-template-slugs.ts` (currently **14** library templates; excludes `custom`). §2.3 originally referenced 10 — verify count matches the constant at run time.

**Failure modes:**

| Symptom | Fix |
|---------|-----|
| `missing-template N` / exit 1 | Run `seed:templates` first; ensure catalogue docs exist |
| `Template … missing contentHash` | Re-run `seed:templates` |
| `PERMISSION_DENIED` | Check SA has `roles/datastore.user` on `codedpixels` |
| Preview 404 after seed | Confirm `slugs/{templateId}` docs and site-renderer deploy (PL-001 #2–#3) |

---

## 7. Verification commands

### 7.1 Firestore catalogue (§2.3 #1)

```bash
npx firebase firestore:get templates/sparkle-clean --project codedpixels
```

Expect fields: `name`, `defaultPage.sections` (array), `contentHash`, `seedVersion`, `updatedAt`.

Quick count (requires `gcloud` + application default credentials):

```bash
# List template doc IDs — should include all manifest entries except verification spot-check
npx firebase firestore:get templates/custom --project codedpixels
```

### 7.2 Demo tenant documents (§2.3 #2)

For each library `templateId` in `RESERVED_TEMPLATE_SLUGS`:

| Firestore path | Expected |
|----------------|----------|
| `companies/demo-{templateId}` | `isPlatformDemo: true`, `slug: {templateId}`, `status: active` |
| `companies/demo-{templateId}/sites/main` | `status: published`, `templateId` set |
| `slugs/{templateId}` | `{ companyId: demo-{templateId}, siteId: main }` |

Spot-check:

```bash
npx firebase firestore:get companies/demo-sparkle-clean --project codedpixels
npx firebase firestore:get slugs/sparkle-clean --project codedpixels
```

### 7.3 Preview URLs HTTP 200 (§2.3 #2)

Production demo URLs: `https://{templateId}.codedpixels.co.uk/`

**Batch check** (bash — run from repo root):

```bash
SLUGS=(
  sparkle-clean trade-pro serenity-spa glow-studio apex-legal
  corner-shop the-local learn-hub business-core startup-launch
  wellness-clinic clear-accounting focus-photography fit-hub
)

FAIL=0
for slug in "${SLUGS[@]}"; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://${slug}.codedpixels.co.uk/")
  if [ "$code" != "200" ]; then
    echo "FAIL ${slug} → HTTP ${code}"
    FAIL=$((FAIL + 1))
  else
    echo "OK   ${slug} → HTTP 200"
  fi
done
echo "Failed: ${FAIL} / ${#SLUGS[@]}"
[ "$FAIL" -eq 0 ]
```

Pass: all slugs return **HTTP 200**; body contains rendered template sections (hero, etc.).

### 7.4 `noindex` verification (§2.3 #4)

Site-renderer sets `robots: { index: false, follow: false }` when `companies.isPlatformDemo === true` ([`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md) §5.1).

**HTTP header check:**

```bash
curl -sI "https://sparkle-clean.codedpixels.co.uk/" | grep -i 'x-robots-tag'
# Expect: X-Robots-Tag: noindex, nofollow
```

**HTML meta check:**

```bash
curl -s "https://sparkle-clean.codedpixels.co.uk/" | grep -i 'noindex'
# Expect: <meta name="robots" content="noindex, nofollow"> (or equivalent)
```

**Batch noindex check:**

```bash
SLUGS=(sparkle-clean trade-pro glow-studio startup-launch)  # spot-check subset or full list
for slug in "${SLUGS[@]}"; do
  if curl -sI "https://${slug}.codedpixels.co.uk/" | grep -qi 'noindex'; then
    echo "OK   ${slug} — noindex present"
  else
    echo "FAIL ${slug} — noindex missing"
  fi
done
```

**Contrast (customer tenant):** After first real customer site is live, confirm a **non-demo** subdomain does **not** emit `noindex` (sanity check only — not a §2.3 gate item).

### 7.5 `PLATFORM_DEMO_OWNER_UID` in seed log (§2.3 #3)

Production run must **not** print the emulator default message:

```
seed:template-demos:emulator — using default PLATFORM_DEMO_OWNER_UID=demo-platform-owner
```

That line appears only for `seed:template-demos:emulator` without env set. Production evidence should show explicit UID via Firestore field check (§5.1 verify command).

---

## 8. Re-seed and idempotency

| Command | Behaviour |
|---------|-----------|
| `seed:templates` | Skips docs when `contentHash` unchanged; full replace when seed files change |
| `seed:template-demos` | Creates missing demos; skips when `appliedTemplateContentHash` matches; updates published sections when template `contentHash` changes |

**When to re-run:**

- After merging seed JSON changes to `main` (bump `manifest.seedVersion` in same PR)
- After adding a library template to `manifest.json` + `RESERVED_TEMPLATE_SLUGS`

**When not to delete:** Demo tenants are never auto-deleted on re-seed ([`marketing-template-preview-spec.md`](../planning/marketing-template-preview-spec.md) §3.5).

---

## 9. First-run evidence template

Copy into wave handoff or `project-status.md` PL-003 row:

```markdown
## PL-003 first production seed — evidence

| Field | Value |
|-------|-------|
| Date (UTC) | YYYY-MM-DD HH:MM |
| Operator | |
| Coordinator approval | Nathan Cole — YYYY-MM-DD |
| Git SHA | `abc1234` |
| Firebase project | `codedpixels` |

### §2.3 checklist

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | `seed:templates` + approval gate | ☐ PASS / ☐ FAIL | Log: upserted ___, skipped ___ |
| 2 | `seed:template-demos` + preview 200 | ☐ PASS / ☐ FAIL | Batch curl: ___/14 HTTP 200 |
| 3 | `PLATFORM_DEMO_OWNER_UID` | ☐ PASS / ☐ FAIL | UID: `________` (redact in public logs) |
| 4 | Demo `noindex` | ☐ PASS / ☐ FAIL | curl -I sparkle-clean: noindex present |

### Command transcript (attach or paste)

```
<paste seed:templates + seed:template-demos stdout>
```

### Spot-check URLs

- https://sparkle-clean.codedpixels.co.uk/ — 200, noindex
- https://startup-launch.codedpixels.co.uk/ — 200, noindex

### Sign-off

| Role | Name | Date |
|------|------|------|
| FinOps (Daniel Moreau) | | |
| Firestore (Rafael Ortiz) | | |
| Coordinator (Nathan Cole) | | |
```

---

## 10. Acceptance (PL-003)

| §2.3 item | Automated | Documented manual | Status |
|-----------|-----------|-------------------|--------|
| #1 `seed:templates` + gate | `validate:templates` pre-check | Coordinator approval + archived log | ☐ |
| #2 Demo tenants + preview 200 | Batch `curl` script §7.3 | Firestore spot-check §7.2 | ☐ |
| #3 `PLATFORM_DEMO_OWNER_UID` | Firestore `ownerUid` field | Auth user created §5.1 | ☐ |
| #4 Demo `noindex` | `curl -sI` §7.4 | View-source spot-check | ☐ |

**Experts:** Dr. Rafael Ortiz (schema) · Dr. Daniel Moreau (FinOps gate) · **Coordinator handoff:** Dr. Nathan Cole
