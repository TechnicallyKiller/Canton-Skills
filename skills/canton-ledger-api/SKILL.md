---
name: canton-ledger-api
description: >-
  Interact with a Canton participant from application code via the Ledger API —
  gRPC or the JSON Ledger API (/v2). Use whenever a task involves submitting
  create/exercise commands, streaming or querying transactions/events/active
  contracts, command deduplication, explicit contract disclosure, external signing
  / interactive submission (prepare-execute), party & user management, or
  generating/using Java/TS codegen bindings. Triggers on "call the ledger from my
  backend," "submit a create/exercise over HTTP/JSON," "read contracts from
  Canton," or specific /v2/... endpoints. For SQL/state read models use
  canton-app-architecture (PQS); for Daml itself use daml-language. Remember reads
  are privacy-scoped per acting party — there is no global query.
---

# Canton Ledger API

Connect off-ledger apps to a participant. Two surfaces: **gRPC** (streaming,
full-featured) and the **JSON Ledger API** under `/v2` (HTTP-friendly). All reads
are **scoped to the `actAs`/`readAs` parties** — there is no global query; never
design a backend that "indexes the chain."

Targets Daml SDK 3.4.x. Full spec at `GET /docs/openapi`.

## JSON Ledger API (`/v2`) — the endpoints you need

| Purpose | Method + path |
|---------|---------------|
| Health | `GET /v2/livez`, `GET /v2/readyz` |
| Ledger position | `GET /v2/state/ledger-end` |
| Allocate party | `POST /v2/parties` |
| Submit a command | `POST /v2/commands/submit-and-wait` |
| Read active contracts | `POST /v2/state/active-contracts` |
| Updates/transactions | `POST /v2/updates/...` |

### Create a contract

`POST /v2/commands/submit-and-wait`:

```json
{
  "commands": [{
    "CreateCommand": {
      "templateId": "PACKAGE_ID:Module:Template",
      "createArguments": { "owner": "ALICE_PARTY", "amount": 100.0 }
    }
  }],
  "commandId": "req-1700000000",
  "actAs": ["ALICE_PARTY"],
  "readAs": [],
  "deduplicationPeriod": { "Empty": {} },
  "disclosedContracts": []
}
```

Response: `{ "updateId": "...", "completionOffset": 20 }` — keep
`completionOffset` to drive subsequent reads.

### Exercise a choice

Same endpoint, `ExerciseCommand` (use `templateId`, or an interface id for
interface choices):

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "PACKAGE_ID:Module:Template",
      "contractId": "CONTRACT_ID",
      "choice": "Transfer",
      "choiceArgument": { "newOwner": "BOB_PARTY" }
    }
  }],
  "commandId": "exercise-1700000001",
  "actAs": ["ALICE_PARTY"]
}
```

## Command metadata that trips people up

- **`commandId`** drives **deduplication** — reuse the same id (within the
  `deduplicationPeriod`) to make retries idempotent. Do *not* just resubmit with a
  new id on timeout; you risk double-execution.
- **`actAs` / `readAs`** — who you submit as and whose data you may read. Reads are
  scoped to these; query as the wrong party and you see nothing.
- **`disclosedContracts`** — explicit (contract) disclosure: pass a contract a
  non-stakeholder needs for a single submission (used heavily by the Token
  Standard).
- **External signing / interactive submission** — for parties whose keys live off
  the participant: **prepare** (returns a hash) → sign externally → **execute**.

## Reading

- **gRPC**: active contract service + transaction/update streams (flat vs tree),
  event queries — low-latency streaming.
- **JSON**: `POST /v2/state/active-contracts` for a snapshot at an offset.
- For rich **SQL state queries / history**, don't poll the Ledger API — project
  into **PQS** (see [`canton-app-architecture`](../canton-app-architecture)).

## Codegen

Generate typed bindings from the DAR (Java / TypeScript) rather than hand-building
JSON: template & interface companions, JSON encode/decode. Keep codegen pinned to
the same SDK that built the DAR.

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Canton-correct |
|--------------------|-------------------|
| Query global state by address/scanning the chain | Stream/snapshot the ACS for your `actAs`/`readAs` only |
| Resubmit with a fresh id after a timeout | Reuse `commandId` within `deduplicationPeriod` |
| Assume one key signs everything | Parties, users, and (external) signing keys are distinct |
| Build a read model by replaying every transaction in the backend | Project to PQS; use the Ledger API for low-latency events |
| Hand-write fragile JSON forever | Use codegen bindings pinned to the DAR's SDK |

## Examples

JSON request samples in [`examples/`](examples): `create-contract.json`,
`exercise-choice.json`.

## References

- KB: [`ledger-api-notes.md`](../../knowledge-base/ledger-api-notes.md)
- Docs: [JSON API tutorial](https://docs.canton.network/appdev/modules/m4-json-api-tutorial),
  [QuickStart json-api](https://docs.canton.network/appdev/quickstart/json-api),
  [SDKs & APIs](https://docs.canton.network/appdev/modules/m4-sdks-apis),
  gRPC Ledger API reference; deep dives (command dedup, contract disclosure,
  external signing).

---

> **Stage: draft.** JSON shapes verified against the QuickStart (SDK 3.4.x). Before
> `stable`: validate bodies against a live `/docs/openapi`, add trigger + behavior
> evals.
