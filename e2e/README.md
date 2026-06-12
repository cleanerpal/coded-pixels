# E2E tests (Playwright)

Cross-lane integration spine owned by **QA-006**. Other QA lanes add specs under `e2e/`; this folder holds shared helpers and the spine spec.

## Quick start (mocked Callables — no Firebase)

Runs against the Next.js dev server only. Callables are mocked in the browser layer so CI does not require emulators.

```bash
npm run test:e2e:spine
```

## Full spine with Firebase emulators

1. Build Cloud Functions once:

   ```bash
   npm --prefix functions run build
   ```

2. Terminal A — start emulators:

   ```bash
   npm run emulators
   ```

3. Terminal B — run spine with emulator env:

   ```bash
   NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true \
   DISABLE_APP_CHECK=true \
   npm run test:e2e:spine
   ```

### Required environment variables

| Variable | Value | Why |
|----------|-------|-----|
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | `true` | Routes `httpsCallable` to `127.0.0.1:5001` |
| `DISABLE_APP_CHECK` | `true` | Skips App Check enforcement in Functions emulator when no reCAPTCHA site key is configured |

Copy `.env.example` to `.env.local` and set the same values for manual dev testing.

### Emulator ports (`firebase.json`)

| Service | Port |
|---------|------|
| Auth | 9099 |
| Firestore | 8080 |
| Functions | 5001 |
| Emulator UI | 4000 |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run test:e2e` | All Playwright specs |
| `npm run test:e2e:spine` | QA-006 integration spine only |

## Lane map (spine failures)

| Step | Ticket | What broke |
|------|--------|------------|
| URL state round-trip | ENG-006 | Config not encoded/decoded in URL |
| Pricing sidebar | ENG-004, ENG-010 | Totals diverge from `lib/pricing.ts` |
| Get Started summary | ENG-020 | Order summary mismatch |
| Signup Callable | INF-003 | Emulator / payload / App Check |
| Success + copy link | ENG-020 | Compact summary or link restore |
| One-time £149 | ENG-004, Q13 | Custom template billing |
| Waitlist snapshot | ENG-023, INF-003 | Site Import waitlist Callable |
| No Firestore writes | INF-003, rules | Client attempted direct PII write |

**Expert alignment:** Dr. Sophia Moreau (E2E), Dr. Nathan Cole (integration gate).
