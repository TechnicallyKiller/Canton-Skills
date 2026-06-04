# Token Standard Notes

> Sources:
> - Token standard, tokenomics, Canton Coin (architecture + appdev deep dive)
> - Splice docs <https://docs.sync.global> (Daml APIs, validator APIs)
> - Splice / Amulet reference apps <https://github.com/hyperledger-labs/splice>
>
> Feeds `canton-token-standard`. **Drafted — verified against the token-standard
> deep dive (CIP-0056) (2026-06, SDK 3.4.x).**

## Verified: the Token Standard (CIP-0056)

Core interfaces:

- **Holding** — a portfolio view; active **UTXO** contracts tracking ownership.
  Guidance: keep *"below ~10 UTXOs per user on average"* (validator cost/traffic).
- **Transfer Instruction** — direct peer-to-peer / **free-of-payment (FOP)**
  transfers via a **two-step** workflow.
- **Allocation & Allocation Instruction** — **delivery-versus-payment (DVP)**,
  conditional/synchronized exchanges.
- **Token Metadata** — standardized token info network-wide.

## Verified: two-step transfer (transfer-offer model)

1. **Factory step** — sender exercises **`TransferFactory_Transfer`** via the
   **registry** → creates a `TransferInstruction` contract.
2. **Acceptance** — receiver exercises **`TransferInstruction_Accept`** to complete.

Mechanics: fetch the factory from the registry, obtain **`disclosedContracts`** and
**`choiceContextData`**, then construct an `ExerciseCommand` (interface id +
contractId + choice + args) and submit via the JSON Ledger API submit/prepare/
execute endpoints (prepare/execute for external parties).

## Verified: who implements what

**Must implement:** UTXO management/selection (prefer small amounts), Ledger API
read/write integration, transaction-history parsing for wallet display,
`MergeDelegation` setup at onboarding.
**Can reuse:** Splice `splice-util-token-standard-wallet.dar`, the Wallet SDK
(`canton-network/wallet-gateway`), registry APIs for factory discovery.

## Key concepts (to fill / expand)

- The **Canton Network Token Standard**: the public API for working with tokens,
  including Canton Coin. Prefer it over hand-rolled balances.
- Transfer offers / transfer workflow (propose-accept shaped, two-step).
- Amulet as the reference implementation; Canton Coin as the native utility token.
- Holdings, instruments, allocations, registries (fill exact nouns from docs).
- Interplay with the Ledger API for creating/accepting transfer offers.

## Mental-model traps (EVM-brain → Canton-correct)

- "ERC-20 balance mapping" → tokens are contracts held by parties, transferred via
  the standard's workflows, not a balance map mutation.
- "Approve + transferFrom" → transfer-offer / allocation pattern, structurally
  authorized.
- "Roll your own token" → use the Token Standard for interoperability + wallets.

## Canonical patterns / snippets (TODO)

- Create and accept a transfer offer via the Token Standard.
- Read a party's holdings.

## Open questions / to verify

- Exact Token Standard interface names and current Splice version.
