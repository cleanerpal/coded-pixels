# Wave 12 — Tenant schema + template seeds (B1-001, B1-002)

**Written by:** Mia Thompson  
**Wave closes when:** B1-001 and B1-002 are done  
**Milestone:** Firestore tenant model + real template page layouts in seed files; expanded security rules  
**Status:** Shipped  
**Browser change:** **None** on marketing site (terminal / Firebase emulator only)

---

## In one sentence

Wave 12 puts real page layouts (hero, features, and so on) into seed files ready for Firestore, locks down tenant data with expanded rules, and adds automated rules tests — visitors still see the same marketing site.

---

## What shipped

| Ticket | What landed |
|--------|-------------|
| **B1-001** | `packages/templates/seeds/` — manifest + 11 `*.defaultSections.json` files; Platform Phase 2 types in `@codedpixels/shared-types`; `npm run validate:templates` and `npm run seed:templates:emulator`; `firestore-schema.md` §5.2 `seedVersion` / `contentHash` |
| **B1-002** | `firestore.rules` tenant expansion (companies, sites, pages, leads CRM gate, products public read); 52 rules tests in `npm run test:rules` |

**Templates milestone:** The platform now has **full section trees** for each catalogue template — not just names in the configurator. Customers still cannot edit them until the builder (Wave 13) and provisioning (Wave 16).

---

## What you should see in the browser

**Nothing new** on http://localhost:3000 — run the [wave-4.md](wave-4.md) spot check if you want to confirm marketing is unchanged.

Optional: open Firebase Emulator UI after seeding (see commands below) and browse the `templates` collection.

---

## Dev commands to verify

From repo root:

```bash
npm install
npm run validate:templates
npm test
npm run test:rules
```

Seed templates into the Firestore emulator (requires emulators running):

```bash
# Terminal 1
npm run emulators

# Terminal 2
npm run seed:templates:emulator
```

Quick file checks:

```bash
test -f packages/templates/seeds/manifest.json
test -f packages/templates/seeds/sparkle-clean.defaultSections.json
test -f packages/shared-types/src/firestore/company.ts
```

---

## Manual checklist

- [ ] `npm run validate:templates` exits 0 — all 11 seed JSON files pass schema checks
- [ ] `npm test` green (includes shared-types and template package tests)
- [ ] `npm run test:rules` green — B1 tenant rules covered (52 tests total after this wave)
- [ ] `packages/templates/seeds/manifest.json` lists 11 template IDs matching marketing catalogue
- [ ] Marketing site at `/` unchanged from Wave 11 — configurator still works
- [ ] After emulator seed: `templates/sparkle-clean` (or similar) document exists with `defaultSections` array
- [ ] `firestore.rules` includes tenant collections — not just M3 signups/waitlist

---

## What’s next

**Wave 13 (B2):** Builder app shell at http://localhost:3001 — first time you can open an editor UI. See [wave-13.md](wave-13.md).

---

## Expert alignment

Aligned with **Dr. Rafael Ortiz** (B1 schema + template seeds), **Dr. Victor Lang** / **Dr. Liam Harper** (B1-002 rules tests), **Dr. Maya Patel** (wave mapping).
