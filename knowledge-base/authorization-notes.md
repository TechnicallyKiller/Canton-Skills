# Authorization & Multi-Party Patterns Notes

> Sources:
> - M3 authorization, design patterns
> - Deep dives: authorization, multi-party composition, contract disclosure
> - Architecture: privacy model, trust model
>
> Feeds `daml-authorization-patterns`. **Drafted — verified against M3
> authorization & design-patterns pages (2026-06, Daml SDK 3.4.11).**

## The authorization rule (verbatim from docs)

- **Create action**: required authorizers = the **signatories** of the contract.
- **Exercise action**: required authorizers = the **controllers** of the choice.
- **Consequences of an exercise** are authorized by *the actors of that action plus
  the signatories of the contract the action was taken on.*
- Root actions of a transaction are authorized by the **submitting party**.
- **The rule:** *"the required authorizers of every action are a subset of the
  authorizers of the parent transaction."*
- **Authority is not transferred transitively.** This is exactly why you need
  propose/accept and delegation — you can't unilaterally create a contract that
  names another party as signatory.
- If a choice lists multiple controllers, the authority of **all** is required.

## Verified patterns (from M3 design patterns)

**Propose/Accept (initiate-and-accept)** — proposer is sole signatory of the
proposal (+ counterparty as observer); the counterparty's choice creates the final
two-signatory agreement, contributing their authority:

```daml
template CoinIssueProposal
  with
    coinAgreement : CoinIssueAgreement
  where
    signatory coinAgreement.issuer
    observer coinAgreement.owner
    choice AcceptCoinProposal
      : ContractId CoinIssueAgreement
      controller coinAgreement.owner
      do create coinAgreement   -- both issuer & owner sign the result
```

**Delegation (power of attorney)** — principal signs; attorney is observer and
controls a `nonconsuming` choice that exercises on the principal's behalf:

```daml
template CoinPoA
  with
    attorney : Party
    principal : Party
  where
    signatory principal
    observer attorney
    nonconsuming choice TransferCoin
      : ContractId TransferProposal
      with coinId : ContractId Coin; newOwner : Party
      controller attorney
      do exercise coinId Transfer with newOwner
```

Other documented patterns: **Authorization** (a permission contract checked before
acting), **Locking** (state/flag prevents a choice until unlocked), **Multiple
Party Agreement** (`Pending` accumulates signatures via a `Sign` choice, then
`Finalize` once `alreadySigned == finalContract.signatories`).

## Key concepts (to fill / expand)

- Signatory authority: a contract can only be created with authorization of *all*
  its signatories. Who signs determines who must agree and who can see.
- Observers: grant visibility without authority. Over-broad observers leak privacy.
- Controllers: who may exercise a choice; choices can require additional authority.
- Delegation & the propose/accept pattern for getting multi-party authorization.
- Authorization rules in transactions (sub-transaction authority).

## Mental-model traps (EVM-brain → Canton-correct)

- "Check `msg.sender` in the function" → declare `controller`; protocol enforces it.
- "Admin can do anything" → admin needs structural authority or a delegated right.
- "Add everyone as observer to be safe" → privacy leak; observe minimally.
- "One party creates a 2-party contract directly" → needs both signatories;
  use propose/accept (initiate-and-accept) pattern.

## Canonical patterns / snippets (TODO)

- Propose/Accept (initiate-and-accept).
- Delegation contract granting a right.
- Role-based access via separate templates.
- Multi-party agreement composition.

## Open questions / to verify

- Current recommended wording for the standard design patterns page.
