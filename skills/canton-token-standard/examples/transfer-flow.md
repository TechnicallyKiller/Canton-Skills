# Token Standard transfer flow (CIP-0056, two-step FOP)

Annotated reference for a free-of-payment transfer, using the **real Splice Token
Standard interface IDs** (verified against docs.sync.global / the
[splice `token-standard/`](https://github.com/hyperledger-labs/splice/tree/main/token-standard)
source, 2026-06). Targets Daml SDK 3.4.x / Splice. Choice-context payloads are
registry-specific — always fetch them from the registry rather than hand-building.

## Packages & interfaces

| Package | Interface |
|---------|-----------|
| `splice-api-token-holding-v1` | `Splice.Api.Token.HoldingV1:Holding` (UTXO holdings) |
| `splice-api-token-transfer-instruction-v1` | `...TransferInstructionV1:TransferFactory`, `:TransferInstruction` |
| `splice-api-token-allocation-v1` | `...AllocationV1` (DVP) |
| `splice-api-token-metadata-v1` | `...MetadataV1` |

## Actors

- **Sender** (holds `Holding` UTXOs of the instrument)
- **Receiver**
- **Registry** (the instrument admin's registry app; provides factories + context)

## Step 0 — discover the factory + choice context from the registry

The registry returns the `TransferFactory` contract id, the `disclosedContracts`
you must pass through, and the `choiceContextData` (passed as `context`). The
admin-party-id → registry-URL mapping is currently maintained by the wallet.

```
=> { factoryId, disclosedContracts[], choiceContextData }
```

## Step 1 — sender exercises TransferFactory_Transfer (factory step)

Interface id `#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferFactory`,
choice `TransferFactory_Transfer` (returns a `TransferInstructionResult`). Select
small `Holding` UTXOs as `inputHoldingCids` to keep UTXO count low.

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferFactory",
      "contractId": "FACTORY_CID",
      "choice": "TransferFactory_Transfer",
      "choiceArgument": {
        "expectedAdmin": "REGISTRY_ADMIN_PARTY",
        "transfer": {
          "sender": "SENDER_PARTY",
          "receiver": "RECEIVER_PARTY",
          "amount": "10.0",
          "instrumentId": { "admin": "REGISTRY_ADMIN_PARTY", "id": "INSTRUMENT" },
          "requestedAt": "2026-06-05T00:00:00Z",
          "executeBefore": "2026-06-06T00:00:00Z",
          "inputHoldingCids": ["HOLDING_CID_1"],
          "meta": { "values": {} }
        },
        "extraArgs": {
          "context": "CHOICE_CONTEXT_DATA_FROM_REGISTRY",
          "meta": { "values": {} }
        }
      }
    }
  }],
  "commandId": "transfer-1700000000",
  "actAs": ["SENDER_PARTY"],
  "disclosedContracts": ["...from registry..."]
}
```

`Transfer` fields (verified): `sender`, `receiver`, `amount`, `instrumentId`
(`{admin, id}`), `requestedAt` (must be in the **past**), `executeBefore` (must be
in the **future** — the registry rejects an expired transfer, so the sender can
retry), `inputHoldingCids` (`[ContractId Holding]`), `meta`.

## Step 2 — receiver accepts (or rejects / sender withdraws)

`TransferInstruction` choices: **`TransferInstruction_Accept`** (receiver, when in
`TransferPendingReceiverAcceptance`), **`TransferInstruction_Reject`** (receiver),
**`TransferInstruction_Withdraw`** (sender), `TransferInstruction_Update`
(registry).

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferInstruction",
      "contractId": "TRANSFER_INSTRUCTION_CID",
      "choice": "TransferInstruction_Accept",
      "choiceArgument": {
        "extraArgs": { "context": "CHOICE_CONTEXT_DATA_FROM_REGISTRY", "meta": { "values": {} } }
      }
    }
  }],
  "commandId": "accept-1700000001",
  "actAs": ["RECEIVER_PARTY"],
  "disclosedContracts": ["...from registry..."]
}
```

Result: the receiver holds new `Holding` UTXO(s); the sender's inputs are consumed.

## Notes

- **External parties** use the Ledger API **prepare → execute** flow instead of
  `submit-and-wait` (sign the prepared hash off-participant).
- **DVP** (delivery-versus-payment) uses the **`AllocationV1`** interfaces so two
  legs settle atomically — not the transfer-instruction flow above.
- Set up **`MergeDelegation`** at onboarding so the registry can merge a user's
  UTXOs and keep the count low.
