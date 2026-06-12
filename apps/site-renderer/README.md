# @codedpixels/site-renderer

Live tenant site renderer for **`*.codedpixels.co.uk`** (Platform Phase B4).

Aligned with **DOC-006** (`docs/specs/site-renderer-architecture.md`) and **builder-ui-spec §6**.

## Local development

```bash
# From repo root
npm run dev:renderer

# Pin a tenant when using localhost:3002
SITE_RENDERER_DEV_SLUG=acme-clean

# Or map a slug subdomain locally (optional)
# acme-clean.localhost:3002 → /etc/hosts not required for *.localhost
```

With Firestore emulator:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run emulators   # separate terminal
SITE_RENDERER_DEV_SLUG=demo FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev:renderer
```

## Wildcard hosting (Firebase App Hosting)

Production topology (three backends — expert-review memo):

| Backend | Domain |
|---------|--------|
| marketing | `codedpixels.co.uk`, `www.codedpixels.co.uk` |
| builder | `app.codedpixels.co.uk` |
| **site-renderer** | **`*.codedpixels.co.uk`** |

**Deploy stub (MVP):**

1. Create Firebase App Hosting backend `site-renderer` in `europe-west2`.
2. Point wildcard DNS `*.codedpixels.co.uk` → App Hosting target for this backend.
3. Set env: `REVALIDATE_SECRET`, `FIREBASE_PROJECT_ID`, Admin credentials via Secret Manager.
4. `publishSite` (B3-001) POSTs to `https://{slug}.codedpixels.co.uk/api/revalidate` with `x-revalidate-secret`.

Reserved subdomains (no tenant lookup): `app`, `www`, `api`, `staging`, `preview`.

## Architecture notes

- **Middleware** parses `Host` → tenant slug → injects `x-tenant-slug` (Edge-safe).
- **Admin SDK** resolves `slugs/{slug}` and loads published page versions in Server Components only.
- **ISR:** `revalidate = 3600` + cache tag `site:{siteId}`; on-demand via `/api/revalidate`.
- **Draft isolation:** only `publishedVersionId` + `status === 'published'` versions render.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Tenant homepage (`sites.homepagePageId`) |
| `/[pageSlug]` | Published secondary page |
| `/api/revalidate` | On-demand ISR (B3-001) |
| `/api/health` | App Hosting health check |

Public form submission (`submitLead`) — deferred to **B9-001**.
