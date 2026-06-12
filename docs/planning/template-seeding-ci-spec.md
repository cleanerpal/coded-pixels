# Template Seeding CI Spec

**Ticket:** DOC-008 · Platform Phase 2 Wave 2  
**Document owner:** Dr. Lena Moreau  
**Domain experts:** Dr. Rafael Ortiz (Firestore schema) · Dr. Daniel Moreau (CI / FinOps)  
**Status:** Approved for B1 implementation  
**Last updated:** 12 June 2026  
**Blocks:** B1-001 (Firestore tenant schema + seed templates)  
**Related:** [`../specs/firestore-schema.md`](../specs/firestore-schema.md) §5.2, §13 · [`../specs/builder-ui-spec.md`](../specs/builder-ui-spec.md) §4 · [`../specs/firestore-rules-spec.md`](../specs/firestore-rules-spec.md) §4.2 · [`../../lib/templates.ts`](../../lib/templates.ts)

**Aligned with Dr. Rafael Ortiz on template seed schema** — Firestore field names follow `firestore-schema.md` §5.2 (`defaultPage.sections`). Builder-ui-spec §4 references `defaultSections` at doc root; that path is **deprecated** — use `defaultPage.sections` only.

---

## 1. Purpose

This document defines how the **10 marketing library templates** (plus the `custom` placeholder) are seeded into Firestore `templates/{templateId}` for Platform Phase 2.

| Layer | Responsibility |
|-------|----------------|
| **Marketing configurator** | Reads metadata from `lib/templates.ts`; user selects `templateId` in config snapshot |
| **Seed files (repo)** | Authoritative section trees + page defaults per template |
| **CI seed job** | Idempotent upsert into Firestore via Admin SDK |
| **`provisionTenant`** | Deep-clones `templates/{templateId}.defaultPage.sections` into first draft page version (builder-ui-spec §4, firestore-schema §13 step 5) |

Existing tenant drafts are **never** mutated when seed files change — only the platform catalogue doc updates.

---

## 2. Template ID mapping (marketing → Firestore)

Doc ID = `TemplateDefinition.id` from `lib/templates.ts`. **No transforms** — kebab-case slug is identical in marketing URLs, config snapshot, GA4, and Firestore.

| # | Firestore doc ID (`templateId`) | Marketing name | Category (`category`) | `sortOrder` |
|---|--------------------------------|----------------|----------------------|-------------|
| 1 | `sparkle-clean` | Sparkle Clean | `cleaning-trades` | 1 |
| 2 | `trade-pro` | TradePro | `cleaning-trades` | 2 |
| 3 | `serenity-spa` | Serenity Spa | `beauty-wellness` | 3 |
| 4 | `glow-studio` | Glow Studio | `beauty-wellness` | 4 |
| 5 | `apex-legal` | Apex Legal | `professional-services` | 5 |
| 6 | `corner-shop` | Corner Shop | `retail` | 6 |
| 7 | `the-local` | The Local | `hospitality` | 7 |
| 8 | `learn-hub` | LearnHub | `education` | 8 |
| 9 | `business-core` | Business Core | `general-business` | 9 |
| 10 | `startup-launch` | Startup Launch | `general-business` | 10 |
| — | `custom` | Custom Template | — (no gallery category) | 99 |

**Configurator query param:** `/?template=sparkle-clean` → `config.templateId: "sparkle-clean"` → `provisionTenant` reads `templates/sparkle-clean`.

**Custom template:** Marketing card id is `custom` (`CUSTOM_TEMPLATE_CARD.id`). Firestore doc `templates/custom` has `isCustomTemplate: true` and a minimal empty scaffold — not a designed layout. Bespoke delivery is out of band (add-on deliverables DOC-003 §3.9).

**Validation (CI + B1):** Every `TEMPLATES[].id` must have a seed file. CI fails if count ≠ 10 library seeds + 1 custom. Unknown `templateId` in config snapshot must fail `provisionTenant` with `invalid-argument`.

---

## 3. Seed file format

### 3.1 Repository layout

Pre-B0 (current monolith):

```
seeds/templates/
  manifest.json                 # seedVersion baseline + file list
  sparkle-clean.defaultSections.json
  trade-pro.defaultSections.json
  … (10 library files)
  custom.defaultSections.json
```

Post-B0 (DOC-007 monorepo — expert-review memo P3):

```
packages/templates/seeds/
  manifest.json
  {templateId}.defaultSections.json
```

B1-001 migrates paths; **JSON schema unchanged**.

### 3.2 `*.defaultSections.json` structure

Each file is the **authoring source** for one Firestore template doc. The filename suffix `defaultSections` denotes the primary payload; CI maps it to `defaultPage.sections` on write.

```json
{
  "templateId": "sparkle-clean",
  "metadata": {
    "name": "Sparkle Clean",
    "category": "cleaning-trades",
    "description": "Professional cleaning services site with quote form",
    "sortOrder": 1,
    "isCustomTemplate": false
  },
  "defaultPage": {
    "title": "Home",
    "slug": "home",
    "seo": {
      "title": "Sparkle Clean — Professional Cleaning Services",
      "description": "Get a quote for domestic and commercial cleaning."
    }
  },
  "defaultSections": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "type": "hero",
      "props": {
        "headline": "Spotless homes, every visit",
        "subheadline": "Trusted local cleaning for homes and offices",
        "ctaText": "Get a quote",
        "ctaLink": "#contact",
        "alignment": "center"
      }
    },
    {
      "id": "00000000-0000-4000-8000-000000000002",
      "type": "contact-form",
      "props": {
        "fields": ["name", "email", "phone", "message"],
        "submitLabel": "Request quote",
        "successMessage": "Thanks — we'll be in touch within 24 hours."
      }
    }
  ]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `templateId` | ✅ | Must match filename prefix and Firestore doc ID |
| `metadata.*` | ✅ | Must match `lib/templates.ts` for library templates (CI cross-check) |
| `defaultPage.title`, `slug`, `seo` | ✅ | Becomes `defaultPage` on Firestore doc (without `sections`) |
| `defaultSections` | ✅ | `Section[]` per firestore-schema §3 — cloned on provision |

**Section rules** (firestore-schema §3, builder-ui-spec §3.1):

- `id` — stable UUID v4 in seed files (provision generates **new** UUIDs when cloning into tenant draft)
- `type` — registry key: `hero`, `text-block`, `features-grid`, `contact-form`, `image-gallery`, `testimonials`, `cta-banner`, `footer`, …
- `props` — JSON object; validated at seed time by shared Zod schemas (B2-002 registry)
- `children` — optional; max nesting depth **2**

**Custom template seed:** `defaultSections: []`, `isCustomTemplate: true`, generic SEO copy. Provisioning still creates homepage draft; builder shows blank-page empty state (builder-ui-spec §5.2).

### 3.3 `manifest.json`

```json
{
  "schemaVersion": 1,
  "seedVersion": 1,
  "templates": [
    "sparkle-clean",
    "trade-pro",
    "serenity-spa",
    "glow-studio",
    "apex-legal",
    "corner-shop",
    "the-local",
    "learn-hub",
    "business-core",
    "startup-launch",
    "custom"
  ]
}
```

| Field | Purpose |
|-------|---------|
| `schemaVersion` | Breaking change to seed JSON shape — bump triggers CI validation rule updates |
| `seedVersion` | Monotonic integer bumped when **any** template content changes (see §5) |
| `templates` | Ordered list; CI verifies every entry has `{id}.defaultSections.json` |

---

## 4. Firestore document shape (write target)

CI upserts each seed file to `templates/{templateId}`:

```typescript
// Written by Admin SDK — firestore-schema.md §5.2
{
  name: string;              // from metadata.name
  category: string;          // from metadata.category (omit or "" for custom)
  description: string;
  sortOrder: number;
  isCustomTemplate: boolean;
  defaultPage: {
    title: string;
    slug: string;
    seo: { title: string; description: string };
    sections: Section[];     // from defaultSections in seed file
  };
  seedVersion: number;       // from manifest.seedVersion (platform extension — not in schema table yet; B1 adds)
  contentHash: string;       // SHA-256 of canonical JSON (§5)
  updatedAt: Timestamp;      // server timestamp on change only
}
```

> **Schema note:** `seedVersion` and `contentHash` are CI-managed platform fields for idempotency. B1-001 adds them to `firestore-schema.md` §5.2 in the same wave. Clients ignore them.

---

## 5. Idempotency and version bumps

### 5.1 Content hash

Before write, CI computes:

```
contentHash = SHA-256( canonicalize( { metadata, defaultPage sans sections, defaultSections } ) )
```

Canonicalization: JSON keys sorted recursively; no whitespace variance.

### 5.2 Upsert logic

```
for each templateId in manifest.templates:
  payload = load seed file + assemble Firestore doc
  existing = admin.get(templates/{templateId})

  if existing.contentHash === payload.contentHash:
    log "skip {templateId} — unchanged"
    continue

  payload.seedVersion = manifest.seedVersion
  payload.updatedAt = FieldValue.serverTimestamp()
  admin.set(templates/{templateId}, payload, { merge: false })  // full replace — deterministic
  log "upserted {templateId} seedVersion={n}"
```

**Idempotent:** Re-running CI with unchanged seeds produces zero writes.

**Version bump policy:**

| Change | Action |
|--------|--------|
| Edit any `*.defaultSections.json` | Increment `manifest.seedVersion` in same PR |
| Add/remove template | Update `manifest.templates`, `lib/templates.ts`, and marketing gallery in one PR |
| `schemaVersion` breaking change | Coordinate B1/B2 registry migration; bump `schemaVersion` |

CI **fails** if `contentHash` would change but `manifest.seedVersion` is unchanged (forces explicit version acknowledgement).

### 5.3 Effect on provisioned tenants

| Event | Tenant data |
|-------|-------------|
| Seed updated in Firestore | Unchanged — existing `pages/.../versions/*` drafts/published copies are independent |
| New signup after seed update | Gets latest `defaultPage.sections` from catalogue |
| Re-provision (should not happen) | Out of scope — no automatic re-seed of live tenants in Phase 2 |

---

## 6. CI job specification

**Owner:** Dr. Daniel Moreau (FinOps / CI)

### 6.1 Workflow

File: `.github/workflows/seed-templates.yml` (created in B1-001)

| Setting | Value |
|---------|-------|
| **Trigger** | Push to `main` when `seeds/templates/**` or `packages/templates/seeds/**` changes; `workflow_dispatch` for manual re-seed |
| **Runner** | `ubuntu-latest` |
| **Node** | LTS matching repo `engines` |
| **Environments** | `staging` (auto on main); `production` (manual approval gate) |

### 6.2 Steps

```yaml
# Pseudocode — B1-001 implements
jobs:
  seed-templates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run validate:templates    # lint seed JSON + Zod + templates.ts parity
      - run: npm run seed:templates
        env:
          FIREBASE_PROJECT_ID: ${{ vars.FIREBASE_PROJECT_ID }}
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

### 6.3 npm scripts (B1-001)

| Script | Purpose |
|--------|---------|
| `validate:templates` | Schema + parity checks; runs in PR CI (no Firestore write) |
| `seed:templates` | Admin SDK upsert (§5.2); requires credentials |
| `seed:templates:emulator` | Local dev — targets Firestore emulator |

Implementation: `scripts/seed-templates.mjs` (or `scripts/seed-templates.ts` via `tsx`) using `firebase-admin`.

### 6.4 Secrets and permissions

| Secret / var | Usage |
|--------------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON key for dedicated **template-seeder** SA (not human admin) |
| `FIREBASE_PROJECT_ID` | `codedpixels-staging` / `codedpixels-prod` per environment |

SA IAM: **`roles/datastore.user`** on Firestore only. No Auth, Storage, or Hosting permissions.

### 6.5 PR validation (no write)

Every PR touching `seeds/templates/**`:

1. `npm run validate:templates` — required check
2. Verify `lib/templates.ts` metadata matches each seed `metadata` block
3. Validate every `defaultSections` entry against component Zod schemas
4. Fail if `manifest.templates` length ≠ 11

Optional: diff summary comment listing templates whose `contentHash` would change (dry-run mode).

### 6.6 Local / emulator workflow

```bash
npm run emulators          # Firestore emulator
npm run seed:templates:emulator
```

Developers seed locally before testing `provisionTenant` against emulated catalogue.

---

## 7. Security rules reference

Templates are **platform read-only** from clients. Writes go **only** through Admin SDK (CI / ops scripts).

From [`firestore-rules-spec.md`](../specs/firestore-rules-spec.md) §4.2:

| Client read | Client write |
|-------------|--------------|
| ✅ Any signed-in user (builder / authenticated marketing preview) | ❌ Deny — Admin/CI only |

```javascript
match /templates/{templateId} {
  allow read: if isSignedIn();
  allow write: if false;
}
```

| Writer | Mechanism | Rules apply? |
|--------|-----------|--------------|
| CI seed job | Firebase Admin SDK | **Bypasses** rules |
| Browser / Callable | — | Writes denied |
| Cloud Functions | Admin SDK for reads during `provisionTenant` | Bypasses rules for read |

Rules unit tests (`tests/firestore/`) must assert: authenticated read allowed; client create/update/delete denied. Deploy with B1-002.

---

## 8. `provisionTenant` integration

On tenant creation (firestore-schema §13, builder-ui-spec §4):

```
templateRef = templates/{config.templateId}
sections = deepClone(templateRef.defaultPage.sections)
for each section in sections (recursive):
  section.id = newUuid()                    // fresh IDs — do not reuse seed UUIDs
create pages/{pageId} with slug defaultPage.slug, title defaultPage.title, seo defaultPage.seo
create pages/{pageId}/versions/{draftVersionId} with status: "draft", sections, schemaVersion: 1
set pages/{pageId}.draftVersionId = draftVersionId
set sites/{siteId}.templateId = config.templateId
```

**Failure modes:**

| Condition | Error |
|-----------|-------|
| `templates/{templateId}` missing | `failed-precondition` — catalogue not seeded |
| `templateId === 'custom'` and empty sections | Valid — blank draft |
| Unknown `type` in sections | `provisionTenant` rejects; seed CI should have caught via Zod |

---

## 9. B1 acceptance checklist

- [ ] `seeds/templates/` contains 11 JSON files + `manifest.json`
- [ ] `npm run validate:templates` passes in CI on every PR
- [ ] `npm run seed:templates:emulator` populates emulator catalogue
- [ ] GitHub workflow seeds staging on merge to `main`
- [ ] Idempotent re-run produces no writes when seeds unchanged
- [ ] `manifest.seedVersion` bump enforced when content changes
- [ ] `provisionTenant` integration test clones sections with new UUIDs
- [ ] Rules tests: template client write denied, authenticated read allowed

---

## 10. Expert sign-off

| Expert | Domain | Status |
|--------|--------|--------|
| Dr. Rafael Ortiz | Firestore schema & seed shape | ☑ Aligned — `defaultPage.sections` canonical |
| Dr. Daniel Moreau | CI workflow, SA least-privilege, staging/prod gates | ☑ Approved |
| Dr. Kai Nakamura | `provisionTenant` clone semantics | Pending B6-001 |
| Dr. Liam Harper | Rules tests for `templates/*` | Pending B1-002 |
| Dr. Sophia Laurent | Template section composition (UX) | Pending design pass on seed content |

---

## 11. Related amendments (follow-up, not blocking DOC-008)

| Doc | Amendment |
|-----|-----------|
| `builder-ui-spec.md` §4 | Replace `templates/{templateId}/defaultSections` → `templates/{templateId}/defaultPage.sections` |
| `firestore-schema.md` §5.2 | Add `seedVersion`, `contentHash` optional platform fields |
| `ticket-deliverables.md` | Add DOC-008 → `planning/template-seeding-ci-spec.md` |
