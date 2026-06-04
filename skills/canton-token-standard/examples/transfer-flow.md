# Token Standard transfer flow (CIP-0056, two-step FOP)

Annotated reference for a free-of-payment transfer. Verify exact interface/choice
names against the current Splice release before relying on it. Targets SDK 3.4.x.

## Actors

- **Sender** (holds one or more `Holding` UTXOs of the instrument)
- **Receiver**
- **Registry** (the token issuer's registry app; provides factories + context)

## Step 0 — discover the factory and context

Call the registry's API to obtain the **transfer factory** contract plus the
`disclosedContracts` and `choiceContextData` you must pass through on the exercise.

```
GET  <registry>/registry/transfer-instruction/v1/transfer-factory   (illustrative)
=> { factoryId, disclosedContracts[], choiceContext{...} }
```

## Step 1 — sender creates the TransferInstruction (factory step)

Exercise `TransferFactory_Transfer` on the factory via the JSON Ledger API. Select
small-amount `Holding` UTXOs as inputs to keep UTXO count low.

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "INTERFACE_ID:Splice.Api.Token.TransferInstructionV1:TransferFactory",
      "contractId": "FACTORY_CID",
      "choice": "TransferFactory_Transfer",
      "choiceArgument": {
        "expectedAdmin": "REGISTRY_ADMIN_PARTY",
        "transfer": {
          "sender": "SENDER_PARTY",
          "receiver": "RECEIVER_PARTY",
          "amount": "10.0",
          "instrumentId": { "admin": "REGISTRY_ADMIN_PARTY", "id": "INSTRUMENT" },
          "inputHoldingCids": ["HOLDING_CID_1"]
        },
        "extraArgs": { "context": "CHOICE_CONTEXT_DATA", "meta": { "values": {} } }
      }
    }
  }],
  "commandId": "transfer-1700000000",
  "actAs": ["SENDER_PARTY"],
  "disclosedContracts": ["...from registry choiceContext..."]
}
```

Result: a `TransferInstruction` contract observable by the receiver.

## Step 2 — receiver accepts

```json
{
  "commands": [{
    "ExerciseCommand": {
      "templateId": "INTERFACE_ID:Splice.Api.Token.TransferInstructionV1:TransferInstruction",
      "contractId": "TRANSFER_INSTRUCTION_CID",
      "choice": "TransferInstruction_Accept",
      "choiceArgument": { "extraArgs": { "context": "CHOICE_CONTEXT_DATA", "meta": { "values": {} } } }
    }
  }],
  "commandId": "accept-1700000001",
  "actAs": ["RECEIVER_PARTY"],
  "disclosedContracts": ["...from registry choiceContext..."]
}
```

Result: the receiver now holds new `Holding` UTXO(s); the sender's inputs are
consumed.

## Notes

- **External parties** use the Ledger API **prepare → execute** flow instead of
  `submit-and-wait` (sign the prepared hash off-participant).
- **DVP** (delivery-versus-payment) uses the **Allocation** interfaces instead, so
  two legs settle atomically.
- Set up **`MergeDelegation`** at onboarding so the registry can merge a user's
  UTXOs and keep the count low.
