# Production Operations Notes

> Sources:
> - M7 production operations (security, compliance, performance, error handling,
>   Canton Coin preapprovals, package management, upgrades)
> - Node operations: monitoring/metrics, DR/backup-restore, KMS, pruning,
>   security/upgrades, console
>
> Feeds `canton-production-ops`. **Drafted — verified against M7 error-handling +
> security (2026-06, SDK 3.4.x).**

## Verified: error handling (M7)

Four error categories returned over the Ledger API:

| Category | Codes | Retry? |
|----------|-------|--------|
| **Command rejection** (pre-synchronizer) | `INVALID_ARGUMENT`, `NOT_FOUND`, `PERMISSION_DENIED` | **No** — app bug / stale data |
| **Contention** (same contract) | `FAILED_PRECONDITION`, `ABORTED` | **Yes** — exponential backoff |
| **Timeout** | `DEADLINE_EXCEEDED` | **Yes, but** verify non-completion first |
| **Insufficient traffic** | (traffic budget exhausted) | **No** — not transient |

> Critical: *"A timeout does **not** mean the command failed."* It may have
> succeeded. Check completion before retrying.

**Deduplication:** *"If you submit two commands with the same ID, the second is
treated as a duplicate and returns the result of the first."* Generate
**deterministic** command IDs (userId + action + nonce) so retries are safe.

## Verified: security (M7)

- **Ledger API auth = JWT.** `Authorization: Bearer <token>`. Store tokens securely
  (not in client code/env/VCS), refresh before expiry, separate service accounts.
- **TLS required** in production for all Ledger API connections; disable the
  LocalNet dev default.
- **Keys → HSM/KMS.** Never on dev machines or CI. Rotate; back up (identity loss).
  Validator signing keys especially — access enables impersonation.
- **Network:** validators in private segments; expose **only the Ledger API port**
  to app servers; firewall the **Admin API** (party mgmt, package upload are
  privileged). Validate that authenticated users map to the right party.
- **Secrets:** use Vault / cloud secret managers; rotate without downtime.

## Key concepts (to fill / expand)

- Security hardening: keys/KMS, identity, network ingress/egress.
- Compliance considerations.
- Performance optimization & scalability; PQS/pruning.
- **Error handling**: Canton error codes, retries, command dedup interplay.
- Backup/restore and disaster recovery for participants/validators.
- Monitoring: key metrics, observability config.
- Canton Coin preapprovals; package management/archiving in prod.

## Mental-model traps (EVM-brain → Canton-correct)

- "Stateless nodes, just resync from chain" → participants hold private state;
  backup/DR is essential and node-specific.
- "Public explorer for monitoring" → privacy-scoped; use your own metrics/PQS.

## Canonical patterns / snippets (TODO)

- Reading and acting on a Canton error code.
- Backup/restore checklist.

## Open questions / to verify

- Current recommended metrics + KMS drivers.
