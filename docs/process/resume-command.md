# Resume Command — Pick Up Where You Left Off

Type this in **any new Cursor chat** to continue the build:

```
/codedpixels resume
```

Alternative (same behaviour):

```
CODEDPIXELS RESUME
```

---

## What happens

The agent becomes **Dr. Nathan Cole** and runs the **Resume Protocol**:

1. **Read checkpoint** — `docs/planning/project-status.md`
2. **Read backlog** — `docs/planning/implementation-tickets.md`
3. **Verify reality** — git log, git status, deliverables in `ticket-deliverables.md`
4. **Reconcile** — completed tickets must have code on disk; SHA must match (or explain drift)
5. **Run tests** — if app exists, `npm test` must pass before advancing past verified work
6. **Continue** — spool **parallel** agents for the **next unblocked tickets** in the current wave

If the previous wave was **pushed** and status is current → **auto-spool** the next wave without asking (see `07-wave-auto-advance.mdc`).

If verification fails → fix or redo the failing ticket; **do not skip ahead**.

---

## What you should see in the response

1. **Status summary** — current wave, last commit, completed vs pending tickets
2. **Verification results** — which deliverables checked OK / which failed
3. **Continue** — parallel spool list (ticket IDs + lanes), wave-close + push + auto-advance, or fix if verification failed

---

## Keeping resume accurate

Only **Nathan** updates `project-status.md` — **after** a wave passes full verification and is **committed + pushed**.

Lane agents never mark tickets complete in that file.

---

## Related

| File | Role |
|------|------|
| `.cursor/AGENTS.md` | Agent entry point |
| `project-status.md` | Checkpoint (wave, SHA, done/next) |
| `ticket-deliverables.md` | Files to verify per ticket |
| `implementation-tickets.md` | Full ticket specs |
| `.cursor/rules/07-wave-auto-advance.mdc` | Auto-spool next wave after push |
