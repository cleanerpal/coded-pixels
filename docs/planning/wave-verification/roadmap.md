# CodedPixels — What to expect and when

**Written by:** Mia Thompson (Plain Language)  
**For:** Andrew and anyone checking “when will I see X?”  
**Keep this open** alongside [project-status.md](../project-status.md) — status says what’s **done**; this says what each wave **means in the browser** and what’s **still ahead**.

---

## Where we are now (quick read)

| Phase | Status | What you can do today |
|-------|--------|------------------------|
| **M0–M4 marketing MVP** | **Shipped** (Waves 1–9) | Full configurator, pages, signup simulation, legal, cookie banner |
| **P2 prep docs** | **Shipped** (Wave 10) | Specs on disk only — **no new browser features** |
| **Monorepo (B0)** | **Shipped** (Wave 11) | Same site as Wave 9; code lives under `apps/marketing/` |
| **Platform Phase 2 core** | **Shipped** (Waves 12–17) | Builder, publish, live sites, Stripe (when configured), CRM/products, uploads |
| **Phase 2 polish** | **Next** (Wave 18+) | FinOps SLOs (DOC-009), observability (B9) |

**Dev commands from repo root:**

```bash
npm run dev              # marketing → http://localhost:3000
npm run dev:builder      # builder → http://localhost:3001
npm run dev:renderer     # site-renderer → http://localhost:3002
```

---

## Full wave map — marketing MVP (Waves 1–9)

| Wave | Milestone | Shipped? | Guide | One-line “what changed for me” |
|------|-----------|----------|-------|--------------------------------|
| 1 | Foundation | Yes | [wave-1.md](wave-1.md) | App exists; token demo page; template **names in code only** |
| 2 | M0 | Yes | [wave-2.md](wave-2.md) | Header/footer; pricing engine tested |
| 3 | M1 components | Yes | [wave-3.md](wave-3.md) | Configurator parts built; **not on homepage yet** |
| 4 | M2 live configurator | Yes | [wave-4.md](wave-4.md) | Full landing page + configurator on `/` |
| 5 | M3 pages (split) | Yes | [wave-5.md](wave-5.md) | `/templates`, `/pricing`, legal pages |
| 6 | PII + consent | Yes | [wave-6.md](wave-6.md) | Firestore rules; cookie banner |
| 7 | Callables + GA4 | Yes | [wave-7.md](wave-7.md) | Signups hit Firebase; analytics after Accept |
| 8 | Signup + waitlist | Yes | [wave-8.md](wave-8.md) | `/get-started` flow; Site Import waitlist |
| 9 | M4 QA | Yes | [wave-9.md](wave-9.md) | Automated tests green; SEO/sitemap |

Waves 5–8 were originally one big “M3” in the plan — we split them so each close is easier to verify.

---

## Docs + monorepo (Waves 10–11)

| Wave | What landed | Shipped? | Guide | Browser change? |
|------|-------------|----------|-------|-----------------|
| **10** | Phase 2 prep docs | Yes | [wave-10.md](wave-10.md) | **None** |
| **11** | Turborepo; `apps/marketing/` | Yes | [wave-11.md](wave-11.md) | **None** — same pages |

---

## Platform Phase 2 (Waves 12–17) — shipped

| Wave | Ticket(s) | Shipped? | Guide | What you’ll notice |
|------|-----------|----------|-------|-------------------|
| **12** | B1-001, B1-002 | Yes | [wave-12.md](wave-12.md) | Marketing unchanged; template seeds + tenant rules in repo/emulator |
| **13** | B2-001, B2-002 | Yes | [wave-13.md](wave-13.md) | Builder at **`localhost:3001`** — dashboard + demo editor |
| **14** | B3-001 | Yes | [wave-14.md](wave-14.md) | **Publish** button in builder |
| **15** | B4-001 | Yes | [wave-15.md](wave-15.md) | Site-renderer at **`localhost:3002`** — live published pages |
| **16** | B6-001, B6-002 | Yes | [wave-16.md](wave-16.md) | Stripe checkout (when configured); `/onboarding` wizard |
| **17** | B7-001, B8-001 | Yes | [wave-17.md](wave-17.md) | Uploads; leads inbox; products; billing portal |

Full recap: **[phase-2-preview.md](phase-2-preview.md)**

---

## Templates — when do they become “real”?

| Layer | When | What it is | Can you see it? |
|-------|------|------------|-----------------|
| **1. Template catalogue (metadata)** | **Wave 1** | Names, categories in `lib/templates.ts` | Yes — Step 1 picker, `/templates` |
| **2. Preview styling** | **Wave 4** | Theme in configurator preview panel | Yes — mock browser, not a real site |
| **3. Firestore template seeds** | **Wave 12** (B1-001) | JSON section trees → `templates/{id}` | Emulator/Firebase console; not on marketing site |
| **4. Customer’s live site** | **Waves 14–16** | Clone → edit → publish → `{slug}.codedpixels.co.uk` | Yes — builder + renderer after checkout |
| **5. Marketing preview of real designs** | **Wave 19** (Phase 2.1) | Demo tenants + WebP thumbnails + **Preview full site** links | Yes — after `seed:template-demos` |

**Today (pre–Wave 19):** choosing “Serenity Spa” sets `templateId` only; gradients on marketing; real design visible after checkout or manual demo seed.

**After Wave 19:** homepage + `/templates` link to `{templateId}.localhost:3002` (local) or `{templateId}.codedpixels.co.uk` (prod).

Detail: [template-seeding-ci-spec.md](../template-seeding-ci-spec.md) · [marketing-template-preview-spec.md](../marketing-template-preview-spec.md) · [phase-2-preview.md](phase-2-preview.md)

---

## What’s coming next — Wave 18+

| When (wave) | Ticket(s) | What you’ll notice |
|-------------|-----------|-------------------|
| **18+** | DOC-009, B9-001 | FinOps SLO docs; observability / abuse protection; public lead forms on live sites |

Check [project-status.md](../project-status.md) for the current wave number.

---

## Gates — things that blocked “the next big thing”

| Gate | Status | Unlocks |
|------|--------|---------|
| ENG-006 before configurator UI | Closed | Waves 3–4 |
| M3 PII (legal + Sentry + Callables) | Closed | Live signup data |
| M4 QA | Closed | Marketing MVP sign-off |
| B0 monorepo docs + scaffold | Closed | B1 tenant work |
| B1 tenant schema + seeds | Closed | Builder + provisioning |
| Real payments | **Closed** (Wave 16) | Stripe checkout + onboarding |
| Builder usable | **Closed** (Wave 13) | Editor shell + registry |
| Public customer sites | **Closed** (Wave 15) | Site-renderer + publish |

---

## How to verify after each wave

1. Check [project-status.md](../project-status.md) — **Last wave closed**
2. Open the matching **wave-N.md** guide
3. From repo root: `npm install` → run the dev command(s) listed in that guide
4. Run automated checks when listed: `npm test`, `npm run test:e2e`, `npm run test:rules`, `npm run validate:templates`

---

## Expert alignment

Aligned with **Dr. Samuel Ruiz** (product phases), **Dr. Maya Patel** (wave decomposition), **Dr. Rafael Ortiz** (template seed timing), **Mia Thompson** (plain-language verification).
