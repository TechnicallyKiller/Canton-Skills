# Ledger API Notes

> Sources:
> - M4 (SDKs/APIs, JSON Ledger API)
> - Reference: gRPC Ledger API (command submission/completion, queries, state,
>   user/party management, interactive submission), JSON API, Java bindings, codegen
> - Deep dives: command deduplication, contract disclosure, external signing
>
> Feeds `canton-ledger-api`. **Drafted — verified against M4 JSON API tutorial +
> QuickStart json-api (2026-06, SDK 3.4.x).**

## Verified: JSON Ledger API v2 (the shapes that matter)

Base is versioned under `/v2`. Health: `GET /v2/livez`, `GET /v2/readyz`. Ledger
position: `GET /v2/state/ledger-end`. Parties: `POST /v2/parties`
(`{"partyIdHint":"Alice","identityProviderId":""}`).

**Create** — `POST /v2/commands/submit-and-wait`:

```json
{
  "commands": [{
    "CreateCommand": {
      "templateId": "PACKAGE_ID:Module:Template",
      "createArguments": { "provider": "PARTY_A", "user": "PARTY_B" }
    }
  }],
  "commandId": "req-TIMESTAMP",
  "actAs": ["PARTY_B"],
  "readAs": [],
  "deduplicationPeriod": {"Empty": {}},
  "disclosedContracts": []
}
```

**Exercise** — same endpoint, `ExerciseCommand` with `contractId`, `choice`,
`choiceArgument`; use `templateId` *or* an interface id for interface choices.

Response: `{"updateId":"...","completionOffset":N}` — keep `completionOffset` to
drive subsequent `/v2/state/active-contracts` reads.

**Read** active contracts: `POST /v2/state/active-contracts` (event format +
filters + offset). Reads are **privacy-scoped to actAs/readAs parties**.

Command metadata wrappers: `userId`/`applicationId`, `commandId` (drives
**deduplication**), `actAs`, `readAs`, `disclosedContracts` (explicit disclosure).

Full spec: `GET /docs/openapi`.

## Key concepts (to fill / expand)

- gRPC vs JSON Ledger API: when to use each.
- Command submission: command IDs, submission IDs, **command deduplication**.
- Reading: active contracts service, transaction/update streams (flat vs tree),
  event queries — all privacy-scoped per party.
- Party & user management; identity providers.
- Interactive submission & **external signing** (hash, sign, submit) for parties
  whose keys live off the participant.
- **Contract disclosure** (explicit disclosure) for sharing a contract with a
  non-stakeholder for a single submission.
- Codegen: Java bindings, JSON encoder/decoder, template/interface companions.

## Mental-model traps (EVM-brain → Canton-correct)

- "Query global state by address" → stream/ACS scoped to your parties only.
- "Retry by resubmitting" → use command dedup to stay idempotent.
- "One key signs everything" → parties, users, and signing keys are distinct.

## Canonical patterns / snippets (TODO)

- Submit a command (create / exercise) over JSON API.
- Stream active contracts and updates.
- Explicit disclosure flow.

## Open questions / to verify

- Current JSON API endpoint shapes and version.
