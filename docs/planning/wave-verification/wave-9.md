# Wave 9 — M4 quality gate

**Written by:** Mia Thompson  
**Wave closes when:** QA-001 through QA-006 are done  
**Milestone:** Marketing MVP is test-automated and SEO-ready  
**Status:** Shipped

---

## In one sentence

After Wave 9, robots trust us (sitemap), search engines get structured pricing data, and Playwright proves the configurator → get-started spine works — plus Firestore rules are unit-tested.

---

## What changed for you in the browser

Mostly **invisible** — quality is in automation. You may notice:

| URL / feature | What to look for |
|---------------|------------------|
| `/robots.txt` | Allows crawlers; points to sitemap |
| `/sitemap.xml` | Lists `/`, `/templates`, `/pricing`, `/get-started`, legal |
| `/pricing` | View source → `application/ld+json` with SoftwareApplication + Offers |
| Page titles | Unique meta on `/templates`, `/pricing`, `/get-started` |

Behaviour from Waves 1–8 should be **unchanged**.

---

## Automated checks (this wave’s main deliverable)

```bash
npm test                    # 107 unit tests
npm run test:rules          # 15 Firestore rules tests
npm run test:e2e            # 15 Playwright tests
npm run build
```

Optional (manual perf):

```bash
npm run build && npm run start
npm run test:lighthouse     # mobile perf + a11y budget doc
```

---

## What this wave means for launch

**Marketing MVP feature-complete** from an engineering gate perspective. Next work is **Platform Phase 2** (builder, payments, live sites) — see [roadmap.md](roadmap.md).

---

## If E2E fails locally

- Kill stale dev servers on port 3000: `lsof -i :3000`
- Run from repo root: `npm run test:e2e`
- Cookie banner can block mobile bar clicks if consent not seeded — tests handle this automatically
