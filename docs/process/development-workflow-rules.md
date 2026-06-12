# CodedPixels — Development Workflow Rules (Agent / Contributor Edition)

**Version:** 1.6  
**Date:** 12 June 2026  
**Owners:** Dr. Nathan Cole (Coordinator), Dr. Maya Patel (Orchestrator), Dr. Lena Moreau (Docs)  
**Applies to:** All implementation tickets in `docs/planning/implementation-tickets.md` (M0–M4 marketing + Platform Phase 2 prep/build)  
**Related:** `.cursor/experts.md` (slim roster), `.cursor/AGENTS.md`, `.cursor/rules/` (Cursor agent rules), `docs/README.md`, `docs/specs/codedpixels-project-plan.md`, `docs/specs/builder-ui-spec.md`, `docs/specs/firestore-schema.md`, `docs/specs/firestore-rules-spec.md`, `docs/planning/expert-review-memo.md`

---

## 1. Purpose & Scope

This rules file standardizes how contributors (human or AI agents) execute tickets from the decomposed plan. It ensures:

- Strict adherence to expert-reviewed decisions (Q1–Q64 + amendments).
- Maximum safe parallelism via lanes & waves while respecting hard gates.
- Security, compliance, accessibility, and money-math correctness by default.
- Traceable changes with expert alignment noted.
- Clean git history and minimal merge conflicts.

**Who this is for:** Anyone picking up a ticket (ENG-_, INF-_, DOC-_, QA-_, B0-\*, etc.). The slim `.cursor/experts.md` is the canonical quick-reference for domain ownership.

**Non-goals:** This does **not** replace the detailed specs. Always read the primary documents first. See **`docs/process/using-specs.md`** for how and why to use specs at this stage.

---

## 1.5 Using spec files (summary)

**Why:** Specs are the contract until code exists — they prevent parallel drift and define acceptance.  
**How:** Ticket → grep project-plan Q## → read schema/rules/brand if relevant → implement → verify diff matches spec.  
**Full guide:** [`docs/process/using-specs.md`](using-specs.md) · `.cursor/rules/05-using-specs.mdc`

---

## 1.6 Roles: Coordinator vs lane agents

| Role | Who | Commit / push / `npm run build`? |
|------|-----|----------------------------------|
| **Coordinator** | **Dr. Nathan Cole** (default in every new agent chat) | **Yes** — only after all wave tickets verified |
| **Lane contributor** | Agent assigned one ticket in lane A–F | **No** — implement, verify diff, hand off to Nathan |

**Parallel execution:** Nathan **always spools lane agents in parallel** for the current wave (one ticket per agent, different lanes where possible). Never run waves serially unless a hard gate blocks the whole wave.

**Wave close (Nathan only):**

1. Collect handoffs from all lane agents in the wave
2. Verify each ticket: `git diff` non-empty, files exist, acceptance criteria met
3. Run full quality gates: `lint`, `typecheck`, **`npm test` (entire suite — zero failures)**, **`build`**
4. If **all** pass (including every test) → **one commit + one push** to `origin main`; mark tickets DONE; **auto-spool next wave** (§3.4.1)
5. If **any** test or gate fails → send failing ticket back to lane agent with command output; **no commit**

Lane agents must **not** simulate completion — see §3.6 in §3 below.

---

## 2. Core Principles (Non-Negotiable)

1. **Specs are law until amended** — Every line of code must trace back to a decision in `docs/specs/codedpixels-project-plan.md`, `docs/specs/builder-ui-spec.md`, `docs/specs/firestore-schema.md`, or `docs/planning/expert-review-memo.md`. If conflict or ambiguity → stop and escalate to Coordinator.
2. **Security & Functions-first for writes** — Never allow client writes to PII collections (`signups`, `waitlist_site_import`, `leads`, `companies/**` until builder client writes are approved). Use Callable Functions + Admin SDK for M3+ sensitive paths. Follow `docs/specs/firestore-rules-spec.md` exactly.
3. **Money is always integer pence** — Use the exact annual formula in `ENG-004` scope. No `Math.round` on intermediate floats. One-time fees (`£149`) handled separately from recurring totals.
4. **Test before you trust** — Unit tests for pricing/engine, rules-unit-tests for Firestore, Playwright E2E for flows, Lighthouse for perf. No PR without green local checks.
5. **Respect gates ruthlessly** — Wave 3 blocked until `ENG-006` round-trip tests pass and reviewed. M3 PII endpoints blocked until `DOC-002` + Sentry live. B0 blocked until `DOC-006`/`DOC-007` frozen.
6. **Parallel lanes protect velocity** — Own only files in your assigned lane (see `docs/planning/implementation-tickets.md` lane map). Coordinate via Coordinator if cross-lane changes needed.
7. **Expert alignment in every change** — Before coding, identify primary expert(s) from roster. Read their notes/decisions. In commit/PR body note: "Aligned with Dr. X on [specific decision Q## or spec section]".
8. **UK-first compliance & a11y baked in** — WCAG notes from Dr. Nadia Sokolov, GDPR from Dr. Patrick O'Brien, consumer from Ms. Rebecca Flynn. Mobile read-only builder is intentional (Q52).
9. **Verify on disk, never simulate** — Before marking a ticket complete, run `git status` + `git diff` and read changed files. Empty diff = not done. See §3.6.
10. **Nathan-only commit, push, and production build** — Lane agents hand off; Nathan integrates and commits once per wave after full verification.
11. **All tests must pass before commit/push** — Full `npm test` suite (and `npm run test:rules` when Firestore touched) with **zero failures**. No exceptions, no skipped tests, no partial suites at wave close.
12. **Document drift immediately** — Any behavioural change or new pattern → update the relevant spec + this rules file if it generalizes.

---

## 3. Per-Ticket Workflow (The Rules in Action)

Use this exact sequence for **every** ticket (ENG-001 through B8-001). Adapt depth to ticket size but never skip core steps.

### 3.1 BEFORE Starting Work (Mandatory — 10–30 min depending on complexity)

1. **Read the ticket fully** in `docs/planning/implementation-tickets.md` (scope, acceptance criteria, blocked-by/parallel-with, lane, wave).
2. **Map to primary expert(s)** using `.cursor/experts.md`:
   - Pricing / money logic → Dr. Marcus Klein + Dr. Priya Desai
   - Firestore / rules / schema → Dr. Rafael Ortiz + Dr. Priya Desai + Dr. Victor Lang
   - Next.js / UI / configurator → Dr. Lena Petrova + Dr. Elena Voss + Dr. Sophia Laurent
   - a11y → Dr. Nadia Sokolov
   - Auth / RBAC → Dr. Fatima Al-Sayed
   - Stripe / payments → Dr. Owen Reilly
   - Observability / Sentry → Dr. Mira Solano
   - Legal / privacy / ToS → Dr. Patrick O'Brien + Ms. Rebecca Flynn
   - Testing / E2E → Dr. Sophia Moreau + Dr. Liam Harper + Dr. Aisha Khan
   - Etc. (cross-reference with ticket domain).
3. **Read the relevant source specs** (minimum):
   - `docs/specs/codedpixels-project-plan.md` sections covering the feature (use search for Q## or keywords).
   - `docs/planning/expert-review-memo.md` for why the decision was made and any filed notes.
   - `docs/specs/firestore-schema.md` + `docs/specs/firestore-rules-spec.md` if data model, leads, versions, assets, etc. involved.
   - `docs/specs/builder-ui-spec.md` if builder-related (even in M0–M4 prep tickets).
4. **Check current state** — `git status`; confirm no conflicting lane edits in progress
5. **Identify hard dependencies/gates** — If blocked, do **not** start coding
6. **Announce start** — "Starting ENG-XXX, lane Y, files: …" (Nathan spools parallel agents)

**Gate:** If you cannot name the primary expert and quote at least one relevant decision from the specs, **do not start coding**.

### 3.2 DURING Implementation

- Stay inside your **Lane** files (see lane map in `docs/planning/implementation-tickets.md`). If you must touch another lane, coordinate with the other agent + Coordinator first.
- Follow existing patterns (Tailwind 4, strict TS, Server Components where possible, `next/image`, Lucide icons, etc.).
- For any new Firestore path or rule change: Propose update to `docs/specs/firestore-schema.md` and `docs/specs/firestore-rules-spec.md` in same PR (or separate DOC ticket if large).
- Pricing / annual / one-time logic: Copy the exact integer formula from `ENG-004` scope. Add tests immediately.
- a11y: Run keyboard nav + `aria-*` checks on any new interactive element (Dr. Nadia Sokolov standards).
- If touching public forms or PII paths: Ensure App Check + rate-limit thinking is present (even if implementation is in INF-003).
- **Lane agents: do not `git commit`, `git push`, or `npm run build`.** Run lane-relevant tests only (e.g. unit tests for `lib/*`).
- If you discover a spec gap or contradiction: Stop, document in the ticket + `docs/planning/expert-review-memo.md` style note, escalate to Coordinator. Do **not** invent behaviour.

### 3.3 AFTER Completing Scope (Lane agent — hand off to Nathan)

**Do not claim the ticket is complete without evidence.** Run these commands and include output in your handoff:

```bash
git status
git diff --stat
git diff
```

Then **read every changed file** — confirm content matches ticket acceptance criteria.

1. **Prove code/docs changed** — `git diff` must show changes for this ticket (or new files exist). Empty diff → keep working.
2. **Run full test suite before handoff** (when app/tests exist):
   - `npm run lint`
   - `npm run typecheck`
   - **`npm test` — entire suite, all tests green** (not just touched modules)
   - `npm run test:rules` if Firestore rules/schema touched
   - **Do not run `npm run build`** — Nathan runs this at wave close
3. **Update docs** if behaviour changed (same files as before)
4. **Self-review** — Tick every acceptance criterion; list any deviation
5. **Expert alignment note** — "Aligned with Dr. X on Q##"
6. **Hand off to Nathan** with: ticket ID, files changed, diff summary, test output, expert alignment

**Lane agents do not:** commit, push, open PR, mark ticket DONE, or run production build.

### 3.4 Nathan — wave verification (before commit & push)

After **all** lane agents in the wave report complete:

| Step | Action | Fail → |
|------|--------|--------|
| 1 | Per ticket: `git diff` + read files — non-empty, matches scope | Return to lane agent |
| 2 | All acceptance criteria checked | Return to lane agent |
| 3 | `npm run lint && npm run typecheck && npm test && npm run build` — **all tests must pass** | Return to failing ticket's agent |
| 4 | Firestore touched → `npm run test:rules` — **all rules tests must pass** | Return to lane E agent |
| 5 | Mark tickets DONE in `implementation-tickets.md` | — |
| 6 | **Single wave commit + push** to `https://github.com/cleanerpal/coded-pixels.git`; update **`docs/planning/project-status.md`** | — |
| 7 | **Auto-spool next wave** — same session, no user prompt (§3.4.1) | — |

### 3.4.1 Auto-advance after push (Nathan — mandatory)

After step 6 succeeds (`git push origin main`, remote confirmed):

1. Update `project-status.md` (completed tickets, increment wave, refresh next spool table)
2. Read `implementation-tickets.md` for **next wave** unblocked tickets
3. **Immediately spool** parallel lane agents — do not ask the user
4. Repeat verify → commit → push → spool until a **hard gate** blocks or backlog ends

**Within-wave deps:** Spool only unblocked tickets (e.g. Wave 2: ENG-004 + ENG-005 first; spool ENG-006 when ENG-004 handoff verified).

**Stop auto-advance when:** tests fail, push fails, hard gate (ENG-006→Wave 3, M3 PII, B0), user says stop, or M4 complete.

Full rule: `.cursor/rules/07-wave-auto-advance.mdc`

**Wave commit message format:**

```
wave(N): complete M0 wave N — ENG-001, ENG-002, ENG-003, DOC-001

- [bullet per ticket]
- Verified: lint, typecheck, **all tests**, build green

Refs: ENG-001 ENG-002 ENG-003 DOC-001
Coordinator: Dr. Nathan Cole
```

### 3.5 COMMIT & PUSH Rules (Nathan only)

**Only Dr. Nathan Cole** may run `git commit` and `git push` to shared branches.

- **When:** Once per wave, after §3.4 passes — **including full test suite green**
- **Remote:** `origin` → `https://github.com/cleanerpal/coded-pixels.git`, branch `main`
- **After push:** Auto-spool next wave per §3.4.1 — do not pause for user confirmation
- **Never:** Lane agents commit or push; never commit with empty diff; never push with **any failing test** or failing build
- **Branch:** `main` or agreed integration branch — one wave commit preferred for clarity
- **If a wave ticket fails verification:** Send back to lane agent with logs; do not partial-commit the wave

**Commit message format (individual ticket, if not using wave batch):**

```
<type>(<scope>): <short summary> [TICKET-ID]
...
Aligned with: Dr. Firstname Lastname on [Q## / spec §]
```

**Never commit:**

- Broken code that fails `npm run build` or **`npm test` (any failure)**
- Secrets, `.env`, large binaries
- Empty changes (verify diff first)
- Direct edits by lane agents without Nathan integration

### 3.6 Verification protocol (anti-simulation)

**Forbidden phrases without evidence:** "I've implemented…", "Done", "Should work" — unless followed by `git diff` output and file reads.

**Required before any "ticket complete" statement:**

1. Shell: `git status` and `git diff --stat`
2. Tool: Read changed files
3. Shell: relevant tests passed (output shown)

**Required before any "committed/pushed" statement (Nathan only):**

1. All of §3.4 green — **`npm test` full suite passed** (show output or summary)
2. Shell: `git log -1` and `git status` showing clean push state

### 3.7 PR Rules (optional — if using PRs instead of direct wave push)

If the team uses PRs, lane agents still do not push — Nathan opens PR after wave verification, or merges locally then pushes.

**PR body template** (Nathan fills after wave verify):

```markdown
## Summary

Implements [ticket title] per scope in docs/planning/implementation-tickets.md.

## Changes

- Bullet list of key files + what changed
- Any doc updates

## Testing

- [ ] `npm run lint && npm run typecheck && npm test` — all green
- [ ] `npm run build` — production build succeeds
- [ ] Manual verification of [specific user flow]
- [ ] (If rules) Rules unit tests passed
- [ ] Lighthouse / a11y spot-check (if UI)

## Expert Alignment

Aligned with Dr. [Name] on [decision / Q## / spec section].  
See their input in project-plan §X and expert-review-memo.

## Gates & Dependencies

- Respects wave gate: [yes / N/A]
- No cross-lane conflicts introduced
- Blocked by / blocks: [list if any]

## Screenshots / Loom (if UI)

[attach or link]

## Checklist

- [ ] Acceptance criteria from ticket all met (or deviations justified)
- [ ] No new console errors / warnings
- [ ] Mobile responsive (if UI)
- [ ] UK VAT-inclusive pricing language preserved
```

**Review & Merge:**

- Request review from at least one other agent or the lane owner.
- Critical-path tickets (ENG-004, ENG-006, any M3 PII INF-_, B0-_) require Coordinator (Dr. Nathan Cole or delegate) + relevant expert domain sign-off in review.
- Do not merge your own PR.
- Merge only after CI (GitHub Actions or equivalent) is green + approval(s).
- Delete branch after merge (or let GitHub do it).

**Escalation path:**

- Ambiguity in spec → Coordinator (Dr. Nathan Cole) + relevant expert.
- Gate violation risk → Dr. Maya Patel (orchestrator).
- Security/compliance concern → Dr. Victor Lang + Dr. Patrick O'Brien + Dr. Rafael Ortiz.
- Merge conflict with another lane → Coordinator immediately.

---

## 4. Branching, Git & Coordination Details

- **Main branch:** `main` on [`cleanerpal/coded-pixels`](https://github.com/cleanerpal/coded-pixels.git) — always buildable after Nathan's wave push
- **Lane agents:** Work in working tree; **no feature-branch commit/push** unless Nathan explicitly assigns a branch strategy
- **Nathan:** Commits and pushes **once per wave** after §3.4 verification
- **Never force-push** to shared branches
- **Parallel spool (mandatory):** Nathan launches **all parallel-safe tickets in the current wave at once** — one agent per ticket, different lanes
- **Daily stand-up equivalent:** Lane agent: "Starting ENG-XXX, lane C, files: Step1Templates.tsx"
- **Lane ownership:** See `docs/planning/implementation-tickets.md` lane map
- **Wave 3+ dense lanes (especially C):** Claim specific files before coding
- **Integration pairing (Wave 5):** ENG-020 + QA-006 paired from day one
- **Wave gates:** Do not start coding a blocked ticket

---

## 5. Documentation Update Rules

- **docs/specs/codedpixels-project-plan.md** — Only for new decisions or clarifications that affect multiple tickets. Add to Decision Log section with new Q## if continuing the numbering.
- **docs/specs/builder-ui-spec.md** / **docs/specs/firestore-schema.md** / **docs/specs/firestore-rules-spec.md** — Update in same PR as the code change that affects them.
- **docs/planning/expert-review-memo.md** — Append-only for new filed notes from implementation discoveries.
- **This rules file** — Update when a workflow pattern proves valuable (or painful) across multiple tickets. Bump version.
- **docs/planning/implementation-tickets.md** — Mark tickets DONE with date + short note when merged. Do not delete history.
- **docs/planning/project-status.md** — Nathan updates after every wave commit+push (required for `/codedpixels resume`).

---

## 6. M3 PII / Legal / Sentry Extra Gates (from Q61, review memo)

Before any ticket that enables `submitSignup`, `submitSiteImportWaitlist`, or public form writes (`ENG-020`, `ENG-023`, `INF-003`):

- `DOC-002` (Privacy + Terms real pages) must be merged and live.
- `INF-004` (Sentry on marketing site with PII scrubbing) must be live.
- Cookie consent banner (`ENG-021`) + GA4 (`ENG-022`) should be in or in same release.
- Explicit consent checkbox + `consentAt` + `consentVersion` fields present.

These are hard gates — Coordinator will not approve PRs that bypass them.

---

## 7. Platform Phase 2 Specifics (B0+ tickets)

- Same workflow rules apply.
- Additional: Monorepo prep (`DOC-007`) must be frozen before `B0-001`.
- Shared renderer architecture (`DOC-006`) reviewed by Dr. Michael Chen + Dr. Marcus Rivera + Dr. Lena Petrova before `B4-001`.
- Turborepo layout approved before any package splitting.
- Builder tickets (B2+) also reference `docs/specs/builder-ui-spec.md` §5 interactions and component registry.

---

## 8. Quick Reference Checklist

### Lane agent — per ticket

**BEFORE:** Ticket + spec Q## + expert + lane + gate check  
**DURING:** Lane files only; no commit/push/build  
**HAND OFF:** `git diff` output + file reads + lane tests + expert alignment → Nathan  

### Nathan — per wave

**COLLECT:** All wave ticket handoffs (parallel agents complete)  
**VERIFY:** Non-empty diffs + acceptance + `lint typecheck test build` — **all tests green** (+ rules if needed)  
**SHIP:** One commit + one push only if **zero test failures**; mark tickets DONE; **auto-spool next wave**  
**FAIL:** Return ticket to agent with logs — no commit, no next wave  

---

## 9. Version History & Amendment Process

| Version | Change |
|---------|--------|
| 1.0 | Initial release |
| 1.1 | Wave 3 sub-file claiming; ENG-020 + QA-006 pairing rule |
| 1.2 | Documentation moved to `docs/{overview,brand,specs,planning,process}/` |
| 1.3 | Verification anti-simulation; Nathan-only commit/push/build; wave batch; parallel spool; using-specs guide |
| 1.4 | **All tests must pass** before commit/push — full suite, zero failures |
| 1.5 | **`/codedpixels resume`** + `project-status.md` checkpoint |
| 1.6 | **Auto-advance:** spool next wave after push; remote `cleanerpal/coded-pixels` |

- This file lives at `docs/process/development-workflow-rules.md` once scaffolded (ENG-001).
- Amendments: Open PR with `docs(workflow): ...` prefix. Coordinator + at least one lane owner must approve.
- Major version bump (e.g. 2.0) only on structural changes to parallelism model or new mandatory gates.

**Approved for use across all waves:** Dr. Nathan Cole, Dr. Maya Patel, Dr. Lena Moreau (post expert review memo consensus).

---

**Next action for Nathan:** Spool parallel lane agents for current wave → collect handoffs → verify diffs + tests + build → commit + push → update `project-status.md` → **auto-spool next wave**.  
**New chat:** user types **`/codedpixels resume`** — see `docs/process/resume-command.md`.

_This rules file + `.cursor/experts.md` + `.cursor/AGENTS.md` together replace scattered process notes. They operationalize the expert knowledge base for repeatable high-quality delivery._
