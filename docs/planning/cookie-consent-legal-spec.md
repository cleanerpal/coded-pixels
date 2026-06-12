# Cookie Consent & Legal Copy Spec

**Ticket:** DOC-001 · Wave 1  
**Document owner:** Dr. Lena Moreau  
**Domain experts:** Dr. Patrick O'Brien (GDPR) · Ms. Rebecca Flynn (Consumer) · Mia Thompson (plain language)  
**Status:** Approved for M3 implementation  
**Last updated:** 12 June 2026  
**Related:** [`../specs/codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md) Q14, Q16, Q55, Q61 · [`../specs/firestore-schema.md`](../specs/firestore-schema.md) §12 · [`../brand/brand-guide.md`](../brand/brand-guide.md) §7 · ENG-021 · ENG-022 · DOC-002

---

## 1. Purpose

This spec is the **implementation contract** for:

- Cookie consent banner behaviour (ENG-021)
- GA4 loading gate (ENG-022)
- Privacy Policy and Terms of Service page content (DOC-002)

It satisfies Q16 (real legal pages before email capture), Q14/Q61 (consent before analytics), and Q55 (no stub legal pages).

---

## 2. Cookie categories

| Category | Purpose | Examples (MVP) | Default state | Legal basis |
|----------|---------|----------------|---------------|-------------|
| **Strictly necessary** | Site works; security; consent storage | Session routing, consent preference in `localStorage`, App Check tokens | **Always on** — no toggle | Legitimate interest / essential |
| **Analytics** | Understand how visitors use the configurator | Google Analytics 4 (`@next/third-parties/google`) | **Off until opt-in** | Consent (UK GDPR / PECR) |
| **Marketing** | Advertising / remarketing pixels | *None in MVP* | Off | Consent — category reserved for Phase 2+ |

### 2.1 What we do **not** use cookies for (MVP)

- No third-party advertising or remarketing pixels
- No social-media tracking embeds
- No cross-site profiling beyond GA4 (and only after consent)

### 2.2 Strictly necessary storage

| Key / mechanism | Storage | Retention | Notes |
|-----------------|---------|-----------|-------|
| `cp_cookie_consent` | `localStorage` | Until cleared by user or 12 months (whichever first) | Values: `"accepted"` \| `"rejected"` |
| `cp_cookie_consent_at` | `localStorage` | Same as above | ISO 8601 timestamp — audit trail for support |
| Next.js / hosting | Session / edge | Browser session | Standard framework behaviour |

Engineering must **not** set analytics cookies or load GA4 scripts before the user clicks **Accept analytics cookies**.

---

## 3. Consent banner — UX & behaviour

**Implementing ticket:** ENG-021  
**Blocks:** ENG-022 (GA4 must not load until consent resolved)

### 3.1 When the banner appears

- First visit to any page on `codedpixels.co.uk` when no valid consent record exists in `localStorage`
- Re-show if stored consent is older than 12 months (re-consent prompt)
- Do **not** block page content — banner is non-modal (bottom bar or corner card per brand guide)

### 3.2 Copy (Mia Thompson — plain language)

**Heading:**  
`We use cookies`

**Body:**  
`We use essential cookies so the site works. With your permission, we also use analytics cookies to see how people use our configurator — so we can improve it. We don’t sell your data.`

**Primary button — Accept:**  
`Accept analytics cookies`

**Secondary button — Reject:**  
`Reject analytics cookies`

**Link:**  
`Privacy Policy` → `/privacy` (opens same tab)

Optional tertiary control (recommended, not blocking MVP):  
`Cookie settings` — opens minimal panel repeating Accept / Reject (no pre-checked analytics box).

### 3.3 Button behaviour

| Action | Effect |
|--------|--------|
| **Accept analytics cookies** | Persist `cp_cookie_consent=accepted` + timestamp; **load GA4**; dismiss banner |
| **Reject analytics cookies** | Persist `cp_cookie_consent=rejected` + timestamp; **do not load GA4**; dismiss banner |
| Navigate without choosing | Banner remains; GA4 **must not** load |

There is **no** “Accept all” that implies marketing cookies in MVP — analytics is the only optional category.

### 3.4 Persistence & re-consent

```ts
// Suggested shape — ENG-021 implementation detail
interface CookieConsentRecord {
  choice: 'accepted' | 'rejected';
  recordedAt: string; // ISO 8601
  version: 'cookie-v1'; // bump when policy materially changes
}
```

- Store JSON at `localStorage` key `cp_cookie_consent_v1`
- On policy version bump, treat missing/new version as no consent → show banner again
- Reject is a valid persistent choice — do not nag on every page view within the 12-month window

### 3.5 Accessibility (Dr. Nadia Sokolov)

- Banner container: `role="region"` + `aria-label="Cookie consent"`
- Focus moves to banner on first paint (not trap — user can tab past)
- Accept / Reject: minimum 44×44px touch targets; visible focus ring (brand primary)
- Respect `prefers-reduced-motion` for slide-in animation

### 3.6 Visual (brand guide)

- Background: white or `--surface-elevated`; border-top 1px `#E2E8F0`
- Primary button: brand primary `#4F46E5`
- Secondary: ghost / outline — equal visual weight to Reject (PECR — no dark patterns)
- Typography: Inter 400 body, 500 button labels

---

## 4. GA4 block until opt-in

**Implementing tickets:** ENG-021 (gate) · ENG-022 (loader)

### 4.1 Hard requirement (Patrick O'Brien / Q14)

> **GA4 must not execute — no script tag, no network request to Google — until the user has clicked Accept analytics cookies.**

This is a **release gate** for M4 (project plan §11 checklist).

### 4.2 Implementation pattern

1. **Default:** Do not render `<GoogleAnalytics />` or equivalent from `@next/third-parties/google`
2. **On Accept:** Dynamically inject / mount GA4 with measurement ID from env (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
3. **On Reject:** Never mount; `analytics.ts` helpers must no-op when consent ≠ accepted
4. **IP anonymisation:** Enable in GA4 property settings; disclose in Privacy Policy

### 4.3 Events (only fire when consented)

Per Q20 — all events include structured parameters. Consent-gated event list:

| Event | When |
|-------|------|
| `template_selected` | User picks a template |
| `feature_toggled` | Add-on toggled |
| `package_clicked` | Package card clicked |
| `billing_cycle_changed` | Monthly ↔ annual |
| `copy_config_link` | Share link copied |
| `waitlist_joined` | Site Import waitlist submit success |
| `get_started_clicked` | Navigate to `/get-started` |
| `signup_completed` | Get Started form success |

`analytics.ts` must check consent before `gtag` / dataLayer push.

### 4.4 Testing acceptance (QA)

- [ ] Fresh session + Reject → no requests to `google-analytics.com` / `googletagmanager.com`
- [ ] Accept → GA4 loads; sample configurator event appears in DebugView
- [ ] Reload with stored Accept → GA4 loads without re-prompting
- [ ] Reload with stored Reject → no GA4; banner hidden

---

## 5. Privacy Policy outline (`/privacy`)

**Implementing ticket:** DOC-002  
**Tone:** UK plain English (Mia Thompson). Short sections, no legalese walls.  
**Required before:** any email capture (waitlist, Get Started — Q16).

### 5.1 Suggested page structure

| § | Heading (plain language) | Content to include |
|---|--------------------------|-------------------|
| 1 | **Who we are** | CodedPixels Ltd [or trading name — **PRODUCT OWNER TBD**]. What we do: website builder for UK small businesses. |
| 2 | **What data we collect** | **Marketing site (MVP):** email (waitlist, sign-up), configurator choices (template, features, totals), consent timestamp, optional hashed IP / truncated user agent for abuse prevention. **Not collected in MVP sign-up:** password, payment card (simulated checkout only). |
| 3 | **Why we use it** | Respond to interest; save your plan; improve the product; prevent abuse; legal compliance. |
| 4 | **Legal bases (UK GDPR)** | Contract / steps at your request (sign-up); **Consent** (analytics cookies, marketing emails when opted in); Legitimate interest (security, aggregated analytics where applicable — analytics cookies still consent-gated). |
| 5 | **Cookies** | Link to §2–3 of this spec. Table: necessary vs analytics. How to change choice (clear site data or wait for re-prompt). |
| 6 | **Who we share data with (subprocessors)** | See §5.2. No selling of personal data. |
| 7 | **Where we store data** | Firestore, Cloud Functions, Cloud Storage: **europe-west2 (London)**. Firebase Auth (Phase 2+): global Google infrastructure — disclosed honestly. |
| 8 | **How long we keep data** | See §6 (retention table — copy verbatim from schema §12). |
| 9 | **Your rights** | Access, correction, deletion, restrict processing, object, withdraw consent, complain to **ICO** (ico.org.uk). Plain explanation of each in one sentence. |
| 10 | **Children** | Service not aimed at under-18s. |
| 11 | **Changes** | We will update this page; material changes re-prompt cookie consent where needed. |
| 12 | **Contact us** | See §7 (DPO placeholder). |

### 5.2 Subprocessors (MVP — disclose by name)

| Provider | Purpose | Data shared | Location |
|----------|---------|-------------|----------|
| **Google Firebase** | Database, serverless functions, hosting | Email, config snapshots, timestamps | UK (europe-west2) + Auth global |
| **Google Analytics 4** | Website analytics (consent only) | Pseudonymous usage events, device/browser metadata | Google — see Google Ads Data Processing Terms |
| **Google reCAPTCHA** | Bot protection on public forms | Interaction signals | Google |
| **SendGrid** (Twilio) | Transactional email (Phase 2 sign-up flow; disclose now if waitlist confirmation added) | Email address | US — SCCs / DPA |
| **Sentry** | Error monitoring | Scrubbed technical logs — **no raw email in payloads** (Q61) | US/EU per project config |

Update this table when vendors change. DOC-002 owner keeps in sync with INF tickets.

### 5.3 Form-level consent (separate from cookies)

Waitlist and Get Started require **unchecked-by-default** checkbox:

> ☐ I agree to CodedPixels storing my email and plan choices as described in the [Privacy Policy](/privacy).

On submit, Callable writes `consentAt` + `consentVersion: "privacy-v1"` per [`firestore-schema.md`](../specs/firestore-schema.md) §4.

Cookie consent and form consent are **independent** — user may reject analytics cookies but still sign up with form checkbox ticked.

---

## 6. Data retention (from Firestore schema §12)

Copy into Privacy Policy §8. Source of truth: **Dr. Patrick O'Brien** — [`../specs/firestore-schema.md`](../specs/firestore-schema.md) §12.

| Data | Retention | Erasure |
|------|-----------|---------|
| **Sign-up records** (`signups`) | 12 months | Scheduled function or manual purge |
| **Site Import waitlist** (`waitlist_site_import`) | 24 months after Site Import launches, or until you withdraw | On request + scheduled purge |
| **Customer account data** (`companies/**`) | Life of subscription **+ 30 days** | Delete User Data Extension (Phase 2) |
| **Lead form submissions** (`leads`) | Life of account | Deleted with company; CSV export anytime (Phase 2) |
| **Support audit logs** (`auditLogs`) | 24 months | Automated purge |
| **Page version history** (`.../versions` archived) | Max 5 published + 1 draft per page | Trimmed on publish |
| **User profiles** (`users/{uid}`) | Until Auth user deleted | With company deletion |

**Phase 2 note for Privacy Policy:** “You can export your leads at any time” (project plan Q42) — include when builder ships.

---

## 7. Product owner action — DPO / contact placeholder

> **⚠️ BLOCKING FOR PUBLIC LAUNCH — not for spec approval**

The following placeholders **must** be replaced by the product owner before DOC-002 publishes live pages:

| Placeholder | Used in | Owner action |
|-------------|---------|--------------|
| `[PRIVACY_EMAIL]` | Privacy Policy §12, footer | Set dedicated privacy inbox (e.g. `privacy@codedpixels.co.uk`) |
| `[DPO_NAME]` | Privacy Policy §12 | Name or “Data Protection Lead” if no formal DPO |
| `[COMPANY_LEGAL_NAME]` | Privacy & Terms | Registered company name + number |
| `[REGISTERED_ADDRESS]` | Privacy & Terms | UK registered office |

**Interim for engineering/DOC-002 draft builds:** use visible placeholder text `[PRIVACY_EMAIL — contact product owner]` so missing data is obvious in review — never invent a fake address.

Patrick O'Brien sign-off on final contact details before M3 public launch.

---

## 8. Terms of Service outline (`/terms`)

**Implementing ticket:** DOC-002  
**Tone:** Plain English; honest about MVP limits (Rebecca Flynn / Q58).

### 8.1 Suggested page structure

| § | Heading | Content to include |
|---|---------|-------------------|
| 1 | **About these terms** | Using codedpixels.co.uk means you accept these terms. If you don’t agree, don’t use the site. |
| 2 | **Who we are** | Same legal entity placeholders as Privacy Policy §7. |
| 3 | **What CodedPixels provides** | Marketing site + configurator to design a website plan. **MVP:** sign-up is a **preview** — no live website, no builder dashboard yet. |
| 4 | **Simulated checkout (important)** | **No payment is taken** on the MVP Get Started flow. Submitting your email **does not** form a contract for paid services. We’ll contact you about next steps. (Expert review memo — MVP Terms) |
| 5 | **Pricing** | Prices on the configurator are **VAT-inclusive** (UK). Live total in the summary is the authoritative price; package cards may round for display (see FAQ). Final price confirmed before any future paid subscription. |
| 6 | **Your account (Phase 2+)** | When accounts launch: you’re responsible for your login; accurate details; notify us of unauthorised use. |
| 7 | **Acceptable use** | No unlawful content, abuse of forms, scraping, or attempts to break security. |
| 8 | **Intellectual property** | We own the platform, templates, and brand. You own your business content. Limited licence to use the configurator. |
| 9 | **Availability** | Reasonable efforts; no guarantee of uninterrupted service during beta/MVP. |
| 10 | **Limitation of liability** | To the fullest extent permitted by UK law: we’re not liable for indirect loss; total liability capped at fees paid in prior 12 months (or **£0** during free MVP sign-up). **Nothing excludes liability for death/personal injury from negligence, fraud, or rights under Consumer Rights Act 2015 that cannot be excluded.** |
| 11 | **Cancellation** | MVP: no subscription yet. Phase 2: cancel anytime — align with footer trust line “Cancel anytime”. |
| 12 | **Changes** | We may update terms; continued use after notice = acceptance. Material changes communicated by email or site banner. |
| 13 | **Governing law** | England and Wales; courts of England and Wales (consumer stays in home jurisdiction where mandatory). |
| 14 | **Contact** | `[PRIVACY_EMAIL]` for legal/privacy queries. |

### 8.2 Cross-links

- Footer: Privacy · Terms (always visible — brand guide §13 M3)
- Waitlist + Get Started forms: link Privacy Policy adjacent to consent checkbox
- Cookie banner: link Privacy Policy §5 (cookies)

---

## 9. Footer & trust signals

From project plan §7 and brand guide — legal links sit alongside:

`UK-based · Secure payments · GDPR compliant · Cancel anytime`

Privacy and Terms are **real routes**, not `#` anchors or “Coming soon”.

---

## 10. Implementation checklist (M3)

| Ticket | Deliverable | Acceptance from this spec |
|--------|-------------|---------------------------|
| **DOC-002** | `/privacy`, `/terms` pages | §5, §6, §8 content; §7 placeholders flagged |
| **ENG-021** | Cookie banner component | §3 UX, §3.5 a11y, localStorage persistence |
| **ENG-022** | GA4 + `analytics.ts` | §4 gate; Q20 events; no-op when rejected |
| **INF-003** | Signup/waitlist Callables | `consentAt`, `consentVersion` per schema §4 |
| **QA (M4)** | Playwright / manual | §4.4 tests |

---

## 11. Expert sign-off

| Expert | Domain | Status |
|--------|--------|--------|
| Dr. Patrick O'Brien | GDPR, retention, consent gate | ☑ Spec basis approved |
| Ms. Rebecca Flynn | Consumer Terms, simulated checkout | ☑ Outline approved |
| Mia Thompson | Plain-language copy | ☑ Banner + section headings approved |
| Dr. Amina Laurent | GA4 events | ☑ Consent gate aligned with Q14/Q20 |
| Dr. Nadia Sokolov | Banner a11y | ☑ Requirements filed |

**Product owner:** Resolve §7 placeholders before public launch.

---

## 12. Related documents

- [`implementation-tickets.md`](implementation-tickets.md) — DOC-001, DOC-002, ENG-021, ENG-022
- [`../specs/firestore-schema.md`](../specs/firestore-schema.md) — §4 (consent fields), §12 (retention)
- [`../specs/codedpixels-project-plan.md`](../specs/codedpixels-project-plan.md) — Q14, Q16, Q20, Q33, Q55, Q61
- [`../brand/brand-guide.md`](../brand/brand-guide.md) — §7 voice & tone
- [`expert-review-memo.md`](expert-review-memo.md) — Compliance panel (subprocessors, MVP Terms)

---

**Summary:** Visitors choose **Accept** or **Reject analytics cookies** before GA4 loads. Privacy and Terms are short, plain-English pages with retention from schema §12 and subprocessors named. **DPO/contact placeholders in §7 require product owner input before launch.**

— **Dr. Lena Moreau** · Aligned with **Dr. Patrick O'Brien** & **Mia Thompson** on DOC-001
