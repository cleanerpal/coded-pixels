# Template Authoring Guide

**Ticket:** B10-002 · Wave 20  
**Document owner:** Dr. Lena Moreau  
**Coordinator:** Dr. Nathan Cole  
**Related:** [`template-addition-governance-spec.md`](template-addition-governance-spec.md) · [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) · **Q68, Q69**

---

## 1. Purpose

Step-by-step guide for adding a new **library starter template** to CodedPixels. Follow this checklist for every new catalogue entry.

**Governance authority:** [`template-addition-governance-spec.md`](template-addition-governance-spec.md) §4 is the source of truth. This guide operationalizes that checklist for authors.

---

## 2. Q68 quality bar (minimum starter)

Every library template seed must satisfy:

| Requirement | Detail |
|-------------|--------|
| **Section count** | At least **4 sections** |
| **Required types** | `hero`, `footer`, plus `features-grid` **or** `text-block`, plus `cta-banner` |
| **Optional** | `contact-form` (may replace or supplement CTA depending on design) |
| **Registry** | Every `type` must exist in the component registry |
| **Validation** | Passes `npm run validate:templates` (Zod + section tree) |
| **Metadata parity** | Seed `metadata` must match `apps/marketing/lib/templates.ts` after PR |

The scaffold script (`new-template.mjs`) generates placeholder copy meeting this bar. **Replace placeholder copy** with brand-reviewed starter content before wave close.

---

## 3. Q69 — scaffold script scope

**Question:** What may `new-template.mjs` automate?

**Answer:** **Skeleton only.** The script writes `{templateId}.defaultSections.json` with Q68-compliant placeholder sections. It does **not** update:

- `manifest.json` or `seedVersion`
- `content-hashes.json` (CI regenerates after manifest bump)
- `apps/marketing/lib/templates.ts`
- `RESERVED_TEMPLATE_SLUGS`
- Demo seed or thumbnails

All catalogue integration requires a **human PR** with coordinator review.

---

## 4. Per-template checklist

Copy this into your PR description when adding a template.

| Step | Action | Owner |
|------|--------|-------|
| 1 | Choose unique `templateId` (kebab-case; not yet in `RESERVED_TEMPLATE_SLUGS`) | Product |
| 2 | Run scaffold or author `{templateId}.defaultSections.json` — meet Q68 bar | Design |
| 3 | Replace placeholder copy; verify section props in builder preview | Design |
| 4 | Run `npm run validate:templates` locally | Author |
| 5 | Add to `manifest.json`; bump `seedVersion` | Author |
| 6 | Add entry to `apps/marketing/lib/templates.ts` (name, category, description, `sortOrder`) | Author |
| 7 | Append to `RESERVED_TEMPLATE_SLUGS` | Author |
| 8 | Run `seed:templates:emulator` + `seed:template-demos:emulator` | Author |
| 9 | Run `generate:template-thumbnails` — commit WebP or confirm CI job green | Author |
| 10 | Brand review — thumbnail from renderer only | Dr. Marcus Chen |
| 11 | Copy review — description + category label | Ms. Lila Moreau |
| 12 | PR touches `packages/templates/seeds/` — INF-007 CI runs | CI |

---

## 5. Using the scaffold script

From the repo root:

```bash
npm run new-template -- <templateId> [options]
```

Or from `packages/templates`:

```bash
node scripts/new-template.mjs <templateId> [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--name` | Display name in catalogue | Title-case from `templateId` |
| `--category` | `TemplateCategory` value | `general-business` |
| `--description` | One-line catalogue blurb | Generated placeholder |
| `--sort-order` | Picker sort position | `99` |
| `--middle` | `features-grid` or `text-block` | `features-grid` |

### Example

```bash
npm run new-template -- wellness-clinic \
  --name "Wellness Clinic" \
  --category healthcare-wellbeing \
  --description "Calm clinic site with services and booking CTA" \
  --sort-order 12 \
  --middle text-block
```

Output: `packages/templates/seeds/wellness-clinic.defaultSections.json`

The script validates output against Zod schemas and the Q68 section bar before writing. It exits with an error if the seed file already exists.

---

## 6. Manual authoring reference

Seed file structure follows [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) §3.2:

```json
{
  "templateId": "example-id",
  "metadata": {
    "name": "Example Name",
    "category": "general-business",
    "description": "Catalogue description",
    "sortOrder": 99,
    "isCustomTemplate": false
  },
  "defaultPage": {
    "title": "Home",
    "slug": "home",
    "seo": {
      "title": "Example Name — Professional Website",
      "description": "SEO meta description"
    }
  },
  "defaultSections": [ /* Section[] */ ]
}
```

**Allowed section types:** `hero`, `text-block`, `features-grid`, `contact-form`, `image-gallery`, `testimonials`, `cta-banner`, `footer`.

**Section rules:**

- `id` — stable UUID v4 in seed files (new UUIDs generated when cloning into tenant draft)
- `props` — validated at seed time against component Zod schemas
- `children` — optional; max nesting depth **2**

See existing seeds in `packages/templates/seeds/` for production examples (`sparkle-clean`, `business-core`).

---

## 7. CI gates (INF-007)

| Trigger | Action |
|---------|--------|
| PR changes `packages/templates/seeds/**` | Run `validate:templates` + thumbnail generation |
| Thumbnail diff missing | Fail PR or require coordinator `skip-thumbnail` label |
| `seedVersion` not bumped on content change | Fail `validate:templates` |

---

## 8. Expert ownership

| Domain | Expert |
|--------|--------|
| Seed schema / manifest | Dr. Rafael Ortiz |
| Scaffold script / seeding | Dr. Alex Rivera |
| Q68 quality bar | Dr. Samuel Ruiz |
| Brand / thumbnails | Dr. Marcus Chen |
| Copy / catalogue | Ms. Lila Moreau |
| CI validation | Dr. Daniel Moreau |

---

**Aligned with Dr. Alex Rivera on Q69** · **Dr. Samuel Ruiz on Q68** · **Dr. Lena Moreau on documentation**
