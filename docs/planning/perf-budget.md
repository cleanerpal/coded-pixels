# Performance budget (QA-003)

**Experts:** Dr. Daniel Moreau (FinOps/CI), Dr. Nadia Sokolov (a11y)  
**Spec:** `codedpixels-project-plan.md` — success metrics + § Performance  
**Ticket:** QA-003

## Targets

| Metric | Target | Enforcement |
|--------|--------|-------------|
| Lighthouse Performance (mobile, `/`) | ≥ 90 | `lighthouserc.json` assertion |
| Lighthouse Accessibility (mobile, `/`) | ≥ 95 | `lighthouserc.json` assertion |
| Configurator route client JS | < 80 KB gzip | `scripts/lighthouse-budget.mjs` |

Mobile emulation matches Lighthouse defaults: 375×667 viewport, 4× CPU slowdown, ~1.6 Mbps throughput.

## Run locally

```bash
npm run build
npm run start &
LIGHTHOUSE_BASE_URL=http://localhost:3000 npm run test:lighthouse
```

Partial runs:

```bash
# Bundle budget only (no server required after build)
npm run test:lighthouse -- --bundle-only

# Lighthouse only (skip chunk measurement)
npm run test:lighthouse -- --skip-bundle
```

Reports are written to `.lighthouseci/` (gitignored).

## CI (optional)

`test:lighthouse` is **not** part of `npm test`. Wire it manually in CI when a production build + server step is available:

```yaml
- run: npm run build
- run: npm run start &
- run: npm run test:lighthouse
  env:
    LIGHTHOUSE_BASE_URL: http://localhost:3000
```

Fail the job on non-zero exit. Keep the main unit-test job independent so Lighthouse infra gaps do not block merges.

## Configurator chunk measurement

Until the configurator island is code-split with `next/dynamic`, the budget script measures **`static/chunks/app/page.js` gzip size** — the home route client bundle that contains `ConfiguratorShell` and step components. Shared framework chunks (`webpack.js`, `main-app.js`) are excluded.

After a production build, capture baseline:

```bash
npm run build
npm run test:lighthouse -- --bundle-only
```

Record the printed total in wave verification (`docs/planning/wave-verification/wave-6.md` § E). When dynamic import lands (project plan § Performance), re-point measurement to the dedicated configurator chunk filename.

## Related files

| File | Purpose |
|------|---------|
| `lighthouserc.json` | LHCI collect + assert thresholds |
| `scripts/lighthouse-budget.mjs` | Orchestrates LHCI + bundle check |
| `package.json` → `test:lighthouse` | npm entry point |

## Manual checks (wave verification)

- First interaction < 1 s on throttled 4G (DevTools → Slow 4G)
- No layout jump when mobile pricing bar mounts

Aligned with Dr. Daniel Moreau on perf budget.
