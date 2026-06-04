---
name: daml-authorization-patterns
description: >-
  Design who-can-do-what ON A CANTON LEDGER using Daml's structural authorization
  (signatories, observers, controllers) — not web/app login. Use whenever a task
  involves modeling authority and visibility in Daml: "two parties need to agree,"
  propose-accept / initiate-and-accept workflows, delegation / power-of-attorney,
  roles, multi-party agreements, or reviewing Daml for authorization bugs or privacy
  leaks (over-broad observers). This is the skill that stops Ethereum-style
  msg.sender/require permission checks. For plain template/choice syntax use
  daml-language; this does NOT cover OAuth or web/app authentication. Builds on
  canton-mental-models and daml-language.
---

# Daml Authorization Patterns

Authorization on Canton is **structural and enforced by the protocol** — not by
guards in code. Get the authority graph right and the rest of the model follows.
Builds on [`daml-language`](../daml-language); targets Daml SDK 3.4.x.

## The authorization rule (the one thing to internalize)

For every action, the ledger computes its **required authorizers**:

| Action | Required authorizers |
|--------|----------------------|
| **Create** a contract | its **signatories** |
| **Exercise** a choice | the choice's **controllers** |
| Consequences of an exercise | the action's actors **+** the signatories of the contract it was exercised on |
| Root actions of a transaction | the **submitting party** |

> **The rule:** the required authorizers of every action must be a **subset of the
> authorizers of the parent transaction.** And **authority is not transferred
> transitively.**

That last clause is *why* you cannot just `create` a contract that names someone
else as a signatory — you don't hold their authority. To obtain it you need them to
exercise a choice (propose/accept) or to have pre-delegated it. This is the
single most common thing an EVM-trained agent gets wrong.

## Design order

1. **Signatories** — who must authorize, and therefore who can see it. Minimal but
   complete: every party whose consent the contract represents.
2. **Observers** — who else needs visibility. **Minimum only** — extra observers
   are a privacy leak, not a safety margin.
3. **Controllers** — per choice, exactly who may act.
4. **How authority is gathered** — propose/accept or delegation (below).

## Pattern: Propose / Accept (initiate-and-accept)

The way two parties reach a jointly-signed contract. The proposer is the sole
signatory of the *proposal*; the counterparty is an observer and controls an
`Accept` choice whose body creates the final, two-signatory agreement —
contributing their authority at exercise time.

```daml
template IssueProposal
  with
    issuer : Party
    owner  : Party
  where
    signatory issuer          -- only the issuer has signed so far
    observer  owner           -- owner can see it and act on it

    choice Accept : ContractId IssueAgreement
      controller owner        -- owner's authority is added here
      do create IssueAgreement with issuer, owner

template IssueAgreement
  with
    issuer : Party
    owner  : Party
  where
    signatory issuer, owner   -- both parties have now authorized
```

Add `Reject` (archive) and `Counter` (archive + create a new proposal) choices as
needed.

## Pattern: Delegation (power of attorney)

Grant an agent the standing right to act on your behalf without per-action
approval. The principal signs; the attorney is an observer controlling a
`nonconsuming` choice.

```daml
template PowerOfAttorney
  with
    principal : Party
    attorney  : Party
  where
    signatory principal
    observer  attorney

    nonconsuming choice ActAsPrincipal : ContractId TransferProposal
      with
        assetCid : ContractId Asset
        newOwner : Party
      controller attorney
      do exercise assetCid Propose with newOwner
```

## Other documented patterns (see KB note for full code)

- **Authorization contract** — a permission record created by an issuer; choices
  check it exists before proceeding (capability-style access control).
- **Locking** — a `locker` field / lock contract blocks a choice until released;
  used for settlement/clearing.
- **Multiple-party agreement** — a `Pending` contract accumulates signatures via a
  `Sign` choice, then `Finalize` once `alreadySigned == finalContract.signatories`.

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Canton-correct |
|--------------------|-------------------|
| `require(msg.sender == owner)` in a choice | Declare `controller owner`; the protocol enforces it |
| One party `create`s a contract that names another as signatory | Impossible — use propose/accept to gather authority |
| Add everyone as `observer` "to be safe" | Observe the minimum; observers leak privacy |
| "Admin can do anything" | Admin needs real authority or a delegated right (delegation pattern) |
| Simulate roles with an `enum role` field + `if` checks | Separate templates / capability contracts per role |

## Reviewing Daml for authorization & privacy

When reviewing, ask: Does any `create` assume authority the submitter doesn't
hold? Is any `observer` broader than necessary? Could a choice's `controller` be a
party that shouldn't act here? Is sensitive data on a contract visible to an
observer who only needs a subset?

## Examples

Compilable samples in [`examples/`](examples): `ProposeAccept.daml`,
`Delegation.daml`.

## References

- KB: [`authorization-notes.md`](../../knowledge-base/authorization-notes.md)
- Docs: [authorization](https://docs.canton.network/appdev/modules/m3-authorization),
  [design patterns](https://docs.canton.network/appdev/modules/m3-design-patterns);
  privacy model; multi-party composition deep dive.

---

> **Stage: draft.** Verified against M3 authorization & design-patterns docs (SDK
> 3.4.x). Before `stable`: compile examples; add behavior evals that check
> authorization correctness and privacy (no over-broad observers).
