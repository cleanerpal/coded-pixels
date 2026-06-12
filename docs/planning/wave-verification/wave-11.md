# Wave 11 — Monorepo scaffold (B0-001)

**Written by:** Mia Thompson  
**Wave closes when:** B0-001 Turborepo migration is done  
**Milestone:** Code reorganised under `apps/marketing/`; shared packages extracted  
**Status:** Shipped  
**Browser change:** **None** (same URLs, same behaviour)

---

## In one sentence

Wave 11 rearranged the codebase into a monorepo. The marketing site you test is the same; it just lives in `apps/marketing/` now.

---

## What changed for developers (not visitors)

| Before | After |
|--------|-------|
| `app/`, `components/`, `lib/` at repo root | `apps/marketing/app/`, `components/`, `lib/` |
| `components/ui/` | `packages/ui/` (`@codedpixels/ui`) |
| `types/index.ts` | `packages/shared-types/` |
| `npm run dev` → Next at root | `npm run dev` → Turbo runs marketing app |

**You still run from repo root:**

```bash
npm install
npm run dev          # http://localhost:3000
npm test
npm run test:e2e
npm run build
```

---

## What you should see in the browser

Identical to **Wave 9** — run the [wave-4.md](wave-4.md) + [wave-8.md](wave-8.md) spot checks if you want confidence after the move:

- [ ] `/` — hero, configurator, FAQ
- [ ] `/get-started?package=growth&template=sparkle-clean` — order summary
- [ ] Cookie banner → Accept → GA4 may load

---

## New stubs (not usable yet)

| Path | Purpose |
|------|---------|
| `apps/builder/` | Placeholder for `app.codedpixels.co.uk` |
| `apps/site-renderer/` | Placeholder for `*.codedpixels.co.uk` |

Do not expect these to serve pages yet.

---

## What’s next

**Wave 12 (B1):** Shipped — see [wave-12.md](wave-12.md). Template seed files + tenant rules (invisible on marketing site).
