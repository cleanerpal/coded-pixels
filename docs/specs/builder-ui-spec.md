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

- Click section on canvas → select → edit props in right panel
- Add section from palette → append to page
- Reorder sections via up/down buttons (drag reorder Phase 2.1)
- Delete section with confirm
- Undo/redo: **Phase 2.1** (local stack initially optional)

### 5.2 Preview vs published (Q35)

| Mode          | URL                                | Auth                    |
| ------------- | ---------------------------------- | ----------------------- |
| Editor canvas | In-app                             | Required                |
| Full preview  | `/sites/{siteId}/preview`          | Required (owner/editor) |
| Live          | `https://{slug}.codedpixels.co.uk` | Public                  |

Preview renders `draftVersionId`; live renders `publishedVersionId`.

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
