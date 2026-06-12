# Add-on Deliverables Matrix

**Ticket:** DOC-003 · Platform Phase 2 Wave 1  
**Document owner:** Dr. Lena Moreau  
**Domain experts:** Dr. Samuel Ruiz (product) · Dr. Sophia Laurent (UX)  
**Status:** Approved for Platform Phase 2 build  
**Last updated:** 12 June 2026  
**Blocks:** B8-001 (Leads inbox + products + Stripe portal)  
**Related:** [`../specs/codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md) Q30, Q41, Q46, Q50–Q51 · [`../specs/builder-ui-spec.md`](../specs/builder-ui-spec.md) §3.2 · [`../specs/firestore-schema.md`](../specs/firestore-schema.md) §6–7 · [`../../lib/features.ts`](../../lib/features.ts)

---

## 1. Purpose

This document maps each of the **11 configurator add-ons** to concrete **Platform Phase 2** builder and dashboard deliverables. It is the sign-off contract for **B8-001** and prevents marketing/configurator claims from outrunning shipped product (expert-review memo — Samuel Ruiz).

**Canonical pricing and IDs** come from `lib/features.ts` and project plan §3. All prices are **VAT-inclusive** (Q58).

**Feature gating:** `companies/{companyId}.plan.featureIds` and `sites/{siteId}.featureIds` (copied at provision) control builder palette locks, publish validation, and dashboard nav. `publishSite` must reject gated section types when the add-on is absent (Victor Lang — expert-review memo).

---

## 2. Summary table

| FeatureId | Marketing name | Monthly | Phase 2 MVP (one line) | Primary surface |
|-----------|----------------|---------|------------------------|-----------------|
| `crm` | CRM & Lead Management | +£4.99 | Leads inbox + form → lead pipeline | Dashboard |
| `email-automation` | Email Automation Sequences | +£5.99 | Owner alerts + single post-lead auto-reply | Dashboard + Functions |
| `analytics-seo` | Advanced Analytics & SEO Tools | +£3.99 | Per-page SEO panel + client GA4 + stats card | Builder + Dashboard |
| `sms` | SMS Notifications | +£2.99 | Owner SMS alert on new lead/booking | Dashboard + Functions |
| `ecommerce` | Ecommerce Store | +£9.99 | Product editor + gated shop components | Builder + Dashboard |
| `vat-mtd` | VAT & Tax Automation | +£4.99 | VAT number + inc-VAT display on products | Dashboard + Renderer |
| `booking` | Advanced Booking & Appointments | +£6.99 | `booking-widget` → lead with booking metadata | Builder + Dashboard |
| `ai-content` | AI Site Generation & Content Assistant | +£3.99 | AI copy suggestions on hero + text-block | Builder |
| `custom-template` | Custom Template Design | +£14.99/mo* | Design-request flag + dashboard status banner | Dashboard + Stripe |
| `white-label` | White-label / Remove Branding | +£9.99 | Hide “Powered by CodedPixels” on live site | Renderer |
| `priority-support` | Priority Support | +£4.99 | Priority support channel + SLA badge in account | Dashboard |

\*Alternate billing: one-time **£149** at checkout (Q2, Q13) — Stripe line item, not a separate monthly price.

---

## 3. Per add-on deliverables

### 3.1 `crm` — CRM & Lead Management (+£4.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | `contact-form` section submits to leads pipeline (existing base component; CRM add-on **required** for dashboard access and lead retention beyond 30-day trial — see rules). Form fields: name, email, phone (optional), message. |
| **Phase 2 MVP — dashboard** | **Leads inbox** at `app.codedpixels.co.uk/dashboard/leads` (Q50, Q62): table (name, email, phone, source page, date, status); search (client-side name/email); filters (status, date range, source page); row → detail drawer with full JSON payload; mark `new` → `read` → `archived`; **Export CSV** (Q42). |
| **Deferred Phase 2.1** | Kanban board; Algolia / Firestore extension full-text search; lead assignment tags; bulk actions. |
| **Deferred Phase 3** | CRM integrations (HubSpot, etc.); lead scoring; site content JSON export. |
| **Dependencies** | **Firestore:** `companies/{companyId}/sites/{siteId}/leads/{leadId}`; `usage/{YYYY-MM}.formSubmissions`. **Functions:** public form Callable (App Check + reCAPTCHA v3 + rate limit Q49). **Stripe:** subscription item for CRM (catalogue — DOC-004). No Stripe beyond billing. |
| **B8 acceptance criteria** | [ ] Inbox loads leads newest-first with status filter. [ ] Detail drawer shows full submission. [ ] CSV export downloads all leads for site. [ ] Non-CRM tenants see upgrade CTA, not inbox data. [ ] Form submit creates lead doc when CRM enabled. |

---

### 3.2 `email-automation` — Email Automation Sequences (+£5.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | No dedicated builder block. Contact/booking forms remain unchanged. |
| **Phase 2 MVP — dashboard** | **Settings → Email:** (1) toggle “Email me when a new lead arrives” (extends Q41 transactional email to owner); (2) **one fixed auto-reply** to submitter on new lead (“Thanks — we’ll be in touch within 24 hours”) with editable subject + body (plain text, SendGrid). No visual sequence builder in Phase 2. |
| **Deferred Phase 2.1** | Multi-step nurture sequences; delay steps; conditional branches; template library; unsubscribe management per sequence. |
| **Deferred Phase 3** | Behaviour-triggered emails (cart abandon, booking reminder); A/B subject lines; deliverability dashboard. |
| **Dependencies** | **SendGrid** via Cloud Functions (Q41 — Aria Bennett). **Firestore:** optional `companies/{companyId}/settings/emailAutomation` subdoc or fields on `companies/{companyId}` for toggles + template text. **Stripe:** subscription item. |
| **B8 acceptance criteria** | [ ] Owner notification sends on new lead when toggle on. [ ] Auto-reply sends once per submission when enabled. [ ] Feature absent → settings section shows upgrade CTA. [ ] Emails logged (SendGrid message ID in Function logs, no PII in Sentry). |

---

### 3.3 `analytics-seo` — Advanced Analytics & SEO Tools (+£3.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | **Per-page SEO panel** on selected page: edit `seo.title`, `seo.description` (Firestore `pages/{pageId}.seo`); live character-count hints; social preview stub (title + description). Base plan: homepage title only; this add-on unlocks SEO fields on **all pages**. |
| **Phase 2 MVP — dashboard** | **Analytics card:** 7-day pageview summary for `{slug}.codedpixels.co.uk` (GA4 Data API or embedded report — consent-gated on client site per cookie pattern). **SEO checklist** link: published pages missing meta description. |
| **Deferred Phase 2.1** | Google Search Console linking; keyword rank tracking; PostHog product analytics for builder. |
| **Deferred Phase 3** | Competitor SEO reports; automated schema.org suggestions beyond defaults. |
| **Dependencies** | **Firestore:** `pages/{pageId}.seo`. **GA4** on client renderer (consent banner on client sites — mirror marketing pattern). **Stripe:** subscription item. |
| **B8 acceptance criteria** | [ ] SEO fields editable on all pages when add-on active. [ ] Published site renders `<title>` and meta description from `seo` object. [ ] Dashboard analytics card shows data or honest empty state. [ ] Without add-on, SEO panel locked with upgrade CTA. |

---

### 3.4 `sms` — SMS Notifications (+£2.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | No builder block. |
| **Phase 2 MVP — dashboard** | **Settings → Notifications:** owner mobile number (E.164); toggle “SMS me on new lead or booking request”. Sends **one SMS to owner** per submission via Twilio (or approved SMS provider). No customer-facing SMS in Phase 2. |
| **Deferred Phase 2.1** | Booking reminder SMS to customer; order/shipping SMS (requires ecommerce checkout 2.1). |
| **Deferred Phase 3** | Marketing SMS with explicit consent capture; two-way SMS inbox. |
| **Dependencies** | **Twilio** (or equivalent) via Cloud Function on lead create. **Firestore:** `companies/{companyId}.settings.sms` (phone, enabled). **Stripe:** subscription item. |
| **B8 acceptance criteria** | [ ] Valid UK mobile + toggle on → owner receives SMS on new lead/booking. [ ] Invalid number shows inline validation. [ ] Feature absent → SMS settings hidden; upgrade CTA in Features. [ ] Rate limit: max 10 SMS/hour/company (abuse guard). |

---

### 3.5 `ecommerce` — Ecommerce Store (+£9.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | Unlocks palette types: `product-grid`, `product-detail`, `cart-summary` (builder-ui-spec §3.2). Locked with upgrade CTA when add-on off. `cart-summary` is **display-only** in Phase 2 (no live cart). |
| **Phase 2 MVP — dashboard** | **Products** at `app.codedpixels.co.uk/dashboard/products` (Q51): list table (thumb, name, price, draft/live); create/edit form — name, description (Tiptap short), price GBP, up to 5 images, optional SKU, publish toggle. |
| **Phase 2 MVP — live site** | Published products render on client site. **Buy** CTA → owner-configured external URL **or** Stripe Payment Link (manual setup in Stripe Dashboard; paste URL in product props). No native cart checkout in Phase 2. |
| **Deferred Phase 2.1** | Stripe Checkout cart on client site; `stripePriceId` sync; variants; inventory; shipping rules; products CSV export (Q42). |
| **Deferred Phase 3** | Subscriptions; multi-currency; tax calculation service. |
| **Dependencies** | **Firestore:** `.../products/{productId}`; `.../assets/{assetId}` for images. **Stripe:** subscription item + optional Payment Links (manual Phase 2). **Functions:** product CRUD via authenticated Callable or secured client writes per rules spec. |
| **B8 acceptance criteria** | [ ] Product CRUD works for ecommerce tenants. [ ] `product-grid` / `product-detail` render published products. [ ] Publish rejects ecommerce sections if add-on missing. [ ] Non-ecommerce tenants see upgrade CTA on Products nav. |

---

### 3.6 `vat-mtd` — VAT & Tax Automation (+£4.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | No builder block. Product price fields show “inc. VAT” helper when VAT add-on active (pairs with ecommerce). |
| **Phase 2 MVP — dashboard** | **Settings → Tax:** VAT registration number (optional); toggle “Show prices inc. VAT on site” (default on for UK B2C Q58). Product editor displays VAT-inclusive labelling. |
| **Phase 2 MVP — live site** | Product pages show “Price includes VAT where applicable” footnote when enabled. |
| **Deferred Phase 2.1** | Xero OAuth sync; sales summary export for MTD; multi-rate VAT. |
| **Deferred Phase 3** | HMRC MTD API direct submission; EU OSS; automated VAT returns. |
| **Dependencies** | **Firestore:** `companies/{companyId}.settings.tax` (vatNumber, displayIncVat). **Stripe:** subscription item. No Xero/HMRC APIs in Phase 2. |
| **B8 acceptance criteria** | [ ] VAT number stored and editable. [ ] Product/site displays respect inc-VAT toggle. [ ] Without add-on, tax settings hidden. [ ] Marketing copy must not claim “HMRC filing” until Phase 2.1 (use “VAT-ready display” only). |

---

### 3.7 `booking` — Advanced Booking & Appointments (+£6.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | Unlocks `booking-widget` section: service name, duration label, fields (name, email, phone, preferred date, preferred time, notes). Submits via same form Callable with `formType: "booking"`. |
| **Phase 2 MVP — dashboard** | Booking requests appear in **Leads inbox** with `formType` badge “Booking”; detail drawer shows date/time preferences. Requires **CRM add-on** for inbox — booking without CRM stores submission but owner must upgrade to view (or bundle enforced at configurator — Growth/Pro often include CRM). |
| **Deferred Phase 2.1** | Availability calendar; Google Calendar sync; automated email/SMS reminders; buffer times; services list CRUD. |
| **Deferred Phase 3** | Deposits via Stripe; staff/resource scheduling; multi-location. |
| **Dependencies** | **Firestore:** leads with `formType: "booking"`. **Functions:** form Callable (Q49). **Stripe:** subscription item. |
| **B8 acceptance criteria** | [ ] `booking-widget` in palette when add-on on; locked otherwise. [ ] Submit creates lead with booking fields. [ ] Inbox filters/booking badge work. [ ] Publish rejects `booking-widget` without add-on. |

---

### 3.8 `ai-content` — AI Site Generation & Content Assistant (+£3.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | **AI assist** on `hero` (headline, subheadline) and `text-block`: button “Suggest copy” → Cloud Function (Firebase AI Logic / Gemini) returns **3 alternatives**; user picks one to apply. Rate limit: **20 requests/day/company**. |
| **Phase 2 MVP — dashboard** | **Features** page shows AI quota used/remaining (read from usage counter). |
| **Deferred Phase 2.1** | Full-page generation; blog post drafts; bulk alt-text; brand tone setting. |
| **Deferred Phase 3** | Image generation; competitive copy analysis. |
| **Dependencies** | **Firebase AI Logic** (Cloud Function, `europe-west2`). **Firestore:** `usage/{YYYY-MM}.aiRequests` (increment on call). **Stripe:** subscription item. |
| **B8 acceptance criteria** | [ ] Suggest copy returns 3 options on hero/text-block when add-on on. [ ] Quota enforced; friendly limit message. [ ] Without add-on, AI button shows upgrade CTA. [ ] No PII sent to model beyond field text being edited. |

---

### 3.9 `custom-template` — Custom Template Design (+£14.99/mo or £149 one-time)

| | |
|---|---|
| **Phase 2 MVP — builder** | User edits seeded standard template in builder (no special canvas). Banner if `custom-template` in plan but user switched to standard template (Q40). |
| **Phase 2 MVP — dashboard** | **Design status banner:** “Custom design requested — our team will contact you within 5 business days.” Status field on company: `designRequestStatus: "pending" \| "in_progress" \| "delivered"`. No in-app design brief form in Phase 2. |
| **Deferred Phase 2.1** | In-app brief (brand colours, references upload); designer handoff workflow; preview of custom theme before apply. |
| **Deferred Phase 3** | Marketplace of designers; self-serve theme import. |
| **Dependencies** | **Stripe:** recurring subscription item **or** one-time £149 Checkout line item / invoice item at signup (Q13). **Firestore:** `companies/{companyId}.plan.customTemplateBilling`; optional `designRequestStatus`. **Internal:** ops queue (admin console — Q43), not customer-facing Firestore collection in Phase 2. |
| **B8 acceptance criteria** | [ ] Provision sets `designRequestStatus: "pending"` when feature present. [ ] Dashboard banner visible with correct status. [ ] One-time vs recurring reflected in `plan.customTemplateBilling`. [ ] Builder does not block editing while design pending. |

---

### 3.10 `white-label` — White-label / Remove Branding (+£9.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | No builder block. Optional read-only note in **Settings → Branding:** “CodedPixels badge hidden on live site.” |
| **Phase 2 MVP — live site** | Site renderer **omits** “Powered by CodedPixels” footer/badge when `white-label` ∈ `site.featureIds` (Q30, brand-guide §12). Default sites show badge. |
| **Deferred Phase 3+** | Agency **platform** white-label (`partnerId`, reseller-branded dashboard — Q30). Not this add-on. |
| **Dependencies** | **Firestore:** `sites/{siteId}.featureIds` only. **Stripe:** subscription item. No extra collections. |
| **B8 acceptance criteria** | [ ] Live site hides badge when add-on active. [ ] Live site shows badge when absent. [ ] `publishSite` does not strip badge server-side incorrectly. [ ] Dashboard/app remain CodedPixels-branded always. |

---

### 3.11 `priority-support` — Priority Support (+£4.99/mo)

| | |
|---|---|
| **Phase 2 MVP — builder** | No builder impact. |
| **Phase 2 MVP — dashboard** | **Account → Support:** “Priority” badge; dedicated link (`support@codedpixels.co.uk?subject=Priority`) or help-centre URL with priority queue tag; copy: “Typical response within 4 business hours.” Stored flag: `companies/{companyId}.plan.prioritySupport: true` (derived from featureIds). |
| **Deferred Phase 2.1** | In-app chat widget with priority routing (Intercom/Zendesk). |
| **Deferred Phase 3** | Named CSM for high-tier accounts. |
| **Dependencies** | **Stripe:** subscription item. **Firestore:** featureIds (no dedicated collection). **Ops:** support tooling tags — outside app codebase but required for SLA claim. |
| **B8 acceptance criteria** | [ ] Priority badge visible in account when add-on active. [ ] Support link distinct from standard tier. [ ] Without add-on, standard support copy only. [ ] Stripe subscription includes priority item when selected at signup. |

---

## 4. Cross-cutting B8-001 scope

**B8-001** implements dashboard surfaces that depend on this matrix:

| B8 workstream | Add-ons served | Doc sections |
|---------------|----------------|--------------|
| Leads inbox | `crm`, `booking` (via leads), `email-automation`, `sms` | §3.1, §3.2, §3.4, §3.7 |
| Products editor | `ecommerce`, `vat-mtd` | §3.5, §3.6 |
| Stripe Customer Portal | All (billing) | §4 below |

### 4.1 Stripe Customer Portal (all add-ons — Q46)

| Capability | Phase |
|------------|-------|
| Update payment method | **Phase 2** — “Manage billing” → Stripe Customer Portal session |
| View invoices & history | **Phase 2** |
| Cancel subscription | **Phase 2** |
| Add/remove add-ons (plan changes) | **Phase 2.1** — CodedPixels dashboard syncs subscription items |

**B8 acceptance criteria (billing):** [ ] Dashboard “Manage billing” opens Stripe Portal for owner. [ ] Active subscription reflects provisioned `plan.featureIds`. [ ] Cancelled/past_due states sync to `companies.status`.

---

## 5. Feature gating reference

| Layer | Behaviour |
|-------|-----------|
| **Builder palette** | Gated component types visible but locked + upgrade CTA (builder-ui-spec §3.2). |
| **`publishSite` Function** | Server-side validation: reject publish if draft contains sections requiring missing `featureIds`. |
| **Dashboard nav** | Hide or lock Leads, Products, Email/SMS settings based on `plan.featureIds`. |
| **Firestore rules** | Leads read requires CRM add-on; products CRUD requires ecommerce (firestore-schema §10). |
| **Site renderer** | White-label badge; ecommerce product fetch; GA4 when analytics-seo enabled. |

---

## 6. Out of scope (explicit)

The following configurator add-ons **do not** ship full marketing-label capabilities in Phase 2. Dashboard must use honest copy (per Samuel Ruiz expert-review memo):

| Add-on | Do **not** claim in Phase 2 UI |
|--------|--------------------------------|
| `email-automation` | “Visual automation builder”, “drip campaigns” |
| `vat-mtd` | “HMRC MTD filing”, “Xero sync” |
| `ecommerce` | “Full checkout”, “shopping cart checkout” |
| `ai-content` | “Generate entire site”, “AI website builder” |
| `white-label` | “Your own branded dashboard” (Phase 3+) |
| `custom-template` | “Instant custom design in app” |

---

## 7. Verification checklist (DOC-003)

- [x] All 11 `FeatureId` values from `lib/features.ts` documented
- [x] Phase 2 MVP vs 2.1/3 deferrals stated per add-on
- [x] Firestore paths and Stripe dependencies listed
- [x] B8 acceptance criteria per add-on + billing
- [x] Aligned with Q30 (white-label), Q50–Q51 (CRM/ecommerce), builder-ui-spec §3.2

**Expert alignment:** Dr. Samuel Ruiz (product scope), Dr. Sophia Laurent (UX surfaces).  
**Coordinator handoff:** Ready for B8-001 engineering — DOC-003 unblocks B2 dependency chain via B8 gate.
