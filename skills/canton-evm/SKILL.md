---
name: canton-evm
description: >-
  Build EVM / Solidity applications on the Canton Network via Zenith (the EVM
  execution layer for Canton; SVM/Solana planned next). Use whenever a task involves
  Zenith, deploying Solidity to Canton, EVM-on-Canton, pointing Foundry/Hardhat/
  MetaMask at a Canton/Zenith RPC, atomic swaps between EVM-native and Canton-native
  assets, the `external_call()` primitive, a Zenith Stack environment, or "do I still
  need Daml if I can write Solidity on Canton?". This is the skill that stops an
  Ethereum dev from treating Zenith like public L1 Ethereum — it's a permissioned,
  privacy-scoped, validator-re-executed environment settled on Canton. For native
  Daml/Token-Standard work use daml-language / canton-token-standard; for plain L1
  Ethereum (no Canton) this does NOT apply.
---

# Canton EVM (Zenith)

Bring **unmodified Solidity** to Canton via **Zenith**, the EVM execution layer for
the Canton Network (SVM/Solana planned next). Your tooling barely changes; your
**mental model must.** Zenith is Ethereum-equivalent at the RPC/runtime level but runs
inside Canton's privacy-first, validator-re-executed, Canton-settled world.

Grounded in [`knowledge-base/zenith-evm-notes.md`](../../knowledge-base/zenith-evm-notes.md).
Status: pre-MainNet (targeted Q2 2026) — concrete RPC URLs / chain IDs aren't public
yet; treat those as "look up for your environment."

## What changes vs L1 Ethereum (and what doesn't)

**Doesn't change:** Zenith EVM is built on **Reth**, exposes a **fully compatible
Ethereum RPC**, runs the **same EVM runtime**. **Foundry, Hardhat, MetaMask work out
of the box** — just point the RPC endpoint at your Zenith environment and deploy
Solidity exactly as on Ethereum.

**Does change — the four things that bite EVM devs:**

1. **Determinism is mandatory.** Canton uses two-step validation: the submitter
   executes, then **validators re-execute the same call**. If your contract's output
   diverges between runs, the transaction **fails**. Avoid non-deterministic patterns
   (relying on unpredictable `block.timestamp`/`block.prevrandao` for logic, off-chain
   randomness, anything that won't replay identically).
2. **No public global state.** A Zenith environment is **permissioned and
   privacy-scoped** — operator-controlled access, not a public chain with a public
   mempool and world-readable events. Don't assume anyone can read your state/events.
3. **Reaching Canton assets is atomic composability, not a bridge.** The
   **`external_call()`** primitive (implemented in **Daml**) lets Canton/Daml invoke
   the EVM env deterministically, enabling **atomic swaps between a Canton-native asset
   and an EVM-native asset** — all-or-nothing, no oracle/bridge trust. Each Zenith
   chain has a **dedicated Daml coordination contract on Canton**; that Daml side is
   half your system.
4. **Canton is the settlement layer.** Each env **settles its state root back to
   Canton** via its Daml contract; cross-environment calls go in **one Canton
   transaction with wrapped EVM payloads** per env. The EVM chain is *not* the final
   settlement.

## Zenith EVM vs Zenith Stack

- **Zenith EVM** — a reference EVM environment **operated by Zenith**. Use it to just
  deploy and run Solidity.
- **Zenith Stack** — the framework for **a Canton participant to run their own
  permissioned EVM environment** (custom native token, fee/economic model, ordering,
  access controls). Use it when an institution needs an isolated, compliant chain that
  still composes atomically with Canton.

## Do you still need Daml? (the honest answer)

**Often, partly — yes.** Zenith removes the need to learn Daml *for the EVM app logic*.
But the **Canton-native asset, the Token Standard, registries, and the per-env Daml
coordination contract** are still Daml. The strongest designs **span both**: Solidity
for app/DeFi logic, Daml for the Canton-native asset + settlement, joined atomically by
`external_call()`. Choose per layer, not per project:

| Need | Use |
|------|-----|
| Port an existing Solidity/EVM app; EVM tooling | **Zenith (this skill)** |
| Canton-native asset, payments, Token Standard | [`canton-token-standard`](../canton-token-standard) (Daml) |
| The Daml coordination/settlement contract for your env | [`daml-language`](../daml-language) + [`daml-authorization-patterns`](../daml-authorization-patterns) |
| Why Canton differs at all (privacy, authz) | [`canton-mental-models`](../canton-mental-models) |

## Anti-patterns to correct

| ❌ L1-Ethereum-by-default | ✅ Zenith/Canton-correct |
|--------------------------|--------------------------|
| Treat it as a public chain; assume readable state/events | Permissioned, privacy-scoped, operator-controlled |
| Use non-deterministic logic (randomness, timestamp gambling) | Must replay identically — validators re-execute |
| Bridge/oracle to move value to Canton | `external_call()` atomic composability / atomic swaps |
| Assume one chain id / ETH gas / public mempool | Per-environment token, fees, ordering, (chain id) |
| Build the whole app in Solidity | Pair Solidity logic with the Canton-side Daml asset/settlement |
| "Solidity on Canton means Daml is dead" | Daml still backs Canton-native assets + each env's coordinator |

## References

- KB: [`zenith-evm-notes.md`](../../knowledge-base/zenith-evm-notes.md)
- Docs: [Introduction](https://docs.zenith.network/introduction),
  [Zenith EVM](https://docs.zenith.network/zenith-evm),
  [Zenith Stack](https://docs.zenith.network/zenith-stack).

---

> **Stage: draft (docs-verified, pre-MainNet).** Built from the Zenith docs (2026-06);
> not yet run against a live Zenith RPC. Before `stable`: pin concrete RPC URLs / chain
> ids, the real `external_call()` Daml signature + per-env coordinator API, gas/fee and
> any precompiles, and add a compilable Solidity + Daml-coordinator example once a
> testnet is reachable.
