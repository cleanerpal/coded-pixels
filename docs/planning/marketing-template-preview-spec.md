# Marketing Template Preview Spec

**Ticket:** DOC-010 · Phase 2.1 Wave 19  
**Document owner:** Dr. Lena Moreau  
**Coordinator:** Dr. Nathan Cole  
**Status:** Approved — expert panel 12 June 2026  
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

---

## 5. SEO & security

| Item | Rule | Owner |
|------|------|-------|
| Demo sites | `noindex, nofollow` via site-renderer layout when `isPlatformDemo` | Dr. Rajiv Singh |
| `robots.txt` | Demo subdomains disallow optional — noindex header sufficient for Wave 19 | Dr. Rajiv Singh |
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

## 9. Expert sign-off register

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
