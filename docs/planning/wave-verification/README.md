# Wave verification guides

**Written by:** Mia Thompson (Plain Language)  
**For:** Andrew and anyone checking the build after each wave closes  
**How to use:** Open the guide for the wave you just finished, run `npm run dev` from repo root, and work through the manual checklist.

---

## Start here — full timeline

**[roadmap.md](roadmap.md)** — every wave shipped and upcoming, template lifecycle, gates, dev commands.

**[phase-2-preview.md](phase-2-preview.md)** — what Platform Phase 2 adds (builder, live sites, Stripe) and when you’ll see it.

**[project-status.md](../project-status.md)** — Nathan’s checkpoint: last commit SHA, current wave, what’s in progress.

---

## Marketing MVP (Waves 1–9) — shipped

| Wave | Milestone | Status | Guide |
|------|-----------|--------|-------|
| 1 | Foundation (scaffold, tokens, template metadata in code) | Shipped | [wave-1.md](wave-1.md) |
| 2 | M0 (pricing engine, header, URL state) | Shipped | [wave-2.md](wave-2.md) |
| 3 | M1 configurator components (built, not yet on homepage) | Shipped | [wave-3.md](wave-3.md) |
| 4 | M2 preview + configurator live on `/` | Shipped | [wave-4.md](wave-4.md) |
| 5 | M3 pages split — legal, gallery, pricing, Firebase scaffold | Shipped | [wave-5.md](wave-5.md) |
| 6 | Firestore rules + cookie consent banner | Shipped | [wave-6.md](wave-6.md) |
| 7 | Callable signups + consent-gated GA4 | Shipped | [wave-7.md](wave-7.md) |
| 8 | `/get-started` + Site Import waitlist | Shipped | [wave-8.md](wave-8.md) |
| 9 | M4 QA (E2E, SEO, rules tests, Lighthouse) | Shipped | [wave-9.md](wave-9.md) |

**Note:** Original plan lumped Waves 5–8 into one “M3” guide. We split them when closing — use the table above, not older ticket wave numbers in `implementation-tickets.md` alone.

---

## Docs + monorepo (Waves 10–11) — shipped, no new UI

| Wave | Milestone | Browser change? | Guide |
|------|-----------|-----------------|-------|
| 10 | Phase 2 prep docs (Stripe, builder, monorepo, template seeding specs) | None | [wave-10.md](wave-10.md) |
| 11 | B0 Turborepo — app under `apps/marketing/` | None (same site) | [wave-11.md](wave-11.md) |

---

## Platform Phase 2 (Waves 12–17) — shipped

| Wave | Milestone | Browser change? | Guide |
|------|-----------|-----------------|-------|
| 12 | B1 tenant schema + template seeds + rules | None (terminal/Firebase) | [wave-12.md](wave-12.md) |
| 13 | B2 builder shell + component registry | New app `:3001` | [wave-13.md](wave-13.md) |
| 14 | B3 publish pipeline + revalidation API | Builder Publish wired | [wave-14.md](wave-14.md) |
| 15 | B4 site renderer + wildcard hosting | New app `:3002` | [wave-15.md](wave-15.md) |
| 16 | B6 Stripe checkout + onboarding wizard | `/get-started` + `/onboarding` | [wave-16.md](wave-16.md) |
| 17 | B7 storage + B8 CRM/products/billing | Builder dashboard add-ons | [wave-17.md](wave-17.md) |

**Phase 2 core (B0–B8) complete.** Wave 18+ is polish / observability — see [project-status.md](../project-status.md).

Overview: [phase-2-preview.md](phase-2-preview.md)

---

## Dev commands (after Wave 13)

From repo root:

```bash
npm install
npm run dev              # marketing → http://localhost:3000
npm run dev:builder      # builder → http://localhost:3001
npm run dev:renderer     # site-renderer → http://localhost:3002
npm test
npm run test:e2e
npm run test:rules
npm run validate:templates
npm run build            # Nathan runs on wave close
```

---

## Checking an older wave?

You can `git checkout <SHA>` from [project-status.md](../project-status.md) if you want the browser to match exactly what that wave shipped.

---

## Templates — quick answer

| Question | Answer |
|----------|--------|
| When do template **names** appear? | Wave 1 — configurator + `/templates` |
| When do template **colours** in preview? | Wave 4 |
| When do template **page layouts** exist in DB? | **Wave 12** (B1-001) — shipped |
| When does a customer get a **real site**? | **Wave 16** provisioning + **Wave 14–15** publish/renderer |

Full table: [roadmap.md](roadmap.md) § Templates.
