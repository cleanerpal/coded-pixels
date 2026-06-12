# Wave 15 — Site renderer + wildcard hosting (B4-001)

**Written by:** Mia Thompson  
**Wave closes when:** B4-001 is done  
**Milestone:** Live tenant sites at `*.codedpixels.co.uk` — local dev on port 3002  
**Status:** Shipped  
**Browser change:** **New app** — site-renderer; marketing and builder unchanged

---

## In one sentence

Wave 15 adds the app that turns published Firestore page data into real customer websites — each business gets a subdomain like `yourname.codedpixels.co.uk`, with middleware that maps the hostname to the right tenant.

---

## Before you start

```bash
npm install
npm run dev:renderer    # http://localhost:3002
```

With a pinned dev tenant (recommended):

```bash
SITE_RENDERER_DEV_SLUG=demo npm run dev:renderer
```

With Firestore emulator + seeded published site:

```bash
# Terminal 1
npm run emulators

# Terminal 2
SITE_RENDERER_DEV_SLUG=demo FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev:renderer
```

Terminal checks:

```bash
npm test
npm run build    # Nathan runs full build on wave close — optional smoke for you
```

Detail: [apps/site-renderer/README.md](../../../apps/site-renderer/README.md)

---

## What shipped

| Piece | What it does |
|-------|----------------|
| **`apps/site-renderer/`** | Next.js app for wildcard `*.codedpixels.co.uk` |
| **Middleware** | Parses `Host` → tenant slug → `x-tenant-slug` header |
| **`/[[...pageSlug]]`** | Renders published homepage and secondary pages from Firestore |
| **ISR + revalidation** | `revalidate = 3600` + on-demand cache bust from Wave 14 |
| **Reserved subdomains** | `app`, `www`, `api`, `staging`, `preview` — no tenant lookup |
| **Fallback routes** | `/maintenance`, `/platform-not-found` for edge cases |

Only **published** page versions render — drafts stay in the builder.

---

## What you should see in the browser

### Site-renderer (`http://localhost:3002`)

| Scenario | What to look for |
|----------|------------------|
| **No slug / no data** | Platform not-found or maintenance page — not a crash |
| **`SITE_RENDERER_DEV_SLUG=demo` + seeded publish** | Tenant homepage with real sections from component registry (hero, features, etc.) — **not** the configurator mock preview |
| **Secondary page** | `/about` or similar slug if published in seed data |
| **`/api/health`** | Health check JSON for App Hosting |

### Marketing + builder

Unchanged on ports 3000 and 3001.

**Templates milestone:** End visitors can now see seeded template **content** on a live subdomain after publish — not just colours in the configurator preview.

---

## Manual checklist

- [ ] `npm run dev:renderer` starts on port **3002**
- [ ] With `SITE_RENDERER_DEV_SLUG` set, homepage attempt does not white-screen
- [ ] Published sections render using shared component registry styles
- [ ] Draft-only sites do not appear on the renderer (published gate)
- [ ] `/api/health` returns 200
- [ ] `npm test` green — renderer middleware / routing tests if present
- [ ] Builder publish (Wave 14) + renderer together: after publish, live URL concept matches `{slug}.codedpixels.co.uk`

---

## What’s next

**Wave 16 (B6):** Real Stripe checkout and post-pay onboarding that creates a tenant and clones a template into the customer’s first site. See [wave-16.md](wave-16.md).

---

## Expert alignment

Aligned with **Dr. Lena Petrova** (site-renderer), **Dr. Elena Voss** (App Router rendering), **Dr. Rajiv Singh** (tenant SEO isolation), **Dr. Maya Patel** (wave mapping).
