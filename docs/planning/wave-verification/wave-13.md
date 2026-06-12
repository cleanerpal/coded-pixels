# Wave 13 — Builder shell + component registry (B2-001, B2-002)

**Written by:** Mia Thompson  
**Wave closes when:** B2-001 and B2-002 are done  
**Milestone:** Builder app at `app.codedpixels.co.uk` (local port 3001); shared section registry package  
**Status:** Shipped  
**Browser change:** **New app** — marketing unchanged

---

## In one sentence

Wave 13 gives you a second app: the builder shell with dashboard, demo editor, and onboarding placeholder — plus a shared component registry so real section types (hero, features, etc.) can render in the canvas.

---

## Before you start

```bash
npm install
npm run dev:builder    # http://localhost:3001
```

Marketing still runs separately:

```bash
npm run dev            # http://localhost:3000 — unchanged
```

Terminal checks:

```bash
npm test
npm run lint && npm run typecheck
```

---

## What shipped

| Ticket | What landed |
|--------|-------------|
| **B2-001** | `apps/builder/` — routes for `/dashboard`, `/onboarding`, `/sites/[siteId]/edit`; builder chrome (top bar, pages sidebar, canvas, section palette, properties panel) |
| **B2-002** | `packages/component-registry/` — `@codedpixels/component-registry` with section renderers, Zod schemas, `SectionRenderer`, editor panels, Vitest tests |

Publish and live sites are **not** wired yet — those land in Waves 14–15.

---

## What you should see in the browser

### Builder app (`http://localhost:3001`)

| URL | What to look for |
|-----|------------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | CodedPixels header; empty-state card; **Open demo editor** link |
| `/sites/demo-site/edit` | Full builder shell — section palette (left), canvas (centre), properties (right), top bar with disabled Preview and **Publish** (Publish may call backend once Wave 14 lands) |
| `/onboarding` | Onboarding shell (full wizard completes after Wave 16 provisioning) |

### Marketing (`http://localhost:3000`)

Unchanged — same configurator and pages as Wave 11.

---

## Manual checklist

- [ ] `npm run dev:builder` starts without errors on port **3001**
- [ ] `/dashboard` loads with CodedPixels branding and demo editor link
- [ ] Demo editor shows mock sections on the canvas (from `@codedpixels/component-registry`)
- [ ] Section palette lists section types; clicking one selects it on canvas
- [ ] Properties panel updates when a section is selected
- [ ] `npm test` green — includes component-registry package tests
- [ ] Marketing `/` still works while builder runs in parallel

---

## What’s next

**Wave 14 (B3):** Publish button calls `publishSite` and triggers site-renderer revalidation. See [wave-14.md](wave-14.md).

---

## Expert alignment

Aligned with **Mr. Theo Laurent** (builder shell UX), **Dr. Lena Petrova** (builder app scaffold), **Dr. Sophia Laurent** (component registry), **Dr. Maya Patel** (wave mapping).
