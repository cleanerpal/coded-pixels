# Template Addition Governance Spec

**Ticket:** DOC-011 · Wave 20  
**Document owner:** Dr. Lena Moreau  
**Coordinator:** Dr. Nathan Cole  
**Status:** Approved — blocks B10-001 code · 12 June 2026  
**Blocks:** B10-001, B10-002, INF-007  
**Related:** [`starter-template-library-plan.md`](starter-template-library-plan.md) · [`template-seeding-ci-spec.md`](template-seeding-ci-spec.md) · **Q68**

---

## 1. Purpose

Define **mandatory, checkable** governance before any new library template enters the catalogue — closing the Wave 20 ambiguity flagged by external review.

**Gate rule:** B10-001 code work **forbidden** until every item in §3 checklist is satisfied for DOC-011 itself, and §4 per-template checklist exists.

---

## 2. Decisions

### Q69 — `new-template.mjs` authority scope

**Question:** May the scaffold script mutate manifest and marketing metadata automatically?

**Decision:** **Skeleton only** — script generates `{templateId}.defaultSections.json` + optional stub metadata file. **Human PR** must update:

- `manifest.json` (+ `seedVersion` bump)
- `content-hashes.json` (CI regenerates)
- `apps/marketing/lib/templates.ts`
- `RESERVED_TEMPLATE_SLUGS` (via manifest sync or manual append)
- Demo seed + thumbnails (INF-007)

| Owner | Verdict |
|-------|---------|
| Dr. Alex Rivera | ☑ CI parity requires human review of manifest |
| Dr. Rafael Ortiz | ☑ Firestore doc IDs are contractual |

### Q70 — B10-001 template IDs (finalized)

| templateId | Name | Category (new values in Wave 20) |
|------------|------|----------------------------------|
| `wellness-clinic` | Wellness Clinic | `healthcare-wellbeing` |
| `clear-accounting` | Clear Accounting | `professional-services` (existing) |
| `focus-photography` | Focus Photography | `creative-services` |
| `fit-hub` | Fit Hub | `fitness-wellness` |

**Type updates (B10-001 scope):**

- Add `healthcare-wellbeing`, `creative-services`, `fitness-wellness` to `TemplateCategory` in `@codedpixels/shared-types` (moved from marketing-local in Wave 20)
- Update brand guide category chip list (Dr. Marcus Chen)

---

## 3. DOC-011 mandatory checklist (blocks B10-001)

Before B10-001 lane agent spools:

- [ ] This spec on disk with expert sign-off (§6)
- [ ] §4 per-template checklist copied into PR template or `template-authoring-guide.md`
- [ ] Q69/Q70 recorded in project plan §20
- [ ] `implementation-tickets.md` B10-001 acceptance references §4
- [ ] INF-007 scope linked to thumbnail prerequisite
- [ ] **Soft gate (recommended):** Wave 19 demo seed + thumbnail jobs proven in emulator CI (or production seed run complete) before B10-001 code spool — coordinator discretion; not a hard blocker if Wave 19 wave close pending

---

## 4. Per-template addition checklist (each new library template)

| Step | Action | Owner |
|------|--------|-------|
| 1 | Choose unique `templateId` (kebab-case; not in `RESERVED_TEMPLATE_SLUGS` yet) | Product |
| 2 | Author `{templateId}.defaultSections.json` — minimum section bar (Q68): hero, features or text-block, CTA, footer, contact-form optional | Design |
| 3 | Run `npm run validate:templates` locally | Author |
| 4 | Add to `manifest.json`; bump `seedVersion` | Author |
| 5 | Add entry to `apps/marketing/lib/templates.ts` (Wave 20: shared-types manifest cross-check) | Author |
| 6 | Append to `RESERVED_TEMPLATE_SLUGS` | Author |
| 7 | Run `seed:templates:emulator` + `seed:template-demos:emulator` | Author |
| 8 | Run `generate:template-thumbnails` — all WebP committed or CI job green | Author |
| 9 | Brand review — thumbnail from renderer only | Marcus Chen |
| 10 | Copy review — description + category label | Lila Moreau |
| 11 | PR touches `packages/templates/seeds/` — INF-007 job runs | CI |

**Minimum section bar (Q68):** At least 4 sections including `hero` + `footer`; all `type` values must exist in component registry; Zod validation passes.

---

## 5. CI gates (INF-007)

| Trigger | Action |
|---------|--------|
| PR changes `packages/templates/seeds/**` | Run `validate:templates` + `generate:template-thumbnails` (emulator job) |
| Thumbnail diff missing | Fail PR or require `skip-thumbnail` label + follow-up ticket (coordinator only) |
| `seedVersion` not bumped on content change | Fail `validate:templates` |

---

## 6. Expert sign-off register

| Expert | Domain | Verdict |
|--------|--------|---------|
| Dr. Lena Moreau | Documentation | ☑ Spec owner |
| Dr. Samuel Ruiz | Product | ☑ Q68 bar |
| Dr. Rafael Ortiz | Schema/seeds | ☑ Manifest authority |
| Dr. Alex Rivera | Seeding | ☑ B10-002 scaffold scope |
| Dr. Marcus Chen | Brand | ☑ Thumbnail rule |
| Dr. Daniel Moreau | CI | ☑ INF-007 |
| Dr. Maya Patel | Tickets | ☑ Blocks B10-001 |

---

**Aligned with Dr. Rafael Ortiz on Q69** · **Dr. Samuel Ruiz on Q70 template IDs**
