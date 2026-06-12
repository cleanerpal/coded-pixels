# CodedPixels

UK-first SaaS marketing site + modular website builder · **codedpixels.co.uk**

## Start here

| Audience | Entry |
|----------|-------|
| **AI agents / contributors** | [`.cursor/AGENTS.md`](.cursor/AGENTS.md) |
| **Plain-English overview** | [`docs/overview/what-we-are-building.md`](docs/overview/what-we-are-building.md) |
| **Resume anywhere** | Type **`/codedpixels resume`** in any Cursor chat |
| **Using specs (how/why)** | [`docs/process/using-specs.md`](docs/process/using-specs.md) |
| **Full documentation index** | [`docs/README.md`](docs/README.md) |

## Repository layout

```
.
├── README.md
├── firebase.json             # Firestore, Functions, emulator config
├── .firebaserc               # Firebase project alias (default: codedpixels)
├── firestore.rules           # Deny-all stub until INF-002 deploys §11 rules
├── functions/                # Cloud Functions v2 scaffold (europe-west2)
├── .cursor/
│   ├── AGENTS.md             # Agent entry point
│   ├── experts.md            # Domain expert roster
│   └── rules/                # Cursor agent rules
└── docs/
    ├── overview/             # Non-technical summaries
    ├── brand/                # Visual identity & copy
    ├── specs/                # Product & technical specifications
    ├── planning/             # Tickets, reviews, backlog
    └── process/              # Workflow & contributor rules
```

## Firebase (local development)

**Region:** Firestore, Cloud Functions, and Cloud Storage use **`europe-west2` (London)** per Q33. Callable region is set globally in `functions/src/index.ts`.

**Project ID:** `.firebaserc` defaults to `codedpixels`. Point at your GCP project before deploy:

```bash
npx firebase use <your-project-id>
```

**Emulators** (optional — required for signup/waitlist tests from Wave 5 onward):

```bash
# Install root + functions dependencies first
npm install
npm install --prefix functions

# Start Auth, Firestore, Functions, Storage emulators
npm run emulators
```

| Emulator   | Port |
|------------|------|
| Emulator UI | 4000 |
| Auth       | 9099 |
| Firestore  | 8080 |
| Functions  | 5001 |
| Storage    | 9199 |

Rules and Callables are **not deployed** until INF-002 / INF-003. Local emulators use the stub `firestore.rules` (deny-by-default). See `docs/specs/firestore-schema.md` and `docs/specs/firestore-rules-spec.md` for collection layout and security model.

## Status

Pre-implementation — specs and tickets complete; M0–M4 marketing build ready to start.

See [`docs/planning/implementation-tickets.md`](docs/planning/implementation-tickets.md) for Wave 1 kickoff (ENG-001, ENG-002, ENG-003, DOC-001).
