# What We’re Building — In Plain English

**Written by:** Mia Thompson (Friendly Explainer)  
**For:** Anyone who wants the full picture without reading 3,000 lines of specs  
**Last updated:** 12 June 2026  
**Status:** Planning is done. Build is ready to start.

---

## The one-sentence version

**CodedPixels** is a UK website builder sold like a phone plan: pick a look, tick the extras you want, see the price update live, then sign up — starting at **£9.99 a month**.

---

## What the product actually is

Imagine walking into a shop where you don’t buy a finished website off the shelf. You stand at a counter, choose a design, add options (“I want online booking”, “I want a shop”, “I want email reminders”), and a screen shows your monthly bill changing as you go. When you’re happy, you tap **Get Started**.

That counter is the **configurator**. It’s the heart of the marketing site — not a small widget in the corner, the main experience.

Later (not in the first release), customers get a real **builder** to edit their site and a **dashboard** to manage it. The first release is deliberately smaller: a polished marketing site that proves the idea, captures interest, and handles sign-ups safely.

---

## What visitors will be able to do (first release)

| What they do | What it means |
|--------------|---------------|
| Land on the homepage | See a clear headline, package cards, and the configurator |
| Pick a template | Choose from 10 ready-made looks, or “custom design” |
| Toggle add-ons | Turn features on/off — each shows its own monthly price |
| See live pricing | Total updates instantly; annual option shows yearly savings |
| Preview their choices | A mock preview of how the site might look |
| Share their setup | Copy a link that reopens the same choices |
| Browse templates & pricing | Dedicated pages with galleries and comparison tables |
| Get started | Enter email only (no password yet), see order summary, get a friendly “we’ll be in touch” message |

**What they won’t get yet:** A real login, a working website editor, live payments, or a customer dashboard. Checkout is **simulated** — clearly labelled so nobody thinks they’ve been charged.

---

## How pricing works (simply)

- Everything is built from a **base plan** (£9.99/month) plus optional add-ons.
- **Starter**, **Growth**, and **Pro** are shortcuts — they pre-fill common bundles, but users can still turn individual add-ons off.
- The price on a package card (e.g. “Growth £24.99”) is marketing rounding. The **live total** on screen is the real number the system uses (e.g. Growth actually adds up to **£24.96/month** in the engine).
- **Custom template** can be a monthly add-on or a one-off setup fee (£149) — the one-off is separate from the monthly bill.
- **Annual billing** saves 17% — the maths is done in whole pence so pennies never drift.

---

## When things happen — the build timeline

Work is split into **milestones M0–M4**, roughly **10 working days** if several people (or AI agents) work in parallel. Think of it as waves on a production line, not one person doing everything in order.

| When | Milestone | What gets done |
|------|-----------|----------------|
| **Day 1** | **M0 — Foundation** | Project setup, colours/fonts, header & footer, pricing maths + tests |
| **Days 2–3** | **M1 — Configurator core** | Template picker, feature toggles, live price panel, package buttons, shareable links |
| **Day 4** | **M2 — Preview & polish** | Live preview, monthly/annual toggle, mobile layout, accessibility basics |
| **Days 5–7** | **M3 — Pages & sign-up** | Template gallery, pricing page, FAQ, email sign-up, privacy/terms, backend for storing sign-ups safely |
| **Days 8–10** | **M4 — Quality** | Automated browser tests, speed checks, SEO, analytics (only after cookie consent), final sign-off |

**Legal & cookies** can be drafted **from day one** by someone who isn’t writing code — they only block live sign-up forms until they’re finished (around M3).

**After M4 ships:** Platform **Phase 2** — the real builder, customer accounts, Stripe payments, published websites on `*.codedpixels.co.uk`. That’s a separate, larger chapter documented in outline form already.

---

## What all the technical documents are for

You don’t need to read all of these. Here’s what each one is **for**, in human terms:

| Document | Think of it as… |
|----------|-----------------|
| **`docs/specs/codedpixels-project-plan.md`** | The master recipe — product vision, pages, pricing rules, 60+ numbered decisions (Q1–Q64), and what’s in/out of scope |
| **`docs/planning/implementation-tickets.md`** | The job list — who builds what, in what order, and what can run at the same time without stepping on each other |
| **`.cursor/AGENTS.md`** | Agent entry point — roles, resume command, rules index |
| **`docs/process/development-workflow-rules.md`** | The team rulebook — how contributors (human or AI) pick a ticket, stay in their lane, pass gates, and open a pull request |
| **`.cursor/experts.md`** | The roster of specialists — who “owns” pricing, security, accessibility, legal, etc. |
| **`docs/planning/expert-review-memo.md`** | The sign-off note — experts read the specs, fixed contradictions, and said “go build” |
| **`docs/specs/firestore-schema.md`** | The database blueprint |
| **`docs/specs/firestore-rules-spec.md`** | The security locks |
| **`docs/specs/builder-ui-spec.md`** | A sketch of the future editor (Phase 2) |
| **`docs/brand/brand-guide.md`** | Colours, logo, voice, and copy |
| **`docs/README.md`** | Index of all documentation folders |

**Still to write before certain gates:** see `docs/README.md` → Future docs (cookie/legal, Stripe catalogue, etc.)

---

## How parallel work stays safe

Lots of people (or agents) can work at once because the plan uses **lanes** — like assigned desks:

- **Lane A** — Look & feel (header, footer, colours)
- **Lane B** — Shared maths & link encoding (pricing + “copy my config” URLs)
- **Lane C** — Configurator screens
- **Lane D** — Extra pages (templates, pricing, get started)
- **Lane E** — Firebase / server backend
- **Lane F** — Legal docs & privacy pages

**Gates** are deliberate stop signs:

- No configurator UI until **shareable link encoding** is tested solidly.
- No live email forms until **Privacy Policy, Terms, and error monitoring** are live.
- No monorepo / builder split until **Phase 2** prep docs are frozen.

**QA-006** is the “full journey” test — one automated walkthrough from picking options → link → sign-up → server record. It catches mistakes when separate lanes forgot to talk to each other.

---

## Decisions that matter for trust (UK-first)

- **GDPR:** Consent before analytics; privacy policy before collecting email.
- **Accessibility:** Keyboard-friendly configurator, screen-reader-friendly price updates.
- **Honesty:** Simulated checkout banner; testimonials labelled as examples until real ones exist.
- **Security:** Sensitive data (sign-ups, waitlists) written only through checked server functions — not open database writes from the public site.

---

## What “Phase 2” means (later)

Phase 2 is the **real product**: log in, drag-and-drop builder, publish a live site, take payments via Stripe, manage leads, upload images (with virus scanning), multi-tenant hosting. The marketing site you’re building first is the shop window; Phase 2 is the workshop behind it.

---

## Where we are right now

| Done | Not done yet |
|------|--------------|
| Product vision & user journey agreed | Writing the actual website code |
| 60+ decisions logged and reviewed | Cookie/legal copy spec (can start anytime) |
| Database & security rules designed | Deploying to production |
| Build tickets decomposed for parallel work | Phase 2 builder (after M4) |
| Expert panel sign-off | |

**Bottom line:** The thinking is finished. The team has a green light to build the marketing site in parallel, safely, over roughly two weeks. The configurator and honest pricing are the product; everything else in M0–M4 exists to support that story and capture sign-ups the right way.

---

## Questions?

For **what** we’re building and **why**, start with this doc or the executive summary in `docs/specs/codedpixels-project-plan.md`.

For **how** and **when**, see `docs/planning/implementation-tickets.md`.

For **rules while coding**, see `docs/process/development-workflow-rules.md`.

If something still feels opaque, that’s what I’m here for — ask for another plain-English pass on any section.

— **Mia Thompson**
