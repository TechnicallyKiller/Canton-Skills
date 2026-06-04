# Canton Core Concepts

> Sources:
> - <https://docs.canton.network/overview/understand/five-minute-overview>
> - <https://docs.canton.network/overview/understand/core-concepts>
> - Architecture: ledger model, privacy model, two-layer consensus, trust model
> - M1 (mental models, dev stack), M2 (blockchain-dev migration)
>
> This note is the grounding for `canton-mental-models` and the shared baseline
> every other skill assumes. **Verify each line against the live docs before a
> skill is promoted past `draft`** — links above, this is distilled understanding.

## The four pillars (what makes Canton *not* a typical blockchain)

1. **Privacy-first by design.** Privacy is structural, not an add-on. There is no
   world-readable global state. Data is shared only with parties that need it.
2. **Distributed state / no single ledger.** Each participant node holds only its
   own *view* of the virtual shared ledger — the subtransactions its parties are
   involved in. There is no global address space you can scan.
3. **Targeted (not global) consensus.** Agreement is reached only among the
   parties to a given transaction (plus the relevant synchronizer), not across the
   entire network. This is what lets it scale and stay private.
4. **Structural authorization.** Permissions are declared in Daml at compile time
   (signatories, observers, controllers) and enforced by the protocol — not
   checked by ad-hoc `require`/`msg.sender` guards in application code.

## Key terms (Canton vocabulary)

- **Party** — a logical identity on the ledger (e.g. `Alice`, `Bank`). Parties act,
  sign, and observe. Hosted on one or more participant nodes.
- **Participant node** — software a party connects through; holds that party's view
  of the ledger and submits commands to the Ledger API.
- **Synchronizer** (formerly "domain") — provides ordering/consensus and message
  routing for the participants connected to it. The **Global Synchronizer** is the
  public one; extension/private synchronizers also exist.
- **Contract** — an instance of a Daml template on the ledger; immutable. "Changing"
  a contract = archive the old one + create a new one (functional, not in-place).
- **Template** — the Daml definition of a contract type: its data, its signatories
  and observers, and the choices that can be exercised on it.
- **Choice** — an action that can be exercised on a contract by its *controller*,
  producing a transaction (typically archiving and/or creating contracts).
- **DAR** — compiled Daml archive uploaded to participants to make templates
  available.
- **Ledger API** — the gRPC (and JSON) interface apps use to submit commands and
  stream transactions/events for the parties a participant hosts.

## Mental-model traps (EVM-brain → Canton-correct)

These are the defaults an LLM trained on Ethereum/Solidity will reach for. The
skill's job is to flip each one.

| EVM-brain assumption | Canton reality |
|----------------------|----------------|
| "There's a global state everyone can read." | Each party sees only its own view; model visibility explicitly via observers. |
| "Anyone can call any public function; guard with `require(msg.sender == …)`." | A choice runs only for its declared controller; authorization is structural, enforced by protocol. |
| "`msg.sender` is the caller." | The *submitting party* and the *controllers/signatories* are declared; there is no implicit global caller. |
| "Mutate a storage slot." | Contracts are immutable; archive + create to change state. |
| "Deploy a contract = one shared instance." | Templates are types; each contract is an instance with its own signatory/observer set. |
| "Events are public logs." | Transaction/event streams are per-party and privacy-scoped. |
| "Consensus = the whole chain agrees on everything." | Consensus is targeted to the transaction's parties + synchronizer. |
| "Gas / accounts / wallets like Ethereum." | Fees and assets work via the Token Standard / Canton Coin; wallets differ from Web3 wallets. |

## The development stack (M1)

- **Daml** — the smart-contract language (functional, strongly typed) for on-ledger
  logic. Compiles to Daml-LF, packaged as DARs.
- **Canton** — the network/protocol that runs Daml privately and at scale across
  participant nodes and synchronizers.
- **Ledger API (gRPC + JSON)** — how off-ledger apps interact.
- **PQS (Participant Query Store)** — a query-optimized read model projected from
  the ledger for app/backends.
- **Splice / Amulet** — reference apps and the Token Standard implementation
  (Canton Coin) on the Global Synchronizer.
- **SDKs** — dApp SDK (CIP-103 dApp API) and Wallet SDK for integration.

## Why this matters for generated code

If the agent doesn't internalize the four pillars, it will generate Daml that
"compiles in spirit" but: leaks data through over-broad observers, puts
authorization checks in the wrong place (or app code), assumes a queryable global
ledger in the backend, or models mutable balances instead of using the Token
Standard. Every downstream skill assumes this note is understood.

## Open questions / to verify

- Exact current terminology: "synchronizer" vs legacy "domain" across pages.
- Current Daml SDK + Canton release to pin (see ROADMAP "Pinned versions").
- Precise privacy guarantees wording from the privacy model page.
