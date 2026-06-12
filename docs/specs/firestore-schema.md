# CodedPixels — Firestore Schema

**Document Owner:** Dr. Lena Moreau  
**Architecture:** Dr. Rafael Ortiz (Security & DB), Dr. Priya Desai (Data), Dr. Michael Chen (Platform)  
**Indexes:** Dr. Marcus Rivera  
**Compliance:** Dr. Patrick O'Brien (GDPR)  
**Status:** Canonical schema — pre-implementation  
**Region:** `europe-west2` (London)  
**Parent specs:** [`codedpixels-project-plan.md`](codedpixels-project-plan.md) · [`builder-ui-spec.md`](builder-ui-spec.md)

---

## 1. Design Principles

The expert panel optimised for **simplest correct multi-tenancy**, not premature normalisation.

| Principle | Decision | Owner |
|-----------|----------|-------|
| Tenant root | **`companies/{companyId}`** — all tenant data lives under this path | Rafael Ortiz |
| Site content | **`sites/{siteId}`** subcollections — never root-level PII | Victor Lang |
| Page content | **Version subcollection** — draft/published snapshots; sections stored **in the version doc** (array, not subcollection) | Lena Petrova |
| Global lookups | Only **`slugs/`**, **`templates/`**, marketing **`signups`**, **`waitlist_site_import`**, platform **`auditLogs`** | Michael Chen |
| IDs | Auto-generated Firestore IDs except **`slugs/{slug}`** (slug = doc ID) and **`usage/{YYYY-MM}`** | Priya Desai |
| Money | **Pence integers** (`monthlyTotalPence`, `pricePence`) — never floats | Marcus Klein |
| Timestamps | **`createdAt`**, **`updatedAt`** on every writable doc; server `FieldValue.serverTimestamp()` | Kai Nakamura |
| Stripe | **Extension-managed** mirror collections — app reads, Extension writes | Owen Reilly |
| Postgres | **Not yet** — Firestore only until ~5k tenants or heavy reporting (Q28) | Priya Desai |

### What we deliberately avoid

- Separate DB per company  
- Sections as Firestore subcollection (too many reads on publish)  
- Root-level lead/form documents  
- Duplicate site `meta` subdocument — fields live on **`sites/{siteId}`** directly  
- `componentRegistry/` in Firestore for Phase 2 (registry stays in code; Phase 3 optional)

---

## 2. Collection Tree (Complete)

```
Firestore (europe-west2)
│
├── signups/{signupId}                          [M3 — marketing MVP]
├── waitlist_site_import/{entryId}              [M3 — marketing MVP]
│
├── slugs/{slug}                                [Platform Phase 2 — global index]
├── templates/{templateId}                      [Platform Phase 2 — platform read-only]
├── auditLogs/{logId}                           [Platform Phase 2+ — support/compliance]
│
├── users/{uid}                                 [Platform Phase 2 — auth index]
│
├── companies/{companyId}                       [Platform Phase 2 — tenant root]
│   ├── members/{uid}
│   ├── invites/{inviteId}                      [Platform Phase 2.1]
│   ├── usage/{YYYY-MM}
│   └── sites/{siteId}
│       ├── pages/{pageId}
│       │   └── versions/{versionId}
│       ├── assets/{assetId}
│       ├── leads/{leadId}
│       ├── products/{productId}
│       └── domains/{domainId}                  [Platform Phase 2.1]
│
└── [Stripe Extension — extension writes, app reads]
    ├── customers/{uid}
    ├── products/{stripeProductId}
    ├── checkout_sessions/{sessionId}
    └── subscriptions/{subscriptionId}
```

### Firebase Storage (not Firestore — paired paths)

```
companies/{companyId}/sites/{siteId}/assets/{assetId}/{filename}
```

---

## 3. Shared Types

```typescript
import { Timestamp } from 'firebase/firestore';

/** Configurator feature IDs — canonical list */
type FeatureId =
  | 'crm'
  | 'email-automation'
  | 'booking'
  | 'ecommerce'
  | 'vat-mtd'
  | 'ai-content'
  | 'custom-template'
  | 'analytics-seo'
  | 'sms'
  | 'white-label'
  | 'priority-support';

type BillingCycle = 'monthly' | 'annual';
type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';
type LeadStatus = 'new' | 'read' | 'archived';
type VersionStatus = 'draft' | 'published' | 'archived';
type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed';
type ProductStatus = 'draft' | 'published';
type SiteStatus = 'draft' | 'published' | 'suspended';
type CompanyStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';

/** Block in page version — max nesting depth 2 */
interface Section {
  id: string;                          // required — uuid
  type: string;                        // required — registry ComponentType
  props: Record<string, unknown>;      // required — validated by Zod per type
  children?: Section[];                // optional — max depth 2
}

/** Snapshot from configurator — reused across signups, waitlist, provisioning */
interface ConfigSnapshot {
  templateId: string;                  // required
  featureIds: FeatureId[];             // required — may be []
  billingCycle: BillingCycle;          // required
  monthlyTotalPence: number;           // required
  annualTotalPence?: number;           // optional — when billingCycle annual
  customTemplateBilling?: 'recurring' | 'one-time';  // optional
  oneTimeFeesPence?: number;           // optional — e.g. 14900 for £149
  packageId?: 'starter' | 'growth' | 'pro' | 'custom';  // optional — last clicked
}
```

---

## 4. Marketing MVP Collections (M3)

> Written via **Callable Cloud Functions** only — no open client writes (Victor Lang).

### 4.1 `signups/{signupId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | Lowercase normalised |
| `config` | ConfigSnapshot | ✅ | Full configurator state |
| `consentAt` | Timestamp | ✅ | GDPR — signup consent |
| `consentVersion` | string | ✅ | e.g. `"privacy-v1"` |
| `source` | string | ✅ | `"get-started"` |
| `createdAt` | Timestamp | ✅ | |
| `ipHash` | string | optional | SHA-256 of IP — analytics/abuse; not raw IP |
| `userAgent` | string | optional | Truncated 256 chars |
| `status` | string | ✅ | `"pending"` \| `"converted"` \| `"archived"` — converted when Platform Phase 2 provisions |
| `convertedCompanyId` | string | optional | Set when `provisionTenant` links signup |

**Queries:** Admin export by `createdAt` desc (single-field index automatic).

**Retention:** 12 months, then archive/delete (Patrick O'Brien).

---

### 4.2 `waitlist_site_import/{entryId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | |
| `configSnapshot` | ConfigSnapshot | ✅ | Q17 — always captured |
| `consentAt` | Timestamp | ✅ | Unchecked-default checkbox + submit |
| `consentVersion` | string | ✅ | |
| `source` | string | ✅ | `"configurator"` |
| `createdAt` | Timestamp | ✅ | |
| `notifiedAt` | Timestamp | optional | When Site Import launches |

**Retention:** 24 months after feature launch or until withdrawal.

---

## 5. Platform Index Collections

### 5.1 `slugs/{slug}`

Global hostname → tenant resolver for site renderer middleware.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `companyId` | string | ✅ | |
| `siteId` | string | ✅ | |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**Doc ID:** `{slug}` — e.g. `acme-clean` for `acme-clean.codedpixels.co.uk`

**Uniqueness:** Enforced in `provisionTenant` transaction — check slug doc absent before write.

**Security:** Public read **denied** — resolved server-side in site renderer / Cloud Function only.

---

### 5.2 `templates/{templateId}`

Platform-managed template seeds. **Read-only** from client; seeded by admin/CI.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Display name |
| `category` | string | ✅ | e.g. `"cleaning-trades"` |
| `description` | string | ✅ | |
| `sortOrder` | number | ✅ | Gallery ordering |
| `defaultPage` | object | ✅ | See below |
| `isCustomTemplate` | boolean | ✅ | `false` for library; `true` for bespoke placeholder |
| `seedVersion` | number | optional | CI-managed monotonic version from seed manifest — clients ignore |
| `contentHash` | string | optional | SHA-256 of canonical seed payload — idempotent upsert only |
| `updatedAt` | Timestamp | ✅ | |

**`defaultPage` object:**

| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ |
| `slug` | string | ✅ | Usually `"home"` |
| `seo` | `{ title: string; description: string }` | ✅ |
| `sections` | Section[] | ✅ | Cloned into first draft version on provision |

**Doc IDs:** Match configurator IDs — e.g. `sparkle-clean`, `trade-pro`, … `custom`

---

### 5.3 `users/{uid}`

Auth user index — one primary company per user in Platform Phase 2.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | Mirror Auth email |
| `defaultCompanyId` | string | ✅ | Primary tenant |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**Phase 3+:** Add `users/{uid}/memberships/{companyId}` for multi-company; defer for simplicity.

**Security:** User can read own doc; write via Cloud Functions only.

---

### 5.4 `auditLogs/{logId}`

Support and compliance audit trail (Q43).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `actorUid` | string | ✅ | Support agent or system |
| `actorType` | string | ✅ | `"support"` \| `"system"` \| `"user"` |
| `action` | string | ✅ | e.g. `"support.read.company"` |
| `companyId` | string | optional | Tenant scoped when applicable |
| `resourcePath` | string | optional | e.g. Firestore path accessed |
| `ticketId` | string | optional | Required for support reads Phase 2.5 |
| `metadata` | map | optional | No PII — IDs only |
| `createdAt` | Timestamp | ✅ | |

**Queries:** `companyId` + `createdAt` desc (composite index).

**Retention:** 24 months.

---

## 6. Tenant Root — `companies/{companyId}`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Business name |
| `slug` | string | ✅ | Subdomain slug — mirrors `slugs/{slug}` |
| `ownerUid` | string | ✅ | Firebase Auth UID |
| `status` | CompanyStatus | ✅ | Synced from Stripe webhooks |
| `plan` | object | ✅ | See below |
| `onboardingStep` | number | optional | 1–4 wizard progress (Q36) |
| `onboardingCompletedAt` | Timestamp | optional | |
| `stripeCustomerId` | string | optional | From Stripe Extension |
| `stripeSubscriptionId` | string | optional | From Stripe Extension |
| `partnerId` | string | optional | Phase 3 agency white-label |
| `isPlatformDemo` | boolean | optional | `true` for CI-seeded template demo tenants (Q65, Wave 19) — site-renderer sets `noindex` |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**`plan` object:**

| Field | Type | Required |
|-------|------|----------|
| `featureIds` | FeatureId[] | ✅ |
| `billingCycle` | BillingCycle | ✅ |
| `monthlyTotalPence` | number | ✅ |
| `annualTotalPence` | number | optional |
| `customTemplateBilling` | `'recurring' \| 'one-time'` | optional |
| `packageId` | string | optional |

**Security:** Readable by `members` with matching `companyId` claim; writable by owner/admin via Functions for plan changes.

---

### 6.1 `companies/{companyId}/members/{uid}`

**Source of truth for RBAC** (Q39) — rules authorise from this doc, not claims alone.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | |
| `role` | MemberRole | ✅ | |
| `invitedBy` | string | optional | UID |
| `invitedAt` | Timestamp | optional | |
| `joinedAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**Platform Phase 2 launch:** Only `owner` doc exists.

---

### 6.2 `companies/{companyId}/invites/{inviteId}` (Platform Phase 2.1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | ✅ | |
| `role` | MemberRole | ✅ | admin \| editor \| viewer |
| `tokenHash` | string | ✅ | SHA-256 of invite token — never store raw token |
| `status` | string | ✅ | `"pending"` \| `"accepted"` \| `"revoked"` \| `"expired"` |
| `invitedBy` | string | ✅ | Owner UID |
| `expiresAt` | Timestamp | ✅ | 7 days from create |
| `createdAt` | Timestamp | ✅ | |

**Queries:** `status` + `email` (composite) for revoke/check duplicate invites.

---

### 6.3 `companies/{companyId}/usage/{YYYY-MM}`

Monthly usage counters (Q32). **Doc ID = `"2026-06"`** — no query needed for current month.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `periodId` | string | ✅ | Redundant copy of doc ID |
| `formSubmissions` | number | ✅ | Default 0 — increment via Function |
| `storageBytes` | number | ✅ | From Storage aggregate |
| `bandwidthBytes` | number | optional | Phase 3 |
| `sitesCount` | number | ✅ | Usually 1 |
| `updatedAt` | Timestamp | ✅ | |

**Increment pattern:** `FieldValue.increment(1)` in transaction on form submit.

---

## 7. Sites — `companies/{companyId}/sites/{siteId}`

Site document holds metadata **directly** (no separate `meta` subdoc).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | Site display name |
| `slug` | string | ✅ | Same as company slug in Phase 2 (one site per company initially) |
| `templateId` | string | ✅ | Original template |
| `featureIds` | FeatureId[] | ✅ | Copy from company plan at provision; gate publish |
| `status` | SiteStatus | ✅ | |
| `homepagePageId` | string | ✅ | Pointer to `pages/{pageId}` |
| `publishedAt` | Timestamp | optional | Last publish |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

---

### 7.1 `.../pages/{pageId}`

Page metadata only — **content lives in `versions/`**.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ | |
| `slug` | string | ✅ | URL path e.g. `"home"`, `"about"` |
| `sortOrder` | number | ✅ | Navigation order |
| `seo` | object | ✅ | `{ title: string; description: string }` |
| `draftVersionId` | string | ✅ | Active working version |
| `publishedVersionId` | string | optional | Live site version |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**Queries:** `sortOrder` asc (single-field — list pages in nav).

---

### 7.2 `.../pages/{pageId}/versions/{versionId}`

Versioning strategy (Q34, Q35, Q53):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | VersionStatus | ✅ | |
| `schemaVersion` | number | ✅ | Start `1` — migrate on breaking registry changes |
| `sections` | Section[] | ✅ | Full page content |
| `createdBy` | string | ✅ | UID |
| `createdAt` | Timestamp | ✅ | |
| `publishedAt` | Timestamp | optional | Set on publish |
| `label` | string | optional | Phase 2.1 — "Version 3" for history UI |

**Lifecycle:**

1. **Provision:** Create one version `status: draft` from `templates/{id}.defaultPage.sections`
2. **Edit:** Mutate `sections` on draft version in place (or replace doc)
3. **Publish:** Copy draft → new version `status: published`; set `page.publishedVersionId`; optionally archive prior published (keep max **5** per page — Q53)
4. **Live site:** Reads only `publishedVersionId` doc
5. **Preview:** Reads `draftVersionId` doc (auth required)

**Security:** Public read **only** for `status == published` versions referenced by `publishedVersionId`. Draft versions **deny** public read.

**Size limit:** ~1 MiB doc limit — ~50 sections max per page (Phase 2 guard in `publishSite`).

---

### 7.3 `.../assets/{assetId}`

Metadata for Storage files (Q44, Q64). Binary in Storage only.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `filename` | string | ✅ | Original filename |
| `storagePath` | string | ✅ | Full Storage path |
| `url` | string | ✅ | Download URL (token refreshed server-side if needed) |
| `thumbUrl` | string | optional | From Resize Images Extension |
| `altText` | string | ✅ | Required before use in section |
| `mimeType` | string | ✅ | `image/jpeg` \| `image/png` \| `image/webp` \| `image/gif` |
| `width` | number | optional | |
| `height` | number | optional | |
| `sizeBytes` | number | ✅ | |
| `scanStatus` | string | ✅ | `"pending"` \| `"clean"` \| `"infected"` |
| `createdBy` | string | ✅ | UID |
| `createdAt` | Timestamp | ✅ | |

**Section reference:** Store `assetId` in section props (not raw URL) — renderer resolves URL at render time.

**Queries:** List by `createdAt` desc for asset picker (single-field).

---

### 7.4 `.../leads/{leadId}`

CRM inbox (Q50). Supports any form type via flexible `fields` map.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | LeadStatus | ✅ | Default `"new"` |
| `source` | object | ✅ | See below |
| `contact` | object | ✅ | Normalised contact fields |
| `fields` | map | ✅ | Raw form key → value (string \| number \| boolean) |
| `submittedAt` | Timestamp | ✅ | |
| `readAt` | Timestamp | optional | |
| `archivedAt` | Timestamp | optional | |
| `ipHash` | string | optional | Abuse tracking |
| `spamScore` | number | optional | reCAPTCHA score |

**`source` object:**

| Field | Type | Required |
|-------|------|----------|
| `pageId` | string | ✅ |
| `pageSlug` | string | ✅ |
| `formSectionId` | string | ✅ | Section id on page |
| `formType` | string | ✅ | `"contact"` \| `"quote"` \| `"booking"` |

**`contact` object** (extracted for table display):

| Field | Type | Required |
|-------|------|----------|
| `name` | string | optional |
| `email` | string | optional |
| `phone` | string | optional |

**Queries (CRM inbox):**

| Query | Index |
|-------|-------|
| All leads, newest first | `submittedAt` DESC |
| Filter by status | Composite: `status` ASC + `submittedAt` DESC |
| Filter by page | Composite: `source.pageSlug` ASC + `submittedAt` DESC |

**Written by:** Public form Callable Function only (App Check + rate limit).

**Retention:** Life of account; export CSV available (Q42); deleted with company (Delete User Data Extension).

---

### 7.5 `.../products/{productId}` (ecommerce add-on)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ | |
| `slug` | string | ✅ | Unique per site |
| `description` | object | optional | Tiptap JSON |
| `pricePence` | number | ✅ | GBP pence |
| `sku` | string | optional | |
| `status` | ProductStatus | ✅ | |
| `imageAssetIds` | string[] | optional | Max 5 — refs `assets/{assetId}` |
| `stripePriceId` | string | optional | Phase 2.1 checkout |
| `sortOrder` | number | ✅ | |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

**Queries:** `status` + `sortOrder` (composite) for product grid.

---

### 7.6 `.../domains/{domainId}` (Platform Phase 2.1)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `hostname` | string | ✅ | e.g. `www.acme-clean.co.uk` |
| `status` | DomainStatus | ✅ | |
| `verificationRecords` | array | optional | DNS records shown to user |
| `firebaseHostingDomainId` | string | optional | Hosting API reference |
| `verifiedAt` | Timestamp | optional | |
| `createdAt` | Timestamp | ✅ | |
| `updatedAt` | Timestamp | ✅ | |

---

## 8. Stripe Extension Collections (Read-Only for App)

Managed by **Stripe Firebase Extension** (Q63). App **reads**; Extension **writes**.

| Collection | Purpose |
|------------|---------|
| `customers/{uid}` | Stripe Customer ID mirror |
| `products/{id}` | Stripe Product/Price catalogue |
| `checkout_sessions/{id}` | Checkout Session status |
| `subscriptions/{id}` | Active subscription state |

**Company linkage:** Custom Function on webhook copies `stripeCustomerId` + `stripeSubscriptionId` onto `companies/{companyId}`.

---

## 9. Composite Indexes

**Dr. Marcus Rivera** — create in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "leads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "source.pageSlug", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "sortOrder", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "invites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Collection group note:** `leads` queries run per-site path `companies/{id}/sites/{id}/leads` — collection group index still applies.

**No index needed:** `usage/{YYYY-MM}` (direct doc read), `slugs/{slug}` (doc ID lookup), `pages` sorted by `sortOrder` (single field).

---

## 10. Security Rules Summary

Full rules: [`firestore-rules-spec.md`](firestore-rules-spec.md) (M3 deliverable — Rafael Ortiz).

| Path | Public | Authenticated member | Functions only |
|------|--------|----------------------|----------------|
| `signups/*` | ❌ | ❌ | ✅ create |
| `waitlist_site_import/*` | ❌ | ❌ | ✅ create |
| `slugs/*` | ❌ | ❌ | ✅ read/write |
| `templates/*` | ❌ | ✅ read (builder) | ✅ write (admin) |
| `companies/{id}` | ❌ | ✅ read if member | ✅ write |
| `companies/{id}/**` | ❌ | ✅ role-based | ✅ write |
| `.../versions/{id}` published | ✅ read if referenced by `publishedVersionId` | ✅ read | ✅ write |
| `.../versions/{id}` draft | ❌ | ✅ editor+ | ✅ write |
| `.../leads/*` | ❌ | ✅ read if CRM add-on | ✅ create (form Function) |
| `auditLogs/*` | ❌ | ❌ | ✅ support read |

**Custom claims:** `{ companyId, role }` — refreshed on member change; **rules also read `members/{uid}`**.

---

## 11. Common Query Patterns

| Use case | Path | Query |
|----------|------|-------|
| Resolve tenant from hostname | `slugs/{slug}` | Direct get |
| Load live homepage | `pages/{homepagePageId}` | Get + get `versions/{publishedVersionId}` |
| CRM inbox (new leads) | `.../leads` | `where('status','==','new').orderBy('submittedAt','desc')` |
| Asset picker | `.../assets` | `orderBy('createdAt','desc').limit(50)` |
| Current month usage | `usage/{YYYY-MM}` | Direct get |
| List pages for nav | `.../pages` | `orderBy('sortOrder','asc')` |
| Published products | `.../products` | `where('status','==','published').orderBy('sortOrder')` |
| Admin: recent signups | `signups` | `orderBy('createdAt','desc').limit(100)` |

---

## 12. Data Retention (GDPR)

**Dr. Patrick O'Brien**

| Collection | Retention | Erasure |
|------------|-----------|---------|
| `signups` | 12 months | Scheduled Function or manual |
| `waitlist_site_import` | 24 months post Site Import launch | On request + scheduled |
| `companies/**` | Life of subscription + 30 days | Delete User Data Extension |
| `leads` | Life of account | Deleted with company; CSV export anytime |
| `auditLogs` | 24 months | Automated purge |
| `.../versions` archived | Max 5 published + 1 draft per page | Trim on publish |
| `users/{uid}` | Until Auth user deleted | With company deletion |

Document in `/privacy` with DPO contact (TBD).

---

## 13. Provisioning Writes (`provisionTenant`)

Order of writes in single batch/transaction where possible:

1. Check `slugs/{slug}` unused  
2. Create `companies/{companyId}`  
3. Create `companies/{companyId}/members/{ownerUid}` role `owner`  
4. Create `companies/{companyId}/sites/{siteId}`  
5. Create `pages/{pageId}` + first `versions/{draftVersionId}` from template  
6. Create `slugs/{slug}`  
7. Create/update `users/{uid}`  
8. Update `signups/{id}.status = converted` if linked  
9. Set Auth custom claims  

---

## 14. Phase Rollout

| Collections | When |
|-------------|------|
| `signups`, `waitlist_site_import` | **M3** |
| `companies/**`, `slugs`, `templates`, `users` | **Platform Phase 2 B1** |
| `leads`, `assets`, `pages/versions` | **Platform Phase 2 B2–B4** |
| `products` | **Platform Phase 2 B8** (ecommerce) |
| `invites`, `domains` | **Platform Phase 2.1** |
| `auditLogs` | **Platform Phase 2** (support console) |
| Stripe Extension collections | **Platform Phase 2 B6** |

---

## 15. Expert Sign-Off

| Expert | Domain | Status |
|--------|--------|--------|
| Dr. Rafael Ortiz | Schema & rules | ☑ Approved |
| Dr. Priya Desai | Data modelling | ☑ Approved |
| Dr. Michael Chen | Platform fit | ☑ Approved |
| Dr. Marcus Rivera | Indexes | ☑ Approved |
| Dr. Fatima Al-Sayed | Auth & RBAC paths | ☑ Approved |
| Dr. Patrick O'Brien | GDPR & retention | ☑ Approved |
| Dr. Owen Reilly | Stripe linkage fields | ☑ Approved |
| Dr. Nora Patel | Assets + Storage pairing | ☑ Approved |
| Dr. Lena Moreau | Documentation | ☑ Published |

---

## 16. Related Documents

| Document | Purpose |
|----------|---------|
| [`firestore-rules-spec.md`](firestore-rules-spec.md) | Full security rules (M3 — next artefact) |
| [`codedpixels-project-plan.md`](codedpixels-project-plan.md) §18 | Architecture context |
| [`builder-ui-spec.md`](builder-ui-spec.md) §4 | Builder UI mapping |

**Next action:** Rafael Ortiz — deploy §11 starter rules at M3; Liam Harper adds rules unit tests in CI.
