# Marketing Template Preview Spec

**Ticket:** DOC-010 · Phase 2.1 Wave 19  
**Document owner:** Dr. Lena Moreau  
**Coordinator:** Dr. Nathan Cole  
**Status:** Approved — expert panel 12 June 2026 · **Amendment pass** 12 June 2026 (Forge & Scale advisory closure — §3.4–3.7, §4.5, §5.1, §9)
**Blocks:** INF-005, INF-006, ENG-024, ENG-025, ENG-026, QA-007  
**Related:** [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) · [`firestore-schema.md`](../specs/firestore-schema.md) §5.2, §6 · [`site-renderer-architecture.md`](../specs/site-renderer-architecture.md) · [`monorepo-layout-spec.md`](monorepo-layout-spec.md) §4.1 · project plan §4, §6 · **Q65, Q66**

---

## 1. Problem

| Layer | Shipped (Wave 12–16) | Marketing UX today (Wave 1–5) |
|-------|----------------------|-------------------------------|
| Template designs | 10 library seeds in `packages/templates/seeds/` with full section trees | Gradient placeholders + mock wireframe preview |
| User selection | `templateId` in URL + config snapshot → `provisionTenant` clone | Works — user **cannot see** the real design before selecting |
| Live preview | Site-renderer + component registry | Not wired to homepage configurator |

**Gap:** Users must pre-select from **pre-designed, built templates** and **preview** them on the homepage and `/templates` — not only after checkout.

**Starter library (Q67):** **10 library templates** already exist as seeds — they are the user's **first initial starter** options. Templates are presented as **starter designs** (editable starting points). See [`starter-template-library-plan.md`](starter-template-library-plan.md).

---

## 2. Decisions (expert panel)

### Q65 — How marketing shows real template designs

**Question:** How do users preview pre-built library templates on the marketing site without client reads of `templates/` or importing `@codedpixels/component-registry` into marketing?

**Decision:** **Platform demo tenants** on site-renderer — one published demo site per library `templateId`, slug = doc ID (e.g. `sparkle-clean.codedpixels.co.uk`). Marketing links to demo URLs in a **new tab**; inline configurator preview **keeps** the existing mock wireframe (ENG-013) for instant theme + feature badges.

| Owner | Rationale |
|-------|-----------|
| Dr. Samuel Ruiz | Conversion requires “see before you buy”; demo links satisfy without delaying selection flow |
| Dr. Michael Chen | Preserves three-app boundary — renderer owns real HTML |
| Dr. Rafael Ortiz | `templates/` stays Admin/CI-only; no new public Firestore reads |
| Dr. Lena Petrova | Reuses B4 renderer + B1 seeds — no duplicate render path in marketing |
| Dr. Sophia Laurent | Mock panel stays fast; full preview is opt-in via explicit link |
| Mr. Theo Laurent | “Preview full site” CTA beside selection — clear conversion path |

**Not in scope (Wave 19):** Inline iframe in `LivePreviewPanel` — deferred to Phase 2.2 pending CSP/`sandbox` ruling (Dr. Victor Lang) and perf sign-off (Dr. Isaac Berg).

---

### Q66 — Project plan §6 “no iframe” amendment

**Question:** Project plan §6 states “MVP preview (no iframe to external builder)”. Does Wave 19 violate this?

**Decision:** **Amend §6** — inline preview remains mock wireframe (unchanged). **External** preview opens demo tenant URL in a **new tab** (`target="_blank"` + `rel="noopener noreferrer"`). This is not an iframe and does not supersede the instant inline UX.

| Owner | Status |
|-------|--------|
| Dr. Sophia Laurent | ☑ |
| Mr. Theo Laurent | ☑ |
| Dr. Samuel Ruiz | ☑ |

---

## 3. Platform demo tenants (INF-005)

### 3.1 Data model

Demo tenants are **normal** `companies/{companyId}` documents — not a special renderer code path.

| Field / doc | Value |
|-------------|-------|
| `companies/{companyId}.slug` | `{templateId}` e.g. `sparkle-clean` |
| `companies/{companyId}.isPlatformDemo` | `true` (new optional field — schema §6) |
| `companies/{companyId}.ownerUid` | `PLATFORM_DEMO_OWNER_UID` env (CI secret; emulator: fixed test UID) |
| `companies/{companyId}.status` | `active` |
| `slugs/{templateId}` | `{ companyId, siteId }` |
| `sites/{siteId}.status` | `published` |
| `sites/{siteId}.templateId` | `{templateId}` |
| `pages/{pageId}.publishedVersionId` | Set to published version doc ID |
| `versions/{publishedVersionId}.status` | `published` |
| `versions/{publishedVersionId}.sections` | Cloned from `templates/{templateId}.defaultPage.sections` (new UUIDs per seed) |

**Custom template (`custom`):** No demo tenant — bespoke card only; no preview link.

### 3.2 Seed implementation rules

| Rule | Owner |
|------|-------|
| **Admin SDK only** — never call `provisionTenant` or Stripe | Dr. Kai Nakamura |
| Idempotent upsert keyed by `templateId` / slug | Dr. Alex Rivera |
| `FIREBASE_PROJECT_ID` default **`codedpixels`** (fix `seed.mjs` `demo-codedpixels` drift) | Dr. Daniel Moreau |
| Published gate must pass site-renderer (`publishedVersionId` + `status: published`) | Dr. Lena Petrova |

**Script:** `npm run seed:template-demos` / `npm run seed:template-demos:emulator`

### 3.3 Reserved slugs (customer onboarding)

The 10 library `templateId` values are **reserved** — customers cannot claim them during onboarding slug pick (ENG-026).

| Constant | Location |
|----------|----------|
| `RESERVED_TEMPLATE_SLUGS` | `packages/shared-types/src/constants/reserved-template-slugs.ts` |

**Note:** Demo slugs are **not** added to site-renderer `RESERVED_SUBDOMAINS` — they must resolve via `slugs/{templateId}` (Dr. Marcus Rivera).

### 3.4 Ownership and lifecycle (emulator + production)

| Dimension | Rule |
|-----------|------|
| **Who owns demo tenants** | Platform operations — not customers, not `provisionTenant`, not Stripe |
| **Stable identity** | One `companyId` per library `templateId`, deterministic: `demo-{templateId}` (doc ID) |
| **Owner UID** | `PLATFORM_DEMO_OWNER_UID` env — production: Firebase Auth service account UID or dedicated platform user; emulator: `demo-platform-owner` (documented in seed script) |
| **Creation path** | **Only** `npm run seed:template-demos` / `seed:template-demos:emulator` (Admin SDK) |
| **Customer path** | `provisionTenant` **must never** write `isPlatformDemo: true` or reuse `demo-{templateId}` IDs |
| **Deletion** | Demo tenants are **not** deleted on re-seed; upsert in place |
| **Production run** | Manual approval gate per [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) §6.1 — same pattern as `seed:templates` |
| **Emulator run** | Local dev + CI optional job — no Stripe, no Auth signup required beyond fixed UID |

**Separation from normal provisioning:** Demo tenants have `plan.featureIds: []`, no `stripeCustomerId`, no `members/` subcollection beyond optional platform owner stub. They exist solely to serve published preview HTML on site-renderer.

### 3.5 Idempotency when template seeds change

Demo seed script keys on **`templateId`** (slug doc ID = `templateId`, company doc ID = `demo-{templateId}`).

| Scenario | Required behaviour |
|----------|-------------------|
| First run | Create company, site, homepage page, published version, `slugs/{templateId}` |
| Re-run, no template change | No-op (compare `templates/{templateId}.contentHash` to last applied hash stored on demo site metadata or skip if published version hash matches) |
| Re-run, template `contentHash` changed | **Update published version sections** from latest `templates/{templateId}.defaultPage.sections` (new UUIDs per clone rule); bump `updatedAt`; trigger site-renderer revalidation tag `site-slug:{templateId}` |
| Re-run, template removed from manifest | **Do not delete** demo tenant automatically — log warning; manual cleanup only (Wave 20 governance) |
| Customer tenant with same slug | **Impossible** after ENG-026 — onboarding rejects reserved slugs; demo seed runs first in CI |

Aligned with Dr. Alex Rivera on seed idempotency · Dr. Rafael Ortiz on Admin-only writes.

### 3.6 Reserved slugs vs `templateId` — test and data impact

**Critical distinction:**

| Concept | Reserved? | Where enforced |
|---------|-----------|----------------|
| **`templateId`** in configurator URL (`?template=sparkle-clean`) | **No** — users select library templates by ID | Marketing configurator, get-started, `provisionTenant` clone source |
| **Customer subdomain slug** (`companies.slug` / onboarding pick) | **Yes** — 10 library IDs blocked | ENG-026 onboarding validator only |

**Existing tests using `sparkle-clean` as `templateId`:** **No change required.** Configurator E2E, config-state tests, and provisioning tests reference template **selection**, not customer slug claims.

**Tests requiring updates (INF-005 / ENG-026):**

| Area | Change |
|------|--------|
| `apps/builder/lib/onboarding/slug.ts` | New unit tests — reject each `RESERVED_TEMPLATE_SLUGS` entry |
| Builder onboarding E2E (if present) | Assert reserved slug error message |
| Site-renderer hostname tests | Confirm library template slugs (`sparkle-clean.localhost:3002`) **resolve** — not in `RESERVED_SUBDOMAINS` |

**No migration** of Firestore emulator fixtures needed — reserved enforcement is forward-only on new onboarding submissions.

### 3.7 `@codedpixels/shared-types` surface contract

| Export | Path | Consumers | Notes |
|--------|------|-----------|-------|
| `RESERVED_TEMPLATE_SLUGS` | `packages/shared-types/src/constants/reserved-template-slugs.ts` | Builder onboarding (`ENG-026`), demo seed script (validation), future B10-001 | Readonly tuple of 10 library IDs; derived from `manifest.json` library entries (exclude `custom`) |
| `isReservedTemplateSlug(slug: string)` | same file | Builder onboarding | Pure helper; unit-tested |
| `Company.isPlatformDemo` | `packages/shared-types/src/firestore/company.ts` | Site-renderer tenant resolution (`INF-005`) | Optional boolean; schema §6 |
| `TemplateCategory` | **Wave 20** — move from `apps/marketing/lib/templates.ts` to `packages/shared-types/src/constants/template-category.ts` | Marketing, manifest CI cross-check, B10-001 | Wave 19 keeps marketing-local type; Wave 20 unifies before +4 categories |

**Package exports:** Add to `packages/shared-types/src/index.ts`:

```typescript
export { RESERVED_TEMPLATE_SLUGS, isReservedTemplateSlug } from './constants/reserved-template-slugs';
```

**Consumption rule:** Marketing app imports **only** preview URL helpers locally — does **not** import `RESERVED_TEMPLATE_SLUGS` (builder-only concern).

---

## 4. Marketing UX (ENG-024, ENG-025)

### 4.1 URL builder

| Environment | Demo URL pattern |
|-------------|------------------|
| Local site-renderer | `http://{templateId}.localhost:3002/` |
| Production | `https://{templateId}.codedpixels.co.uk/` |

Env: `NEXT_PUBLIC_TEMPLATE_PREVIEW_BASE_URL` (optional override for staging).

**Module:** `apps/marketing/lib/template-preview-urls.ts`

### 4.2 Homepage configurator (`ENG-024`)

| Surface | Behaviour |
|---------|-----------|
| **Step 1 cards** | WebP thumbnail when file exists; gradient fallback; **Preview full site** link per library template |
| **LivePreviewPanel** | Keep mock wireframe + feature badges (ENG-013); add **Preview full site →** when `templateId` selected |
| **Mobile** | Preview tab unchanged; link in expanded panel + on selected card |

### 4.3 `/templates` gallery (`ENG-025`)

| Surface | Behaviour |
|---------|-----------|
| Gallery cards | WebP thumbnail (`public/templates/previews/{templateId}.webp`) + gradient fallback |
| Actions | **Use this template** (existing) + **Preview full site** (new tab) |

### 4.4 Thumbnail assets (INF-006)

| Item | Spec |
|------|------|
| Path | `apps/marketing/public/templates/previews/{templateId}.webp` |
| Generation | Playwright screenshot of demo tenant homepage after `seed:template-demos` |
| CI | `npm run generate:template-thumbnails` (emulator + renderer dev or static export) |
| Fallback | Category gradient (current MVP) until WebP exists |

**Brand:** Dr. Marcus Chen — no invented template colours; thumbnails are renderer captures only.

### 4.5 Thumbnail generation — failure and partial-success contract

| Layer | Contract |
|-------|----------|
| **`generate:template-thumbnails` script (INF-006)** | **Fails closed** — exit code 1 if any library template screenshot fails; stderr lists failed `templateId`s |
| **Timing** | Runs **after** `seed:template-demos` succeeds (demo URL must render); not part of demo seed itself |
| **Partial output** | Script writes WebP atomically per template (write temp → rename); failed templates leave prior WebP unchanged or absent |
| **Marketing UI (ENG-024, ENG-025)** | **Never fails** — missing WebP → category gradient fallback (current MVP behaviour) |
| **CI (INF-007, Wave 20)** | PR gate: seed change without thumbnail update fails or opens follow-up ticket per DOC-011 |
| **Local dev** | Thumbnails optional — preview links work without WebP |

---

## 5. SEO, security & site-renderer contracts

### 5.1 `isPlatformDemo` → `noindex` implementation (precise)

**Decision:** Implement in site-renderer **`generateMetadata`** on the tenant catch-all route — not root `layout.tsx` (root layout has no tenant context).

| Item | Location | Behaviour |
|------|----------|-----------|
| Load `isPlatformDemo` | `apps/site-renderer/lib/tenant-resolution.ts` — extend `TenantContext` from `companies/{companyId}` | Cache tag unchanged (`tenant-context`) |
| Metadata robots | `apps/site-renderer/app/[[...pageSlug]]/page.tsx` — `generateMetadata()` | When `tenant.isPlatformDemo === true`: `{ robots: { index: false, follow: false } }` |
| HTTP header (optional) | Same metadata export — Next.js emits `X-Robots-Tag: noindex, nofollow` | Sufficient for Wave 19; no separate middleware |
| Analytics isolation | Demo tenants: **no** GA4 / marketing pixels in site-renderer (renderer has no tenant analytics in Phase 2) | N/A until Phase 2.2 tenant analytics |
| Sentry | Demo tenant errors → site-renderer DSN only; **exclude** from conversion funnels | Tag `isPlatformDemo: true` on Sentry scope when field present |
| `robots.txt` | Per-tenant robots **not** required Wave 19 | Optional Wave 20 — disallow demo subdomains |

**Verify:** View source or `curl -I` on `sparkle-clean.localhost:3002` shows `noindex` after INF-005.

### 5.2 Other SEO & security rules

| Item | Rule | Owner |
|------|------|-------|
| Preview links | `rel="noopener noreferrer"` | Dr. Victor Lang |
| Lighthouse | No iframe in Wave 19 — mock panel unchanged; mobile perf budget preserved | Dr. Isaac Berg |

---

## 6. Accessibility

| Requirement | Owner |
|-------------|-------|
| Preview link accessible name: `Preview {templateName} template in new tab` | Dr. Nadia Sokolov |
| WebP thumbnails: `alt="{templateName} website preview"` | Dr. Nadia Sokolov |
| Keyboard: preview link reachable from template card focus order | Dr. Nadia Sokolov |

---

## 7. Local dev workflow

```bash
# Terminal 1
npm run emulators

# Terminal 2 — catalogue + demo tenants (correct project)
FIREBASE_PROJECT_ID=codedpixels npm run seed:templates:emulator
FIREBASE_PROJECT_ID=codedpixels npm run seed:template-demos:emulator

# Terminal 3 — marketing
npm run dev

# Terminal 4 — site-renderer (for preview links)
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev:renderer

# Optional — regenerate WebP thumbnails
npm run generate:template-thumbnails
```

**Verify:** `http://sparkle-clean.localhost:3002/` renders published sections; marketing **Preview full site** opens same URL.

---

## 8. Wave 19 tickets

| ID | Title | Blocked by |
|----|-------|------------|
| **DOC-010** | This spec + Q65/Q66 in project plan + schema `isPlatformDemo` | — |
| **INF-005** | `seed:template-demos` + `seed.mjs` projectId fix + `RESERVED_TEMPLATE_SLUGS` | DOC-010 |
| **INF-006** | `generate:template-thumbnails` CI script | INF-005 |
| **ENG-024** | Homepage preview links + Step1 thumbnails | DOC-010, INF-005 |
| **ENG-025** | `/templates` gallery thumbnails + preview links | DOC-010 |
| **ENG-026** | Onboarding slug validator — block reserved template slugs | DOC-010 |
| **ENG-027** | Starter selection UX — category filters + starter copy | DOC-010, ENG-024 |
| **QA-007** | E2E: filter → select starter → preview → get-started | ENG-024, ENG-025, ENG-027 |

**Parallel spool:**

1. DOC-010  
2. INF-005 ∥ ENG-026  
3. INF-006 ∥ ENG-024 ∥ ENG-025 ∥ ENG-027  
4. QA-007  

---

## 9. QA-007 E2E scope and dependencies

| Dependency | Requirement |
|------------|-------------|
| **Emulator** | Not required for href/assertion tests — preview link URL checked against `template-preview-urls.ts` pattern |
| **Optional CI job** | `@template-preview-smoke` tag — runs when `FIRESTORE_EMULATOR_HOST` + `seed:template-demos:emulator` + renderer on `:3002` available |
| **Regression** | Existing `configurator.spec.ts`, `get-started.spec.ts`, `spine.spec.ts` — must stay green (`templateId` selection unchanged) |
| **New spec** | `apps/marketing/e2e/template-preview.spec.ts` |

**Test cases (minimum):**

1. Step 1 category filter → select starter → preview link `href` contains `{templateId}.localhost:3002` (or prod base URL in CI env)
2. `/templates` — preview link present per library card; custom card has no preview link
3. Get-started CTA disabled until starter selected; URL `?template=` preserved after filter change
4. Builder slug unit tests (ENG-026) — separate from marketing E2E; QA-007 verifies marketing only

**Tagged optional smoke:** `GET sparkle-clean.localhost:3002` returns 200 with hero section text from seed (requires full stack in CI).

---

## 10. Expert sign-off register

| Expert | Domain | Verdict |
|--------|--------|---------|
| Dr. Nathan Cole | Coordinator | ☑ Wave 19 approved |
| Dr. Maya Patel | Decomposition | ☑ Ticket split |
| Dr. Lena Moreau | Documentation | ☑ Spec owner |
| Dr. Samuel Ruiz | Product | ☑ Q65 |
| Dr. Sophia Laurent | UX | ☑ Q66; no inline iframe v1 |
| Mr. Theo Laurent | Conversion | ☑ External preview CTA |
| Dr. Marcus Chen | Brand | ☑ WebP from renderer only |
| Dr. Michael Chen | Platform | ☑ Demo tenants in `companies/` |
| Dr. Rafael Ortiz | Firestore | ☑ `isPlatformDemo`; Admin seed only |
| Dr. Priya Desai | Schema | ☑ §6 field |
| Dr. Kai Nakamura | Functions | ☑ No provisionTenant in seed |
| Dr. Lena Petrova | Renderer | ☑ Published gate |
| Dr. Marcus Rivera | Hosting | ☑ Slug subdomains not reserved |
| Dr. Victor Lang | Security | ☑ External tab; iframe deferred |
| Dr. Nadia Sokolov | a11y | ☑ Link labels + alt text |
| Dr. Rajiv Singh | SEO | ☑ noindex demos |
| Dr. Isaac Berg | Perf | ☑ No iframe v1 |
| Dr. Sophia Moreau | E2E | ☑ QA-007 scope |
| Dr. Daniel Moreau | CI | ☑ projectId + thumbnail job |
| Dr. Alex Rivera | Seeding | ☑ Idempotent demo seed |

---

**Aligned with Dr. Samuel Ruiz on Q65** · **Dr. Sophia Laurent on Q66** · **Dr. Rafael Ortiz on demo tenant schema**
