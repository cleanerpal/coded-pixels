# Starter Template Library — Expert Plan

**Coordinator:** Dr. Nathan Cole  
**Product:** Dr. Samuel Ruiz · **UX:** Dr. Sophia Laurent, Mr. Theo Laurent · **Copy:** Ms. Lila Moreau  
**Data/seeds:** Dr. Rafael Ortiz, Dr. Alex Rivera · **Brand:** Dr. Marcus Chen  
**Status:** Approved 12 June 2026 — panel synthesis after user requirement  
**Related:** [`marketing-template-preview-spec.md`](marketing-template-preview-spec.md) · [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) · **Q67, Q68**

---

## 1. User requirement

> Multiple templates generated so the user can select their **first initial starter** website.

---

## 2. What already exists (do not rebuild)

| Asset | Count | Status |
|-------|-------|--------|
| Library starter designs (JSON seeds) | **10** | Shipped Wave 12 (`packages/templates/seeds/`) |
| Marketing metadata | **10** + Custom | Shipped Wave 1–3 (`lib/templates.ts`) |
| Selection → first site | `templateId` → `provisionTenant` clone | Shipped Wave 16 |
| Renderer | Shared component registry | Shipped Wave 13–15 |

**The 10 starters are already “generated”** as authored seed files — each is a full homepage (hero, features, CTA, footer, etc.). The gap is **visibility** (Wave 19) and **product framing** (ENG-027).

---

## 3. Expert verdict — Q67

**Question:** Does the product deliver “multiple starter templates for first site selection”?

**Decision (Q67):** **Yes — 10 library templates across 7 UK SMB categories satisfy launch.** They are positioned in UX copy as **starter designs** (editable starting points, not finished sites). Category gaps expand in Wave 20 (B10-001), not blockers for Wave 19.

| Expert | Sign-off |
|--------|----------|
| Dr. Samuel Ruiz | ☑ 10 sufficient for UK SMB launch |
| Dr. Sophia Laurent | ☑ Category coverage adequate; filters improve discoverability |
| Mr. Theo Laurent | ☑ “Starter design” framing required in copy |
| Dr. Marcus Klein | ☑ Any template on Starter £9.99 — price unchanged by pick |

---

## 4. Expert verdict — Q68 (how new starters are created)

**Question:** How are additional starter templates “generated”?

**Decision (Q68):**

| Method | When | Owner |
|--------|------|-------|
| **Manual JSON authoring** | Now — only supported path | Dr. Rafael Ortiz, Dr. Marcus Chen |
| **Scaffold script** | Wave 20 — `new-template.mjs` boilerplate | Dr. Alex Rivera (B10-002) |
| **CI validate + seed** | Every add — `validate:templates`, bump `seedVersion`, `contentHash` | Dr. Daniel Moreau |
| **AI-assisted authoring** | **Phase 2.2+** — separate from customer AI Content add-on | Dr. Samuel Ruiz (backlog) |

**Quality bar (minimum starter):**

- Zod-valid sections per `component-registry`
- Metadata row in `lib/templates.ts` (name, category, description, `sortOrder`)
- **≥ 5 sections** including `hero`, `footer`, and `cta-banner` or `contact-form`
- Matching seed file + manifest entry + demo tenant (after INF-005) + WebP thumbnail (INF-006/007)
- `RESERVED_TEMPLATE_SLUGS` updated when slug = `templateId`

---

## 5. Wave 19 — make starters visible + selectable

| Ticket | Delivers |
|--------|----------|
| **INF-005** | Published **demo site per starter** (user can preview real design) |
| **INF-006** | WebP thumbnails on picker cards |
| **ENG-024** | Homepage: preview links, thumbnails, **starter copy** on Step 1 |
| **ENG-025** | Gallery: **“Start with this design”**, starter H1 |
| **ENG-027** | **Category filter chips** on Step 1; Starter package copy (“any template included”) |
| **ENG-026** | Reserve template slugs for demos |
| **QA-007** | E2E: filter → select starter → preview → get-started |

### Copy anchors (ENG-024, ENG-025, ENG-027)

| Location | Copy |
|----------|------|
| Configurator Step 1 `h2` | **Choose your starter website** |
| Step 1 subtext | All templates included on every plan — pick a design to start, then customise |
| `/templates` H1 | **Starter designs for your business** |
| Gallery CTA | **Start with this design** (replaces “Use this template”) |
| Preview link | **Preview full site** (unchanged) |

Ms. Lila Moreau reviews tone before wave close.

---

## 6. Wave 20 — expand starter library (optional stretch)

| Ticket | Delivers |
|--------|----------|
| **DOC-011** | Template addition governance (checklist, CI gates) — **blocks B10-001** |
| **B10-001** | **4 new starter seeds** (panel priority gaps) |
| **B10-002** | `new-template.mjs` scaffold + authoring guide |
| **INF-007** | GitHub Actions: auto-run `generate:template-thumbnails` on seed PRs |

### B10-001 proposed starters (Wave 20)

| templateId | Name | Category |
|------------|------|----------|
| `wellness-clinic` | Wellness Clinic | healthcare-wellbeing |
| `clear-accounting` | Clear Accounting | professional-services |
| `focus-photography` | Focus Photography | creative-services |
| `fit-hub` | Fit Hub | fitness-wellness |

Requires new `TemplateCategory` values in shared-types + brand guide category list update.

---

## 7. End-to-end starter journey (after Wave 19)

```
Homepage Step 1 — filter by category
        ↓
Pick starter design (10 options) + preview demo site
        ↓
Configure features + Get Started (templateId in URL)
        ↓
Checkout / signup → provisionTenant clones starter sections
        ↓
Builder — customer's first draft matches chosen starter
```

---

## 8. Expert sign-off register

| Expert | Domain | Verdict |
|--------|--------|---------|
| Dr. Nathan Cole | Coordinator | ☑ Plan approved |
| Dr. Maya Patel | Tickets | ☑ Wave 19 + 20 split |
| Dr. Samuel Ruiz | Product | ☑ Q67 |
| Dr. Sophia Laurent | UX | ☑ ENG-027 filters |
| Mr. Theo Laurent | Conversion | ☑ Starter framing |
| Ms. Lila Moreau | Copy | ☑ Copy table §5 |
| Dr. Marcus Klein | Pricing | ☑ Template ≠ price |
| Dr. Rafael Ortiz | Seeds/schema | ☑ Q68 manual + scaffold |
| Dr. Alex Rivera | Seeding | ☑ B10-002 |
| Dr. Marcus Chen | Brand | ☑ Thumbnails from renderer |
| Dr. Nadia Sokolov | a11y | ☑ Filter `role="radiogroup"` |
| Dr. Lena Moreau | Docs | ☑ DOC-011 owner |

---

**Aligned with Dr. Samuel Ruiz on Q67** · **Dr. Rafael Ortiz on Q68**
