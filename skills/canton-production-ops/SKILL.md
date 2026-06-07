---
name: canton-production-ops
description: >-
  Operate a Canton application and its nodes in production. Use whenever a task
  involves Canton error codes and error-handling/retry logic, security hardening
  (JWT auth on the Ledger API, TLS, HSM/KMS key management, network/Admin-API
  exposure), performance/scalability, monitoring/metrics, or backup/DR for a
  participant/validator. Triggers on "handle this Canton error code,"
  "DEADLINE_EXCEEDED / ABORTED / CONTENTION," "should I retry this submission,"
  "secure my Ledger API," "set up monitoring/backups for my participant," or "my
  validator is slow." Corrects the assumption that nodes are stateless and
  resyncable from a public chain. For deploying/promoting use canton-deployment.
---

# Canton Production Operations

Run Canton in production. Unlike a public chain, **participants hold private state
that cannot be re-derived from a global ledger** — so retry logic, key management,
auth, and backup/DR are first-class, and there's no public explorer to lean on.

Targets Daml SDK 3.4.x.

## Error handling & retries (the part apps get wrong)

Errors come back over the Ledger API in four categories — **retry behavior differs
by category**:

| Category | Codes | Retry? |
|----------|-------|--------|
| **Command rejection** (pre-synchronizer) | `INVALID_ARGUMENT`, `NOT_FOUND`, `PERMISSION_DENIED` | **No** — app bug / stale data; fix it |
| **Contention** (same contract) | `FAILED_PRECONDITION`, `ABORTED` | **Yes** — expected; exponential backoff |
| **Timeout** | `DEADLINE_EXCEEDED` | **Yes — but check completion first** |
| **Insufficient traffic** | traffic budget exhausted | **No** — not transient |

> A `DEADLINE_EXCEEDED` does **not** mean the command failed — it may have
> succeeded. **Verify non-completion before resubmitting**, and rely on
> deduplication: a second command with the same `commandId` returns the first's
> result. Generate **deterministic** ids (e.g. `SHA-256(party:action:key)`) so
> retries are idempotent — no client-side state needed.

> **Scope:** `commandId` dedup is **per-participant, per-`actAs` party set** — not
> global. Two different parties submitting the same `commandId` are fully
> independent, so a hash that includes the party is safe.

## Security hardening

- **Ledger API auth = JWT** (`Authorization: Bearer <token>`). Store tokens
  securely (never client-side / env / VCS), refresh before expiry, use separate
  service accounts per component.
- **TLS required** for all Ledger API connections in prod; disable the LocalNet dev
  default.
- **Keys in HSM/KMS** — never on dev machines or CI; rotate and back up (losing key
  material = losing the party identity). Validator signing keys especially:
  unauthorized access = impersonation.
- **Network:** validators in private segments; expose **only the Ledger API port**
  to app servers; firewall the **Admin API** (party management and package upload
  are privileged). Validate authenticated users map to the correct party.
- **Secrets:** Vault / cloud secret managers; rotate without downtime.

## Performance, monitoring, resilience

- **Performance/scalability:** read via PQS (not Ledger-API polling), prune per
  policy, keep UTXO counts low for token-holding parties.
- **Monitoring:** export Canton metrics; watch latency, contention rates, traffic
  budget, and node health — you cannot use a public explorer.
- **Backup/DR:** participants hold non-recreatable private state — back up node
  state and key material; rehearse restore. Multi-hosting a party across validators
  adds resilience.

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Canton-correct |
|--------------------|-------------------|
| "Nodes are stateless; just resync from the chain" | Private state can't be re-derived — back it up + DR |
| Blindly retry every failed submission | Retry only contention/timeout; never `INVALID_ARGUMENT`/`PERMISSION_DENIED` |
| Resubmit a timed-out command with a new id | Same `commandId` + verify completion (dedup) |
| Plaintext Ledger API, keys on disk | TLS + JWT + HSM/KMS |
| Expose the Admin API broadly | Admin API firewalled; only Ledger API port to app servers |
| Monitor via a public explorer | Export Canton metrics; privacy-scoped observability |

## Examples

[`examples/error-handling.md`](examples/error-handling.md) — a retry decision
table + idempotent-submission sketch.

## References

- KB: [`production-ops-notes.md`](../../knowledge-base/production-ops-notes.md)
- Docs: [error handling](https://docs.canton.network/appdev/modules/m7-error-handling),
  [security](https://docs.canton.network/appdev/modules/m7-security),
  [performance](https://docs.canton.network/appdev/modules/m7-performance),
  [package management](https://docs.canton.network/appdev/modules/m7-package-management),
  [compliance](https://docs.canton.network/appdev/modules/m7-compliance);
  node-operations (monitoring, DR/backup, KMS, pruning).

---

> **Stage: draft.** Verified against M7 error-handling + security (SDK 3.4.x).
> Before `stable`: cross-check the full error-code reference and add evals.
