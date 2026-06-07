# Zenith / EVM-on-Canton Notes

> Sources (studied 2026-06):
> - <https://docs.zenith.network/introduction>
> - <https://docs.zenith.network/zenith-evm>
> - <https://docs.zenith.network/zenith-stack>
> - Launch coverage (Mar 2026): GlobeNewswire, The Block.
>
> Feeds `canton-evm`. **Drafted — docs-verified (cannot run live; pre-MainNet).**

## What Zenith is

Zenith is a **multi-VM execution layer for the Canton Network** — **EVM first, SVM
(Solana) planned next**. It lets teams bring **existing EVM apps to Canton**: deploy
**unmodified Solidity**, settled on Canton, with Canton's privacy/compliance and
atomic composability. Launched March 2026; **MainNet targeted Q2 2026**. Addresses the
"Polyglot Canton" goals: developer accessibility, EVM compatibility, privacy +
regulatory compliance.

Two things, don't conflate them:

- **Zenith EVM** — *a* reference EVM environment **operated by Zenith**, built on
  **Reth**, exposing a **fully compatible Ethereum RPC** and the **same EVM runtime**
  as Ethereum mainnet.
- **Zenith Stack** — the **framework for a Canton participant to run their *own*
  customizable, permissioned EVM environment** (own native token, fee/economic model,
  ordering logic, access controls). Each instance is an independent Ethereum-equivalent
  chain that is composable with Canton.

## Verified specifics

- **Tooling: standard Ethereum tools work out of the box** — **Foundry, Hardhat,
  MetaMask**. Just **replace the RPC endpoint** with the Zenith env's. "Contract
  deployment works exactly as it does on Ethereum."
- **Atomic composability with Canton via `external_call()`** — a primitive
  **implemented in Daml** that lets Daml contracts invoke the EVM env
  **deterministically**, enabling atomic cross-environment ops (e.g. an **atomic swap
  between a Canton-native asset and an EVM-native asset**).
- **Each Zenith chain has its own dedicated Daml contract on Canton** that is "the
  coordination and settlement layer between Canton and the EVM environment."
- **Two-step validation (Canton's model):** the submitter executes the call and
  includes results in the transaction view; **Canton validators re-execute the same
  `external_call()` locally** — if outputs diverge, validation fails. "Either both
  succeed or the entire transaction fails." → **EVM execution must be deterministic.**
- **Cross-environment:** a user submits **one Canton transaction containing wrapped
  EVM payloads** for each relevant Zenith env; each chain **settles its state root
  back to Canton** via its dedicated Daml contract. True atomic composability, no
  partial execution.
- **Finality:** ~ the same as a Canton-only tx; Zenith adds "almost unnoticeable
  latency in the range of a few hundred milliseconds."
- **Institutional control / privacy:** operators keep data-access controls,
  compliance, native tokens, fees, and ordering within their domain — **permissioned**
  environments, not a public chain.

## Mental-model traps (L1-EVM-brain → Zenith/Canton-correct)

| ❌ Ethereum-L1 assumption | ✅ Zenith/Canton reality |
|--------------------------|--------------------------|
| Public global state + public events/mempool | Permissioned, privacy-scoped, operator-controlled environment |
| Non-determinism is fine (block randomness, etc.) | Validators **re-execute** `external_call`; non-determinism → tx fails |
| Move assets across chains via a bridge/oracle | First-class **atomic composability** via `external_call` (Daml); atomic swaps |
| One public chain, one fixed chain ID, ETH gas | Many operator-run envs; each sets its own token, fees, ordering, (chain id) |
| The EVM chain is the settlement layer | **Canton MainNet** is settlement (via the env's Daml contract / state root) |
| Solidity contract is the whole app | The Canton-side **Daml coordination contract** is half the system |

## When Zenith (EVM) vs native Daml

- **Zenith / Solidity:** existing EVM codebases, EVM tooling/teams, EVM-native DeFi
  that needs to touch Canton assets atomically, avoiding Daml.
- **Native Daml:** deep Canton-native privacy modeling, the **Token Standard /
  registries / Splice / protocol**, and the **dedicated Daml coordination contracts**
  that back each Zenith env. (See `daml-language`, `canton-token-standard`.)
- They **interoperate atomically** — it's not either/or. The interesting designs span
  both: Solidity for app logic, Daml for the Canton-native asset + settlement.

## Open questions / to verify (when live)

- Concrete **RPC URLs, chain IDs, testnet/mainnet** names (not in docs yet).
- Exact `external_call()` Daml signature + the per-env Daml coordination contract API.
- Gas/fee mechanics and any **precompiles** for reaching Canton assets from Solidity.
- Privacy specifics: what EVM state/events are visible to whom.
