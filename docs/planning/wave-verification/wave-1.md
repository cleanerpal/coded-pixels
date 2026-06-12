# Wave 1 — What you should see in the browser

**Written by:** Mia Thompson  
**Wave closes when:** ENG-001, ENG-002, ENG-003, and DOC-001 are done  
**Milestone:** Foundation — the app exists, it looks on-brand, and the data layer is ready (but the configurator is not built yet)

---

## In one sentence

After Wave 1, you have a working Next.js site with CodedPixels colours and fonts, a simple demo page proving the design tokens work, and all the pricing/template **names and metadata** sitting in code — plus a legal spec document on disk (not visible in the browser). Template **page layouts** in Firestore come much later (Wave 12 / B1-001) — see [roadmap.md](roadmap.md).

---

## Before you start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

Also run these in a second terminal — they should all pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

---

## What you should see in the browser

### Homepage (`/`)

| What | What to look for |
|------|------------------|
| **Page loads** | No crash, no white screen of death |
| **Heading** | “CodedPixels” in indigo (`#4F46E5` primary colour) |
| **Body text** | Muted grey helper text about design tokens |
| **Sample card** | A white card with buttons and a green badge |
| **Primary button** | Cyan/teal background (`#06B6D4` accent) |
| **Secondary button** | Outlined indigo border |
| **Badge** | Green “Save £XX per year” pill |
| **Font** | Inter (clean, modern sans-serif) |

### What you should **not** see yet

- No site header with logo and navigation (Wave 2)
- No footer with Privacy/Terms links (Wave 2)
- No configurator, package cards, or pricing sidebar (Waves 3–4)
- No cookie banner (Wave 6)

That is normal. Wave 1 is the engine room, not the shop floor.

---

## Manual test checklist

Work through these in order. Tick each box when it passes.

### A — Site boots

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads within a few seconds
- [ ] Browser tab title shows “CodedPixels”
- [ ] No red errors in the browser console (F12 → Console)

### B — Design tokens (ENG-002)

- [ ] Primary indigo visible on the main heading
- [ ] Accent cyan/teal on the primary button
- [ ] Green badge uses success colour (not random hex)
- [ ] Page background is off-white (`#FAFAFA`), not harsh pure white
- [ ] Right-click a button → Inspect → confirm classes like `bg-accent` / `text-primary`, not inline `#4F46E5`

### C — Scaffold (ENG-001)

- [ ] Page is not completely blank — content renders inside `<main>`
- [ ] `npm run build` finishes with “Compiled successfully”
- [ ] After build, `npm start` still serves the page (optional smoke test)

### D — Data layer (ENG-003) — terminal checks

These are code-only in Wave 1; nothing on screen proves them yet.

- [ ] `test -f apps/marketing/lib/features.ts && test -f apps/marketing/lib/packages.ts && test -f apps/marketing/lib/templates.ts` — data files exist (paths after Wave 11 monorepo; on Wave 1 only, use `lib/` at repo root)
- [ ] `npm test` passes (may say “No tests yet” or run Vitest if added later)

Quick sanity in Node (optional):

```bash
node -e "const f=require('./lib/features.ts')" 2>/dev/null || echo "Use npm test instead — TS files need the test runner"
```

Prefer: open `lib/packages.ts` and confirm Growth preset lists `crm`, `email-automation`, `analytics-seo`.

### E — Legal spec (DOC-001) — file check

- [ ] File exists: `docs/planning/cookie-consent-legal-spec.md`
- [ ] Open it — you should see cookie categories, Privacy outline, Terms outline
- [ ] Status line says approved for M3 implementation

---

## If something fails

| Symptom | Likely cause |
|---------|----------------|
| Port 3000 in use | Stop other Next apps or use `npm run dev -- -p 3001` |
| “Module not found” | Run `npm install` again |
| Plain unstyled HTML | Tailwind not loading — check `app/globals.css` has `@import "tailwindcss"` |
| Build fails on TypeScript | Run `npm run typecheck` and read the first error |

---

## Expert alignment

Aligned with **Dr. Marcus Chen** (brand tokens), **Dr. Lena Petrova** (scaffold), **Dr. Rafael Ortiz** (feature IDs in code), **Dr. Patrick O'Brien** (legal spec structure).
