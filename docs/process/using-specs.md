# Using Spec Files — How & Why

**Author:** Dr. Lena Moreau · **Plain summary:** Mia Thompson  
**When:** Before every ticket, in every new agent chat

---

## Why bother at this stage?

You have no application code yet — only documentation. That is intentional. The specs **are** the product definition until code exists.

| Without specs | With specs |
|---------------|------------|
| Agents invent pricing, copy, or security | Everyone implements the same Q## decisions |
| Parallel work overwrites or drifts | Lanes share contracts (ENG-004, ENG-006) defined in specs |
| "Done" means different things | Acceptance criteria in tickets match project-plan |

**At this point, specs are how you build** — code is the encoding of the spec, not the source of truth.

---

## Which spec when?

| You're doing… | Read first |
|---------------|------------|
| Picking work | `docs/planning/implementation-tickets.md` |
| Any feature | `docs/specs/codedpixels-project-plan.md` (grep Q## or keyword) |
| Pricing / URL state | Ticket scope + project-plan Q1, Q6, Q13, Q40, Q54 |
| UI / copy / brand | `docs/brand/brand-guide.md` + project-plan §8–10 |
| Firebase / signups | `docs/specs/firestore-schema.md` + `firestore-rules-spec.md` |
| Understanding "why we decided X" | `docs/planning/expert-review-memo.md` |
| Phase 2 builder prep | `docs/specs/builder-ui-spec.md` |
| Non-technical overview | `docs/overview/what-we-are-building.md` |

---

## How to use them (5-minute habit)

1. **Ticket** — Read scope + acceptance criteria + blocked-by.
2. **Decision** — Find the Q## or section that authorizes the behaviour.
3. **Expert** — Match domain to `.cursor/experts.md`; note name for handoff.
4. **Implement** — Code/docs must match spec literally (field names, pence, copy).
5. **Verify** — Diff on disk matches what spec required (see workflow rules §3.6).

---

## When to change a spec

- Implementation discovers a gap → stop, escalate to Nathan, amend spec **then** code.
- Never ship behaviour that isn't traceable to a spec line or new Q##.

See also: `development-workflow-rules.md` §2, §5, and `.cursor/rules/05-using-specs.mdc`.
