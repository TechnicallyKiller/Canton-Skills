# App Architecture Notes

> Sources:
> - M4 building applications (architecture, backend/frontend, SDKs/APIs,
>   observability, PQS)
> - AppDev QuickStart + <https://github.com/digital-asset/cn-quickstart>
> - Deep dives: app architecture design, multi-party composition, observability
>
> Feeds `canton-app-architecture`. **Drafted — verified against M4 app-architecture
> + query-with-pqs (2026-06, SDK 3.4.x).**

## Verified: the reference architecture (M4)

Five/six layers:

1. **Daml model** — shared business logic, compiled to a **DAR**.
2. **Validator (participant node)** — hosts parties, processes commands, syncs via
   the synchronizer.
3. **Ledger API (gRPC)** — command submission + transaction streaming.
4. **Backend** (Java or TypeScript) — connects to the Ledger API; handles auth and
   business logic.
5. **Frontend** (e.g. React) — talks to the **backend over HTTP/REST**, not the
   ledger directly.
6. **PQS** — a **PostgreSQL projection** for read-heavy/historical queries.

> **Key recommendation (verbatim):** *"Pick the fully mediated approach unless you
> have a specific reason to expose ledger concepts to the frontend."* Keep ledger
> concerns out of the browser; centralize auth/access-control in the backend.

## Verified: PQS (Participant Query Store)

Event-sourced, Postgres-backed; query contracts/transactions with **SQL**. *"PQS is
designed to be used best as a complementary source to the Ledger API's transaction
stream to query ledger states at particular offsets, rather than provide event
streams."* For low-latency event streaming, use the Ledger API; for state/history
queries, use PQS.

```sql
-- ACS via the active() table function, filtered by template + JSONB payload:
select * from active('register:DA.Register:IssuerApproval')
where payload->'issue'->>'issuer' = 'foo';
```

Backend tips: avoid `SELECT *`; index frequently-filtered JSONB expressions;
keyset (not OFFSET) pagination; design Daml models read-friendly.

## Key concepts (to fill / expand)

- Reference topology: Daml model (DARs) → participant node → Ledger API → backend
  → frontend; PQS as the read model.
- **PQS (Participant Query Store)**: project ledger state into a queryable store
  for backends instead of scanning the ledger.
- Backend responsibilities: command submission, automation/triggers, read APIs.
- Frontend + wallet/SDK integration boundary.
- Observability: open tracing, metrics, structured logs.
- QuickStart project structure as the canonical scaffold.

## Mental-model traps (EVM-brain → Canton-correct)

- "Backend reads the chain directly like an indexer over global state" → read via
  PQS / per-party streams; there's no global index.
- "One service holds all parties' data" → data is partitioned by party/privacy.
- "Poll for state" → subscribe to update streams.

## Canonical patterns / snippets (TODO)

- Minimal app topology diagram (text).
- PQS read pattern.
- QuickStart structure walkthrough.

## Open questions / to verify

- Current QuickStart layout and recommended stack components.
