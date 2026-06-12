# Wave 14 — Publish pipeline (B3-001)

**Written by:** Mia Thompson  
**Wave closes when:** B3-001 is done  
**Milestone:** `publishSite` Callable + on-demand revalidation API on site-renderer  
**Status:** Shipped  
**Browser change:** **Builder** — Publish button wired (needs emulators or deployed Functions for full flow)

---

## In one sentence

Wave 14 connects the builder’s **Publish** button to a Cloud Function that marks a site version as live and tells the site-renderer to refresh its cache — draft vs published is now a real backend concept.

---

## Before you start

```bash
npm install
npm run dev:builder     # http://localhost:3001
npm run dev:renderer    # http://localhost:3002 (optional — for revalidation target)
```

For a full publish flow locally:

```bash
# Terminal 1 — emulators (auth, firestore, functions)
npm run emulators

# Terminal 2 — builder
npm run dev:builder
```

Terminal checks:

```bash
npm test
```

---

## What shipped

| Piece | What it does |
|-------|----------------|
| **`publishSite` Callable** | Validates draft, writes published version, returns `publishedAt` |
| **`/api/revalidate`** | Secret-protected POST on site-renderer — busts ISR cache tag `site:{siteId}` |
| **Builder TopBar** | Publish button (desktop only); success banner with **View live site** link; error banner on validation failure |

Aligned with **DOC-006** site-renderer architecture and **builder-ui-spec §7.1**.

---

## What you should see in the browser

### Builder demo editor (`/sites/demo-site/edit`)

| Action | What to look for |
|--------|------------------|
| **Desktop width** | **Publish** button enabled (disabled on narrow/mobile viewports) |
| **Click Publish** (with emulators + seeded tenant data) | Button shows “Publishing…” then success banner or validation error |
| **After success** | “Site published” strip with **View live site** link |
| **Draft badge** | Top bar shows “Draft” until publish succeeds, then “Published” |

### Site-renderer (`http://localhost:3002`)

| URL | What to look for |
|-----|------------------|
| `/api/health` | JSON health response |
| `/api/revalidate` | POST only — rejects missing secret (terminal/curl test) |

Live visitor pages need Wave 15 renderer + published data in Firestore.

---

## Dev commands to verify

```bash
npm test
# Optional — hit revalidate route (replace secret from env)
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3002/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"demo-site"}'
```

---

## Manual checklist

- [ ] Builder TopBar **Publish** button visible on desktop at `/sites/demo-site/edit`
- [ ] Publish disabled on viewport &lt; 1024px with helpful title tooltip
- [ ] `functions/src/callables/publishSite.ts` exists; exported from Functions index
- [ ] `apps/site-renderer/app/api/revalidate/route.ts` exists
- [ ] `npm test` green — includes publishSite unit tests
- [ ] Publish without emulators shows a sensible error (not a silent hang)
- [ ] Marketing site unchanged on `:3000`

---

## What’s next

**Wave 15 (B4):** Site-renderer serves real published pages at `*.codedpixels.co.uk` (local: `SITE_RENDERER_DEV_SLUG`). See [wave-15.md](wave-15.md).

---

## Expert alignment

Aligned with **Dr. Kai Nakamura** (`publishSite` Callable), **Dr. Lena Petrova** (revalidation API), **Dr. Maya Patel** (wave mapping).
