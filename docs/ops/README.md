# Operations runbooks

Production and FinOps procedures for CodedPixels Firebase infrastructure.

| Document | Ticket | Purpose |
|----------|--------|---------|
| [`pl-001-infrastructure-verification.md`](pl-001-infrastructure-verification.md) | PL-001 | §2.1 deploy scripts, DNS checks, go-live gate |
| [`production-seed-runbook.md`](production-seed-runbook.md) | PL-003 | §2.3 template + demo tenant seed, approval gate, verification |
| [`stripe-production-setup.md`](stripe-production-setup.md) | PL-002 | §2.2 Stripe Extension live mode, webhooks, catalogue sync |
| [`observability-production.md`](observability-production.md) | PL-004 | §2.4 Sentry, PII scrubbing, synthetic probes, deploy pause |
| [`production-runbook.md`](production-runbook.md) | PL-005 | Incident response, rollback, contacts *(PL-005 deliverable)* |

**Deploy entrypoint:** `npm run deploy:production` — see PL-001 doc for ordered phases.
