---
name: canton-app-architecture
description: >-
  Design the end-to-end architecture of an application on the Canton Network. Use
  whenever the task involves how to STRUCTURE a Canton/Daml app: the layering of
  Daml model, participant/validator, backend (Java/TS), frontend, automation, and
  the PQS (Participant Query Store) read model — or choosing where auth and access
  control live, or how the backend should read ledger state with SQL. Triggers on
  "how should I structure my Canton app," "set up the backend for my Daml model,"
  "how do I read ledger state in my service," "PQS query is slow," or questions
  about the cn-quickstart layout. For the wire calls themselves use
  canton-ledger-api; for the Daml model use daml-language.
---

# Canton App Architecture

Lay out a Canton app so privacy and access control are enforced where they belong.
The recurring mistake is treating the backend like an EVM indexer over global
state — on Canton you read via **PQS** and per-party streams because state is
partitioned by party and privacy.

Targets Daml SDK 3.4.x. Canonical scaffold:
[cn-quickstart](https://github.com/digital-asset/cn-quickstart).

## Reference architecture (M4)

```
 Frontend (React)
     │  HTTP / REST  (no ledger concepts in the browser)
     ▼
 Backend (Java or TypeScript)  ── auth, business logic, command submission
     │  Ledger API (gRPC)            │  SQL
     ▼                               ▼
 Validator / participant node    PQS (PostgreSQL projection)
     │  synchronizer protocol
     ▼
 Daml model (DAR)  ── shared business logic
```

1. **Daml model** — shared logic, compiled to a **DAR**.
2. **Validator (participant node)** — hosts parties, processes commands, syncs.
3. **Ledger API (gRPC)** — command submission + transaction streaming.
4. **Backend** — connects to the Ledger API; owns auth and business logic.
5. **Frontend** — talks to the **backend over HTTP/REST**, not the ledger.
6. **PQS** — PostgreSQL projection for read-heavy / historical queries.

## The key recommendation: fully mediated

> *"Pick the fully mediated approach unless you have a specific reason to expose
> ledger concepts to the frontend."*

Keep ledger concerns out of the browser; centralize authentication and
access-control in the backend. The frontend should not hold party credentials or
talk to the Ledger API directly in the default design.

## Reads: use PQS, don't replay the chain

**PQS (Participant Query Store)** is an event-sourced, Postgres-backed store you
query with **SQL**. Use it for **state and history**; use the Ledger API's
transaction stream for **low-latency events**. They are complementary.

```sql
-- Active Contract Set via the active() table function, filtered on JSONB payload.
select contract_id, payload
from active('PACKAGE:MinimalTemplate:Account')
where payload->>'owner' = 'ALICE_PARTY';
```

Backend query hygiene: avoid `SELECT *` (project only needed columns), index
frequently-filtered JSONB expressions, use **keyset** pagination (not `OFFSET`),
and design Daml models with read-friendly shapes.

## Backend language choice

Java or TypeScript both have first-class codegen + Ledger API support. Pick by team
fit; generate typed bindings from the DAR rather than hand-rolling JSON (see
[`canton-ledger-api`](../canton-ledger-api)).

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Canton-correct |
|--------------------|-------------------|
| Frontend talks straight to the ledger | Fully mediated: frontend → backend → Ledger API |
| Backend indexes the chain like a global DB | Project to PQS; stream events from the Ledger API |
| One service holds every party's data globally | Data partitioned by party/privacy |
| Poll the Ledger API for state | PQS for state/history; streams for events |
| `SELECT *` + `OFFSET` pagination on PQS | Narrow projections, JSONB indexes, keyset pagination |

## Anti-pattern hand-offs

For the actual submit/read calls → [`canton-ledger-api`](../canton-ledger-api).
For value movement → [`canton-token-standard`](../canton-token-standard). For the
Daml model → [`daml-language`](../daml-language).

## References

- KB: [`app-architecture-notes.md`](../../knowledge-base/app-architecture-notes.md)
- Docs: [app architecture](https://docs.canton.network/appdev/modules/m4-app-architecture),
  [query with PQS](https://docs.canton.network/appdev/modules/m4-query-with-pqs),
  [backend](https://docs.canton.network/appdev/modules/m4-backend-dev),
  [frontend](https://docs.canton.network/appdev/modules/m4-frontend-dev),
  [project structure](https://docs.canton.network/appdev/quickstart/project-structure).

---

> **Stage: draft.** Verified against M4 architecture + PQS docs (SDK 3.4.x). Before
> `stable`: align the diagram/SQL with the current cn-quickstart, add evals.
