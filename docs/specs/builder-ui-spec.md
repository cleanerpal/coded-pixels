# CodedPixels — Builder UI Specification (Phase 2)

**Document Owner:** Dr. Lena Moreau  
**Product:** Dr. Samuel Ruiz  
**Architecture:** Dr. Michael Chen, Dr. Lena Petrova  
**Status:** Outline — expand at Phase 2 kickoff  
**Parent spec:** [`codedpixels-project-plan.md`](codedpixels-project-plan.md) §18, Q34–Q43

---

## 1. Purpose

This document defines the **visual website builder** for `app.codedpixels.co.uk`. The marketing site + configurator spec is complete; this spec covers everything after `provisionTenant()`.

**Phase 2 MVP builder scope:**

- Edit homepage + additional pages from template seed
- Block-based section editor (not pixel-level Figma clone)
- Draft preview + one-click publish
- Subdomain live site (`{slug}.codedpixels.co.uk`)

**Out of Platform Phase 2 MVP:** drag-and-drop free positioning, multi-user collab, rollback UI, **full custom domain DNS UI (Platform Phase 2.1 — Q60)**.

**Expert review:** Approved as outline — [`expert-review-memo.md`](expert-review-memo.md)

---

## 2. User Flows

### 2.1 Entry points

| Source                          | Destination                             |
| ------------------------------- | --------------------------------------- |
| Post-checkout onboarding Step 4 | Builder with template draft loaded      |
| Dashboard → “Edit site”         | Builder for selected page               |
| Dashboard → “Add page”          | New page from blank or template partial |

### 2.2 Onboarding wizard (Q36)

See parent spec §18 — 4 steps: plan confirm → business name/slug → domain choice → builder.

### 2.3 Publish flow (Q35)

```
Edit draft → Preview (auth-gated) → Publish → Live site updated (ISR)
```

---

## 3. Component Registry

**Owner:** Dr. Lena Petrova + Dr. Julian Reyes (DOM/styling)

Each builder block is a **registered component type** with:

- `type` — stable string ID
- `label` — editor display name
- `icon` — Lucide icon name
- `category` — Layout | Content | Forms | Commerce | Media
- `schema` — Zod schema for `props`
- `defaultProps` — seed values
- `Component` — React renderer (shared with live site)
- `EditorPanel` — sidebar fields for editing props

### 3.1 Phase 2 component set (MVP)

| Type            | Category | Props (summary)                                                     |
| --------------- | -------- | ------------------------------------------------------------------- |
| `hero`          | Layout   | headline, subheadline, ctaText, ctaLink, backgroundImage, alignment |
| `text-block`    | Content  | body (Tiptap JSON — see §13)                                        |
| `features-grid` | Content  | items[{ icon, title, description }]                                 |
| `contact-form`  | Forms    | fields[], submitLabel, successMessage                               |
| `image-gallery` | Media    | images[{ src, alt, caption }]                                       |
| `testimonials`  | Content  | items[{ quote, author, role }]                                      |
| `cta-banner`    | Layout   | headline, buttonText, buttonLink                                    |
| `footer`        | Layout   | links[], social[], copyright                                        |

### 3.2 Feature-gated components (from configurator add-ons)

| Add-on      | Unlocks                                          |
| ----------- | ------------------------------------------------ |
| `ecommerce` | `product-grid`, `product-detail`, `cart-summary` |
| `booking`   | `booking-widget`                                 |
| `crm`       | Form → leads pipeline (backend)                  |

Gated types visible in palette but locked with upgrade CTA if add-on not enabled.

### 3.3 Schema example

```typescript
// lib/builder/registry/hero.ts
export const heroSchema = z.object({
  headline: z.string().max(120),
  subheadline: z.string().max(240).optional(),
  ctaText: z.string().max(40).optional(),
  ctaLink: z.string().url().or(z.literal('#contact')),
  backgroundImage: z.string().url().optional(),
  alignment: z.enum(['left', 'center', 'right']).default('center'),
});
```

---

## 4. Firestore Data Model (Q34)

```
companies/{companyId}/sites/{siteId}/
  ├── meta: { name, slug, templateId, featureIds[], status }
  ├── pages/{pageId}
  │     ├── slug, title, sortOrder, seo
  │     ├── draftVersionId
  │     └── publishedVersionId
  └── pages/{pageId}/versions/{versionId}
        ├── status: draft | published | archived
        ├── sections: Section[]
        ├── createdAt, createdBy, publishedAt?
        └── schemaVersion: 1
```

**Section:**

```typescript
interface Section {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  children?: Section[]; // max depth 2 in Phase 2
}
```

**Template seed:** On `provisionTenant`, clone `templates/{templateId}/defaultSections` into first page `versions/{draftId}`.

---

## 5. Builder UI Layout

**Owner:** Dr. Sophia Laurent

```
┌─────────────────────────────────────────────────────────────┐
│ Top bar: Site name · Preview · Publish · Settings · Account │
├──────────┬──────────────────────────────┬───────────────────┤
│ Pages    │ Canvas (live preview)        │ Properties panel  │
│ list     │                              │ (selected section)│
│          │                              │                   │
│ + Add    │                              │                   │
├──────────┴──────────────────────────────┴───────────────────┤
│ Section palette (bottom drawer on mobile)                   │
└─────────────────────────────────────────────────────────────┘
```

### 5.1 Interactions (Phase 2 MVP)

**Aligned with Dr. Sophia Laurent** (configurator UX patterns) · **Dr. Nadia Sokolov** (keyboard/focus — panel notes A1–A8)

**Core edit loop (desktop ≥ 768px):**

- Click section on canvas → select → edit props in right panel
- Add section from palette → append to page (end of `sections` array)
- Reorder sections via **Up / Down** buttons in canvas toolbar or properties panel header (drag reorder **Phase 2.1**)
- Delete section → confirm dialog (*“Remove this section?”*); focus returns to canvas or next section
- Undo/redo: **Phase 2.1** (local stack optional in Phase 2)

#### Keyboard navigation & focus order (Dr. Nadia Sokolov)

| Requirement | Spec |
| ----------- | ---- |
| **Skip link** | First focusable element: *“Skip to canvas”* → moves focus to canvas landmark |
| **Tab order** | Top bar (left → right) → Pages list → Canvas → Properties panel → Section palette |
| **Canvas** | `role="region"` + `aria-label="Page canvas"`; each section wrapper `role="group"` + `aria-label` from block `label` (e.g. *“Hero section”*) |
| **Selection** | Selected section: `aria-selected="true"` on section wrapper; **visible focus ring** (brand primary outline, 2px, offset 2px) — distinct from selection border |
| **Arrow keys** | When focus is in Pages list: ↑/↓ change active page. When focus is on a selected section in canvas: ↑/↓ move selection (and sync props panel). Palette: ←/→ or ↑/↓ move between block types |
| **Enter / Space** | On palette item: add section (if not locked). On canvas section: select / open props panel focus to first field |
| **Escape** | Deselect section; close mobile drawer if open; does **not** trap focus in chrome |
| **Delete** | With section selected: open delete confirm (not instant delete) |
| **Focus management** | After add: focus new section on canvas. After delete: focus next section or canvas landmark. After page switch: focus first section or empty-state CTA |
| **Touch targets** | Chrome controls minimum **44×44px**; respect `prefers-reduced-motion` for drawer/sheet animations |
| **Live regions** | Page title in top bar + publish status: `aria-live="polite"` when draft saves or validation errors update |

Route guards and viewer role (§9): viewer may Tab through chrome but all edit controls `disabled` + `aria-disabled="true"`; Preview link remains active.

#### Section selection states

| State | Canvas | Properties panel |
| ----- | ------ | ---------------- |
| **Default** | Section at rest; hover shows light outline (`#E2E8F0`) | Empty state: *“Select a section to edit”* |
| **Selected** | 2px brand-primary border + `aria-selected="true"` | Block label + fields for `EditorPanel` |
| **Focused** (keyboard) | Focus ring on section wrapper (in addition to selection border when applicable) | First invalid field receives focus on validation failure |
| **Hover** | Cursor pointer; subtle elevation or outline | — |
| **Error** | Section border **error** colour + icon badge; `aria-invalid="true"` on wrapper | Inline field errors; section header shows *“Fix errors to publish”* |
| **Locked** (feature-gated palette item) | — | Upgrade CTA only; no props |

Only **one** section selected at a time in Phase 2 MVP.

#### Empty page states

| Scenario | Canvas | Pages list / palette |
| -------- | ------ | -------------------- |
| **Blank page** (`sections.length === 0`) | Centred illustration + *“Add your first section”* + primary button opens palette / focuses first palette item | Page row shows slug; no error styling |
| **Template seed** (post-onboarding) | Pre-populated sections; first section not auto-selected | — |
| **All sections deleted** | Same as blank page | — |
| **Loading** | Skeleton blocks matching typical hero + text layout | Skeleton rows; `aria-busy="true"` on canvas |
| **Load failure** | Error banner + *“Retry”* (re-fetch draft version) | Non-blocking toast |

Empty state CTA must be keyboard-reachable without mouse.

#### Error & validation UX (properties panel)

Validation source: Zod `schema` per block type (§3) + server re-validation in `publishSite` (§7.1).

| Trigger | Behaviour |
| ------- | --------- |
| **Field blur** | Validate single field; show inline error below control (`role="alert"` on error text) |
| **Save / debounced draft write** | Validate all fields on selected section; do not block other sections |
| **Publish click** | Validate **all sections** on **all pages**; block publish if any error |

**Inline field pattern:** error text in plain language (Mia Thompson); associate via `aria-describedby`. Invalid controls: `aria-invalid="true"`. Required image fields: alt text enforced before asset is attachable (§14).

**Publish blocked:** modal or top-bar banner listing pages/sections with errors; *“Go to section”* links move selection + focus first invalid field.

**Server mismatch** (draft changed elsewhere): toast *“Couldn’t save — refresh and try again”*; offer refresh action.

**Gated components:** if draft contains locked types without `featureIds`, publish fails with upgrade CTA (server-side — Victor Lang panel note).

#### Mobile bottom drawer behaviour (Q52)

Viewport **&lt; 768px** — builder routes are **read-only** (Q52): no props editing, no add/delete/reorder.

| Surface | Behaviour |
| ------- | --------- |
| **Canvas** | Full-width read-only preview of draft sections; *“Edit on desktop”* sticky banner (minimum 44px tap height) |
| **Section palette drawer** | **Collapsed by default**; user may expand to **browse** block types (labels + icons). Add actions **disabled** with tooltip *“Editing available on desktop”* |
| **Properties panel** | **Not shown** on mobile builder routes |
| **Top bar** | Preview + live-site link active; Publish **disabled** on mobile |
| **Gesture** | Swipe up on drawer handle opens palette sheet; swipe down or Esc closes; focus moves to drawer on open, returns to banner on close |
| **Dashboard mobile** | *“Preview site”* opens full preview route or live URL — supported (Q52) |

Desktop (≥ 768px): palette is a **persistent bottom bar** (not overlay); collapsible via chevron to maximise canvas height.

### 5.2 Preview vs published (Q35)

**Aligned with Dr. Marcus Rivera** (hosting) · **Dr. Sophia Laurent** (preview UX)

| Mode | URL | Auth | Data source |
| ---- | --- | ---- | ----------- |
| **Editor canvas** | In-app (`/dashboard/sites/{siteId}/pages/{pageId}`) | Required (member) | `draftVersionId` — live React render |
| **Full preview** | `app.codedpixels.co.uk/sites/{siteId}/preview` (+ optional `?page={pageId}`) | Required (member) | `draftVersionId` |
| **Live** | `https://{slug}.codedpixels.co.uk` (+ page path) | Public | `publishedVersionId` |

Preview and editor read **draft**; live site reads **published** only (Firestore rules — `firestore-schema.md` §7.2).

#### iframe vs in-app preview (decision)

| Surface | Mechanism | Rationale |
| ------- | --------- | --------- |
| **Editor canvas** | **In-app** — shared component registry / renderer package, **not** an iframe | Click-to-select, selection chrome, and props panel require DOM access (same principle as marketing configurator §6: no iframe to external builder) |
| **Full preview route** | **In-app route** in builder App Hosting backend using the **same shared renderer** with draft sections injected | Auth-gated draft data cannot be shown on public `{slug}` subdomain; avoids cross-origin iframe + cookie complexity |
| **Live site** | **Separate** `site-renderer` backend on `*.codedpixels.co.uk` (§12) | ISR, public cache, tenant resolution from hostname |

Full preview may offer **“Open in new tab”** (same preview URL) for browser-chrome testing. **Do not** iframe the live subdomain inside the builder — that shows published content, not draft.

#### Preview URL auth flow

1. User clicks **Preview** in top bar (or dashboard *“Preview site”*).
2. If session expired → redirect to Firebase Auth login with `returnUrl=/sites/{siteId}/preview`.
3. Route guard verifies custom claims / `companies/{companyId}/members/{uid}`:
   - **owner, admin, editor** → full preview (read-only render of draft).
   - **viewer** → preview allowed; builder edit routes redirect to preview-only shell (§9).
   - **No membership** → 403 + *“You don’t have access to this site”*.
4. Client loads `sites/{siteId}/pages/*` metadata, resolves each page’s `draftVersionId`, fetches version docs (Firestore member read).
5. Preview chrome: minimal top bar (*“Draft preview”* badge, *“Back to editor”*, optional page switcher). **No** publish from preview route in Phase 2 MVP (return to editor to publish).

Draft version docs are **denied** to anonymous and non-member clients (rules spec).

#### Draft vs published data loading

| Consumer | Resolution path | Cache |
| -------- | --------------- | ----- |
| **Editor / preview** | `page.draftVersionId` → `versions/{draftVersionId}` → `sections[]` | Client subscription or fetch-on-navigate; always reflect latest draft write |
| **Live renderer** | `page.publishedVersionId` → `versions/{publishedVersionId}` → `sections[]` | ISR + on-demand revalidation after publish |
| **First publish** (no `publishedVersionId`) | Live site shows template placeholder or empty until first successful publish | — |
| **Mid-edit** | Live unchanged until Publish completes | Draft mutations do not touch published version doc |

Page switch in editor: load target page’s `draftVersionId`; canvas replaces sections; selection cleared.

#### What changes on **Publish** (ties to §7.1)

User clicks **Publish** in editor top bar (desktop only in Phase 2 — mobile disabled per §5.1).

| Step | System | User-visible |
| ---- | ------ | -------------- |
| 1 | Client optional pre-check; then Callable `publishSite({ siteId })` | Button → loading state *“Publishing…”*; disabled double-submit |
| 2 | Function validates all draft sections (Zod + gated types vs `featureIds`) | On failure: error summary (same pattern as §5.1 validation UX) |
| 3 | Copy draft version → **new** version doc `status: published`; set `page.publishedVersionId`; archive prior published if &gt; 5 retained (Q53) | — |
| 4 | Draft version doc **remains** the working draft for continued edits (Q34) | Editor canvas unchanged; top bar shows *“Published”* timestamp |
| 5 | `revalidatePath` / on-demand ISR for live site paths (§12) | Success toast: *“Site published”* + **View live site** link (`{slug}.codedpixels.co.uk`) |
| 6 | SendGrid `site-published` email (Q41) | — |

Until step 5 completes, live site continues to serve the **previous** `publishedVersionId`. No manual Hosting deploy per edit (Q35 instant publish).

---

## 6. Site Renderer

Shared Next.js app (or package `@codedpixels/site-renderer`):

- Resolves tenant from hostname (`slug.codedpixels.co.uk`) or custom domain mapping
- Loads `publishedVersionId` sections from Firestore (cached)
- Maps `section.type` → React component from registry
- ISR: revalidate on `publishSite` webhook

---

## 7. Publishing & Rollback

### 7.1 Publish (Phase 2)

Cloud Function `publishSite(siteId)`:

1. Validate draft sections against schemas
2. Copy draft version doc → new version with `status: published`
3. Update `page.publishedVersionId`
4. Call `revalidatePath` / on-demand ISR for live site
5. Send “Site published” email (SendGrid)

### 7.2 Rollback (Phase 2.1)

- Retain last **5** published versions per page
- Dashboard: “Version history” → Restore
- Restore = set `publishedVersionId` to older version + revalidate

---

## 8. Custom Domains (Q37 — Platform Phase 2.1)

Full DNS verification UI deferred to **Platform Phase 2.1** (Q60). Platform Phase 2 onboarding assigns `{slug}.codedpixels.co.uk` only.

When shipped, dashboard → Settings → Domains:

1. Enter domain
2. Show DNS records
3. Poll verification status
4. On active: map in Firebase Hosting + SSL auto

Detail in parent spec §18 Q37.

---

## 9. RBAC in Builder (Q39)

| Role                 | Builder access        |
| -------------------- | --------------------- |
| owner, admin, editor | Full edit + publish   |
| viewer               | Preview only, no edit |

Enforced in Firestore rules + UI route guards.

---

## 10. Email & Notifications (Q41)

**Owner:** Dr. Aria Bennett — SendGrid templates:

- `welcome`, `plan-confirmed`, `site-published`, `domain-verified`, `payment-failed`

Triggered from Cloud Functions; see parent spec.

---

## 11. Accessibility (Phase 2 kickoff)

**Owner:** Dr. Nadia Sokolov — expand before builder UI wireframes. See [`expert-review-memo.md`](expert-review-memo.md) panel notes A1–A8.

---

## 12. Site Renderer & Hosting Model

**Owner:** Dr. Marcus Rivera + Dr. Michael Chen

- **Shared site-renderer** App Hosting backend with wildcard `*.codedpixels.co.uk` (not per-tenant Hosting sites)
- Tenant resolution via middleware + `slugs/{slug}` index doc
- `provisionTenant` writes slug mapping; does not create N Hosting sites
- On-demand ISR revalidation API (secret-protected) called from `publishSite`

Detail filed in expert review memo — finalize at B0 kickoff.

---

## 13. Rich Text — Tiptap (Q45)

**Dr. Lena Petrova**

- Editor: **Tiptap** with StarterKit subset (bold, italic, link, H2–H3, lists)
- Storage: Tiptap JSON in `section.props.body`
- Renderer: `@tiptap/react` read-only `EditorContent` or custom JSON→HTML mapper
- No raw HTML paste; strip unsupported nodes on paste

---

## 14. Image Assets (Q44)

**Dr. Nora Patel + Dr. Clara Voss**

Upload flow in builder:

1. User selects image → crop/resize UI (max 1920px)
2. **Alt text required** (accessibility — Dr. Nadia Sokolov)
3. Upload to Storage → **ClamAV scan (custom Function)** → **Resize Images Extension** → metadata doc
4. Asset picker stores `assetId` + `altText` in section props

Limits: 5 MB; JPEG/PNG/WebP/GIF only. See project plan §23 Q64.

---

## 15. Dashboard Surfaces (Q46–Q51)

| Route                            | Phase | Purpose                                  |
| -------------------------------- | ----- | ---------------------------------------- |
| `/dashboard`                     | 2     | Site overview, quick actions             |
| `/dashboard/leads`               | 2     | CRM table inbox (Q50)                    |
| `/dashboard/products`            | 2     | Ecommerce list + basic editor (Q51)      |
| `/dashboard/billing`             | 2     | Link to **Stripe Customer Portal** (Q46) |
| `/dashboard/team`                | 2.1   | Invites + roles (Q47)                    |
| `/dashboard/sites/{id}/versions` | 2.1   | Version history + restore (Q53)          |

---

## 16. Mobile Builder (Q52)

- Viewport `< 768px`: builder routes show read-only canvas + desktop CTA
- Dashboard mobile: leads read, billing portal, site preview — supported

---

## 17. Observability & Security (Q48–Q49)

- **Sentry** on builder app + Cloud Functions (Dr. Mira Solano)
- Public forms: App Check + reCAPTCHA v3 + rate limit 10/hr/IP + honeypot

---

## 18. Open Items (expand at Phase 2 kickoff)

- [ ] Detailed wireframes per screen (Figma)
- [x] Rich text editor → **Tiptap** (Q45)
- [x] Image upload UX → **Firebase Storage + ClamAV** (Q44)
- [x] Mobile builder → **read-only Phase 2** (Q52)
- [x] Ecommerce product editor → **basic form** (Q51)
- [x] CRM/leads inbox → **table + filters** (Q50)
- [ ] Accessibility audit of builder chrome (Dr. Nadia Sokolov)
- [ ] E2E tests for edit → publish → live (Dr. Sophia Moreau)

---

## 19. Phase 2 Milestones

| Milestone | Deliverable                                                                |
| --------- | -------------------------------------------------------------------------- |
| B0        | Monorepo package: registry + renderer + shared types                       |
| B1        | Firestore schema + seed templates + security rules                         |
| B2        | Builder shell UI (canvas + props panel)                                    |
| B3        | Preview + publish pipeline                                                 |
| B4        | Live site renderer on `{slug}.codedpixels.co.uk`                           |
| B5        | Onboarding wizard integration                                              |
| B6        | Stripe Extension + SendGrid transactional + custom `provisionTenant` hooks |
| B7        | Storage pipeline: ClamAV Function + **Resize Images Extension** + Tiptap   |
| B8        | Leads inbox + basic products + Stripe Customer Portal                      |
| B9        | Sentry + form abuse protection (App Check, reCAPTCHA, rate limits)         |

---

**Next action:** Platform Phase 2 kickoff — Dr. Maya Patel decomposes B0–B9. Spec approved as outline pending P1 items in review memo.
