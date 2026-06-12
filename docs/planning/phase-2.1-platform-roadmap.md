# Phase 2.1 Platform Roadmap — Ticket Decomposition

**Document owner:** Dr. Maya Patel · Dr. Nathan Cole  
**Status:** Initial decomposition — 12 June 2026 (Forge & Scale advisory response)  
**Purpose:** Convert long-standing “Deferred Phase 2.1” notes into executable waves with lanes, gates, and deliverables.

---

## 1. Scope

Capabilities referenced across specs but **not yet ticketized** (previously deferral notes only):

| Capability | Primary specs | Expert owners |
|------------|---------------|---------------|
| Custom domain DNS UI + verification | project plan Q37, Q60; site-renderer §2; expert-review Q60 | Marcus Rivera, Sophia Laurent |
| Team invites + role management | firestore-schema §6–7; builder-ui-spec | Fatima Al-Sayed, Rafael Ortiz |
| Version history + rollback UI | project plan Q53; builder-ui-spec §7 | Lena Petrova, Samuel Ruiz |
| In-dashboard plan changes (Stripe Subscription Items) | stripe-catalogue §14; add-on-deliverables; Q46 | Owen Reilly, Marcus Klein |
| Ecommerce checkout on published customer sites | add-on-deliverables; project plan Q42 | Owen Reilly, Michael Chen |
| Advanced leads (Kanban, assignment, search) | add-on-deliverables; builder-ui-spec | Samuel Ruiz, Sophia Laurent |

**Out of this roadmap:** Wave 19–20 marketing template previews and starter library (already ticketized).

---

## 2. Sequencing decision

**Recommendation:** **Serial wave series after Wave 20**, not a parallel untracked backlog.

| Track | Waves | Rationale |
|-------|-------|-----------|
| **Marketing visibility** | 19–20 | Near-complete planning; unblocks conversion |
| **Production cutover** | **21** | First real customer requires live deploy + Stripe + monitoring |
| **Platform Phase 2.1** | **22–27** | Depends on production Firestore + live Stripe for several items |

Production launch (Wave 21) **blocks** first paid customer provisioning but **does not block** Wave 19–20 code in emulator/local.

---

## 3. Proposed waves (high-level tickets)

### Wave 21 — Production launch prerequisites

**Spec:** [`production-launch-prerequisites.md`](production-launch-prerequisites.md)  
**Gate:** Wave 20 complete (or Wave 19 if Wave 20 deferred).

| Ticket | Title | Lane |
|--------|-------|------|
| **PL-001** | Firebase production project verification + App Hosting deploy (3 backends) | INF |
| **PL-002** | Stripe Extension install + live mode webhook + catalogue sync | INF |
| **PL-003** | Production seed jobs (`seed:templates`, `seed:template-demos`) + approval gate | INF |
| **PL-004** | Sentry/monitoring + synthetic probes + finops checklist automation | INF |
| **PL-005** | Production runbook + cutover checklist sign-off | DOC |

---

### Wave 22 — Custom domains

**Gate:** Wave 21 (live site-renderer + Hosting API access).

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-001** | Custom domain Firestore schema + Callable verify DNS | Functions |
| **P21-002** | Builder Settings → Domains UI (add, verify, primary) | Builder |
| **P21-003** | Site-renderer hostname resolution for custom domains | Site-renderer |
| **QA-008** | E2E: subdomain + custom domain smoke | QA |

**Aligned with Dr. Sophia Laurent on Q60** — onboarding Step 3 remains subdomain-only; full domain UI here.

---

### Wave 23 — Team invites + RBAC UI

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-004** | Callable inviteMember / acceptInvite / revokeMember | Functions |
| **P21-005** | Builder dashboard Team settings + role picker | Builder |
| **QA-009** | Rules tests + E2E invite flow | QA |

---

### Wave 24 — Version history + rollback UI

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-006** | Callable listVersions + rollbackToVersion (server-side publish) | Functions |
| **P21-007** | Builder version history panel + rollback confirm UX | Builder |
| **QA-010** | E2E publish → edit → rollback | QA |

**Aligned with project plan Q53.**

---

### Wave 25 — Dashboard plan changes (Stripe sync)

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-008** | Callable updateSubscriptionFeatures (Subscription Items API) | Functions |
| **P21-009** | Builder billing settings — add/remove add-ons | Builder |
| **DOC-012** | Stripe catalogue ↔ dashboard sync spec amendment | DOC |

**Aligned with stripe-catalogue §14, Q46.**

---

### Wave 26 — Client-site ecommerce checkout

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-010** | Product checkout Callable + Stripe Checkout on tenant site | Functions |
| **P21-011** | Site-renderer cart + checkout UI (registry components) | Site-renderer |
| **P21-012** | Builder products → live sync + inventory fields | Builder |

**Gate:** Wave 25 (subscription billing stable). **Aligned with Q42.**

---

### Wave 27 — Advanced leads

| Ticket | Title | Lane |
|--------|-------|------|
| **P21-013** | Leads Kanban board + status drag (Firestore) | Builder |
| **P21-014** | Lead assignment + member filter | Builder |
| **P21-015** | Leads search (Firestore indexes; Algolia deferred) | Builder |

---

## 4. Ownership

| Role | Owner |
|------|-------|
| Initial decomposition | Dr. Maya Patel |
| Wave sequencing + gates | Dr. Nathan Cole |
| Spec detail per domain | Lane experts per §1 table |
| Ticket acceptance criteria | Same rigor as B0–B9 waves — added to `implementation-tickets.md` before each wave spool |

**Next step:** Expand Waves 21–27 into full ticket blocks in `implementation-tickets.md` when Wave 19 code closes (not blocking Wave 19).

---

## 5. Expert sign-off

| Expert | Verdict |
|--------|---------|
| Dr. Nathan Cole | ☑ Roadmap approved for planning |
| Dr. Maya Patel | ☑ Decomposition owner |
| Dr. Samuel Ruiz | ☑ Product priority order |
| Dr. Michael Chen | ☑ Platform sequencing |
| Dr. Owen Reilly | ☑ Stripe waves gated correctly |
