# Wave 19 — Marketing template previews (Phase 2.1)

**Written by:** Mia Thompson  
**Wave closes when:** DOC-010, INF-005, INF-006, ENG-024, ENG-025, ENG-026, QA-007 are done  
**Milestone:** Users can **see, preview, and pre-select** real pre-designed templates on homepage + `/templates`  
**Spec:** [marketing-template-preview-spec.md](../marketing-template-preview-spec.md) · **Q65, Q66**

---

## In one sentence

Wave 19 makes **10 starter templates** visible and selectable: published demo sites per template, category filters on Step 1, **starter design** copy, preview links, and WebP thumbnails.

---

## Before you start

```bash
npm install

# Terminal 1
npm run emulators

# Terminal 2
FIREBASE_PROJECT_ID=codedpixels npm run seed:templates:emulator
FIREBASE_PROJECT_ID=codedpixels npm run seed:template-demos:emulator

# Terminal 3 — marketing
npm run dev    # http://localhost:3000

# Terminal 4 — site-renderer
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run dev:renderer
```

Optional thumbnails:

```bash
npm run generate:template-thumbnails
```

---

## What you should see

### Marketing (`http://localhost:3000`)

| Surface | What to look for |
|---------|------------------|
| **Configurator Step 1** | Heading **Choose your starter website**; category filter chips; WebP or gradient; **Preview full site** per template |
| **Live preview panel** | Mock wireframe unchanged; **Preview full site →** when template selected |
| **`/templates`** | Same preview affordances on gallery cards |

### Demo tenant (`http://sparkle-clean.localhost:3002`)

| What | Expected |
|------|----------|
| Homepage | Real hero, features, CTA from component registry — not configurator mock |
| View source / headers | `noindex` for platform demo |

### Builder onboarding

| Input | Expected |
|-------|------------|
| Slug `sparkle-clean` | Rejected — reserved for template demo |
| Slug `my-business` | Accepted |

---

## Manual checklist

- [ ] `seed:template-demos:emulator` creates 10 tenants under `codedpixels` project
- [ ] Preview link opens correct `{templateId}.localhost:3002` URL
- [ ] Template selection still updates URL `?template=` and get-started snapshot
- [ ] Custom template card has no preview link
- [ ] `npm test` + `npm run test:e2e` green

---

## Expert alignment

Aligned with **Dr. Samuel Ruiz** (Q65), **Dr. Sophia Laurent** (Q66), **Dr. Rafael Ortiz** (demo tenant schema), **Dr. Marcus Chen** (WebP thumbnails).
