---
name: canton-token-standard
description: >-
  Build with the Canton Network Token Standard (CIP-0056), Canton Coin, and
  Splice/Amulet. Use whenever a task involves tokens, payments, asset transfers,
  holdings/balances, transfer offers, delivery-vs-payment, Canton Coin, or "issue a
  token" / "send value on Canton" / "integrate Canton Coin." This is the skill that
  stops the agent from hand-rolling an ERC-20-style balance mapping — on Canton you
  use the standard's UTXO-style Holding contracts and two-step transfer/allocation
  workflows. Pairs with canton-ledger-api for submitting the exercises and
  canton-wallet-integration for wallet-side flows.
---

# Canton Token Standard

The **Canton Network Token Standard (CIP-0056)** is the public API for tokens,
including Canton Coin. Tokens are **UTXO-style `Holding` contracts** transferred via
structured, structurally-authorized workflows — not a mutable balance map. Amulet
is the reference implementation; Canton Coin is the native utility token on the
Global Synchronizer. Use the standard so wallets and exchanges interoperate.

Targets Daml SDK 3.4.x / Splice (tracks 3.4.11).

## Core interfaces (CIP-0056) — verified package IDs

| Package · Interface | Role |
|---------------------|------|
| `splice-api-token-holding-v1` · `Splice.Api.Token.HoldingV1:Holding` | Portfolio view — active **UTXO** contracts tracking ownership. Keep **~<10 UTXOs/user** on average (validator cost/traffic). |
| `splice-api-token-transfer-instruction-v1` · `…TransferInstructionV1:TransferFactory` / `:TransferInstruction` | Direct peer-to-peer / **free-of-payment (FOP)** transfer, two-step. |
| `splice-api-token-allocation-v1` · `…AllocationV1` (+ `AllocationInstructionV1`) | **Delivery-versus-payment (DVP)** — conditional, synchronized exchange. |
| `splice-api-token-metadata-v1` · `…MetadataV1` | Standardized token metadata. |

Interface ids are package-qualified with `#`, e.g.
`#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding`.

## The two-step transfer (transfer-offer model)

1. **Factory step** — the sender exercises **`TransferFactory_Transfer`** on the
   factory fetched from the token's **registry**, creating a `TransferInstruction`
   (returns `TransferInstructionResult`). The `Transfer` arg fields:
   `sender`, `receiver`, `amount`, `instrumentId {admin, id}`, `requestedAt` (must
   be in the **past**), `executeBefore` (must be in the **future**),
   `inputHoldingCids : [ContractId Holding]`, `meta`.
2. **Acceptance** — the receiver exercises **`TransferInstruction_Accept`**. Other
   `TransferInstruction` choices: **`_Reject`** (receiver), **`_Withdraw`**
   (sender), `_Update` (registry).

Mechanics that an agent must get right:

- **Fetch the factory from the registry**, and obtain the **`disclosedContracts`**
  and **`choiceContextData`** the registry returns.
- Construct an **`ExerciseCommand`** with the **interface id**, the contract id, the
  choice name, and arguments — pass the `disclosedContracts` through.
- Submit via the JSON Ledger API: **submit-and-wait** for local parties, or
  **prepare → execute** for **external parties** (see
  [`canton-ledger-api`](../canton-ledger-api)).

## What you implement vs. reuse

**Must implement**
- A **UTXO management / selection** strategy (wallet providers: prefer
  small-amount selection; keep UTXO count low).
- Ledger API read/write integration for holdings and instructions.
- **Transaction-history parsing** for wallet displays.
- **`MergeDelegation`** setup during user onboarding.

**Can reuse**
- Splice **`splice-util-token-standard-wallet.dar`** for common workflows.
- The **Wallet SDK** (`canton-network/wallet-gateway`) — see
  [`canton-wallet-integration`](../canton-wallet-integration).
- **Registry APIs** for factory discovery and choice-context retrieval.

## Anti-patterns to correct

| ❌ Wrong-by-default (ERC-20 brain) | ✅ Token-Standard-correct |
|-----------------------------------|--------------------------|
| `balances[addr]` mapping mutated on transfer | UTXO-style `Holding` contracts; archive+create |
| `approve` + `transferFrom` | Two-step transfer instruction (offer → accept) |
| Atomic swap via custom reentrancy dance | **Allocation** / DVP workflow |
| Roll your own token contract | Implement CIP-0056 interfaces for wallet/exchange interop |
| Ignore UTXO fragmentation | Keep ~<10 UTXOs/user; set up `MergeDelegation` |
| One giant balance per holder | Multiple `Holding` UTXOs, selected per transfer |

## Examples

Annotated transfer-flow reference in [`examples/transfer-flow.md`](examples/transfer-flow.md)
(registry → factory → instruction → accept).

## References

- KB: [`token-standard-notes.md`](../../knowledge-base/token-standard-notes.md)
- Docs: [Token Standard deep dive (CIP-0056)](https://docs.canton.network/appdev/deep-dives/token-standard),
  [Canton Coin](https://docs.canton.network/appdev/modules/m4-canton-coin);
  Splice docs ([docs.sync.global](https://docs.sync.global)); Amulet reference app.

---

> **Stage: draft.** Interface/choice/package IDs and the `Transfer` record verified
> against docs.sync.global + the splice `token-standard/` source (2026-06). Before
> `stable`: run against a live registry on LocalNet and add evals.
