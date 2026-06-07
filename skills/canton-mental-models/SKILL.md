---
name: canton-mental-models
description: >-
  Foundational mental models and conceptual orientation for the Canton Network —
  the privacy-first, no-global-ledger, structural-authorization model. Use when the
  task is about UNDERSTANDING how Canton works or how it differs from Ethereum/other
  blockchains: onboarding, "is this how Canton actually works," architecture/mindset
  questions, EVM→Canton concept translation (msg.sender, global state, gas,
  consensus), or getting the design framing right before building. Especially for
  developers coming from Ethereum/Solidity/EVM. Covers parties, participant nodes,
  synchronizers, privacy, and targeted consensus at the concept level. NOT for
  writing concrete Daml templates/choices (use daml-language), authorization design
  (daml-authorization-patterns), tests (daml-testing), the Ledger API, deployment, or
  building Solidity-on-Canton via Zenith (canton-evm) — defer those to the specific
  skill.
---

# Canton Mental Models

This is the foundation skill. Its job is to **stop the agent from modeling Canton
like an EVM chain.** Almost every wrong answer about Canton traces back to one of
four imported assumptions. Internalize the corrections here before writing Daml,
**deploying Solidity via Zenith**, designing an app, or calling the Ledger API — the
other skills assume it.

Grounded in [`knowledge-base/canton-core-concepts.md`](../../knowledge-base/canton-core-concepts.md).

## The four pillars

Canton is **not "a blockchain with different syntax."** It is built around:

1. **Privacy-first.** No world-readable global state. Data reaches only the parties
   that need it. Privacy is structural, not a feature you bolt on.
2. **Distributed state.** Each participant node holds only *its* parties' view of
   the virtual shared ledger. There is no global ledger you can scan or index.
3. **Targeted consensus.** Agreement happens among the parties to a transaction
   (plus their synchronizer), not across the whole network.
4. **Structural authorization.** Who can do what is declared in the on-ledger model
   (in Daml: signatories / observers / controllers) and enforced by the protocol —
   not by `require`/`msg.sender` checks bolted onto application code.

## Two ways to build — the pillars hold for both

You can build **natively in Daml**, or bring **EVM/Solidity via Zenith** (SVM later).
The four pillars are **VM-agnostic** — they're properties of *Canton*, not of Daml. A
Solidity dev on Zenith still has no public global ledger, still settles on Canton, and
still touches Canton-native assets governed by Daml (joined atomically via
`external_call`). The modeling steps below are the **Daml path**; for the Zenith path
see [`canton-evm`](../canton-evm).

## Apply this before you build

When you're modeling **in Daml**, reason in this order (on the Zenith/Solidity path the
same privacy/authorization/settlement framing applies, plus a Canton-side Daml
coordination contract):

1. **Who are the parties?** Name the logical identities that act and observe.
2. **Who must agree (signatories)?** That determines authority *and* who can see
   the contract. A contract is created only with all signatories' authorization.
3. **Who else needs visibility (observers)?** Grant the *minimum* — extra observers
   leak privacy.
4. **What actions exist (choices) and who controls each?** The controller is the
   only party who can exercise that choice.
5. **Only then** model the data and the app/Ledger-API layer around it.

## Anti-patterns to correct (EVM-brain → Canton-correct)

| ❌ Wrong-by-default (EVM brain) | ✅ Canton-correct |
|-------------------------------|-------------------|
| "There's a global state everyone can read." | Each party sees only its own view; model visibility via observers. |
| "Guard actions with `require(msg.sender == owner)`." | Declare the `controller`; the protocol enforces it structurally. |
| "`msg.sender` is the caller." | There is no implicit global caller; the submitting party and the contract's signatories/controllers are explicit. |
| "Mutate a storage slot." | Contracts are immutable — archive the old, create the new. |
| "Events are a public log; index the chain in the backend." | Streams are per-party and privacy-scoped; read via PQS / per-party streams. |
| "Consensus = the whole chain agrees on everything." | Consensus is targeted to the transaction's parties + synchronizer. |
| "Roll a balance mapping for tokens." | Use the Canton Network Token Standard. |
| "MetaMask account = address." | Parties + participant-managed signing; Canton wallets differ from Web3 wallets. |

## Vocabulary the agent must use correctly

Party · participant node · synchronizer (not "domain") · contract (immutable
instance) · template · choice · controller · signatory · observer · DAR · Ledger
API · PQS. See the core-concepts note for definitions.

## When to hand off to another skill

This skill sets the frame; go deeper with:

- Writing templates/choices → [`daml-language`](../daml-language)
- Who-can-do-what / multi-party → [`daml-authorization-patterns`](../daml-authorization-patterns)
- Calling the ledger from an app → [`canton-ledger-api`](../canton-ledger-api)
- Tokens/payments → [`canton-token-standard`](../canton-token-standard)
- EVM/Solidity on Canton (Zenith) → [`canton-evm`](../canton-evm)

## References

- KB: [`canton-core-concepts.md`](../../knowledge-base/canton-core-concepts.md)
- Docs: [five-minute overview](https://docs.canton.network/overview/understand/five-minute-overview),
  [core concepts](https://docs.canton.network/overview/understand/core-concepts),
  privacy model, two-layer consensus, M1/M2 modules.

---

> **Stage: draft.** Verified against the overview/architecture docs and M1–M2
> (2026-06); targets Daml SDK 3.4.x. Terminology confirmed: docs use
> "synchronizer." Before `stable`: run trigger + behavior evals per
> [CONTRIBUTING.md](../../CONTRIBUTING.md).
