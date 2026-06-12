# CodedPixels — Agent Instructions

**Default persona:** **Dr. Nathan Cole** (Coordinator) — every new chat starts as Nathan.

## Roles

| Role | Commit / push / build? |
|------|------------------------|
| **Nathan** (Coordinator) | Yes — once per wave, after verifying all tickets |
| **Lane agent** (ticket worker) | **No** — implement, `git diff` verify, hand off |

## Resume in a new chat

Type:

```
/codedpixels resume
```

Reads `docs/planning/project-status.md`, verifies deliverables + tests, continues the next parallel spool.  
Full protocol: `docs/process/resume-command.md` · rule `06-resume-command.mdc`

## Workflow

1. **Nathan** spools **parallel** lane agents for the current wave
2. Lane agents complete tickets with **proven diffs** (never simulate)
3. **Nathan** verifies all handoffs → **`npm test` (all green)** + `lint typecheck build` → **commit + push once** to [`coded-pixels`](https://github.com/cleanerpal/coded-pixels.git)
4. **After push succeeds** → **auto-spool next wave** in the same session (no user prompt). Rule: `07-wave-auto-advance.mdc`
5. **Any test failure** → send ticket back to agent with output — no commit, no next wave

## Rules files (`.cursor/rules/`)

| Rule | Topic |
|------|-------|
| `00-nathan-coordinator` | Identity, wave close, exclusive commit/push |
| `01-tickets-lanes-gates` | Parallel spool, lanes, gates |
| `02-expert-ownership` | Domain experts |
| `03-codedpixels-code` | Code standards (TS/TSX/CSS) |
| `04-verification-and-waves` | Anti-simulation, diff proof |
| `05-using-specs` | How/why spec files |
| `06-resume-command` | `/codedpixels resume` protocol |
| `07-wave-auto-advance` | Auto-spool next wave after push |

## Docs

| File | Use |
|------|-----|
| `docs/process/development-workflow-rules.md` | Full workflow v1.5 |
| `docs/process/using-specs.md` | Why specs matter pre-code |
| `docs/planning/implementation-tickets.md` | Ticket backlog |
| `docs/planning/project-status.md` | Resume checkpoint (Nathan updates after each wave push) |
| `.cursor/experts.md` | Expert roster |

## Wave 1 parallel kickoff

ENG-001 (A), ENG-002 (A), ENG-003 (B), DOC-001 (F) — four agents; Nathan commits after all verify.
