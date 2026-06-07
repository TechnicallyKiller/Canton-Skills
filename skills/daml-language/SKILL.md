---
name: daml-language
description: >-
  Write, read, and review Daml smart-contract code for the Canton Network. Use
  this whenever the task involves .daml files, templates, choices, signatories,
  observers, contract keys, interfaces, the Update monad, the Daml standard
  library, or modeling on-ledger state — including "convert this Solidity/idea to
  Daml," "why won't this Daml compile," or "review this template." Prefer this over
  generic functional-programming help, but only when Daml is actually the language
  (not Haskell/other FP). Defer multi-party permission DESIGN to
  daml-authorization-patterns and test-writing to daml-testing — but use this skill
  for the template/choice/key/interface syntax itself. Builds on
  canton-mental-models.
---

# Daml Language

Write idiomatic, compilable Daml. Daml is a strongly-typed, functional language;
**contracts are immutable** and state changes are *archive-old + create-new*, never
in-place mutation. Assumes [`canton-mental-models`](../canton-mental-models); for
multi-party permissioning design, hand off to
[`daml-authorization-patterns`](../daml-authorization-patterns).

Targets **Daml SDK 3.4.x** (see [ROADMAP.md](../../ROADMAP.md)). Build/test with
`dpm build` / `dpm test`.

## Templates

A `template` defines a contract type and who may create it. Every contract is an
instance of a template and **must have at least one signatory**.

```daml
template Token
  with
    owner : Party
  where
    signatory owner
```

- **`signatory`** — parties whose authority is required to **create or archive**
  the contract. They are guaranteed to see its creation and archival.
- **`observer`** — parties who can *see* the contract but grant no authority. Add
  the *minimum* set; over-broad observers leak privacy (see hand-off below).
- **`ensure`** — a boolean invariant that must hold for the contract to be created.
- **`key` / `maintainer`** — an optional uniqueness key (see Contract keys).

```daml
template Account
  with
    owner    : Party
    bank     : Party
    balance  : Decimal
  where
    signatory bank, owner          -- both must authorize creation/archival
    observer  owner
    ensure balance >= 0.0          -- invariant enforced by the ledger
```

## Choices

A `choice` is an action exercisable on a contract. It runs in the **`Update`
monad** and is the *only* way to change ledger state.

```daml
choice UpdateTelephone
  : ContractId Contact          -- return type (always wrapped in Update)
  with
    newTelephone : Text         -- choice arguments
  controller owner              -- ONLY this party may exercise
  do
    create this with telephone = newTelephone
```

Rules that trip up agents:

- **Controller authority is structural.** `controller owner` means `owner` is the
  only party allowed to exercise it — the protocol enforces this. Never reimplement
  it with `assert (caller == owner)`; there is no `msg.sender`.
- **Choices are consuming by default** — exercising archives the contract. Use
  `nonconsuming choice` when the contract should survive.
- **Inside a choice body use `create` / `exercise`** (Update monad), *not*
  `createCmd` / `exerciseCmd` (those are for Daml Script command submission).
- A choice **always returns `Update`**; the annotated type is shorthand.
- **`archive cid`** is shorthand for `exercise cid Archive`. `Archive` is implicitly
  added to every template, controlled by the **signatories**.

## Contract keys — NOT supported on Canton

Daml 2.x had `key`/`maintainer` contract keys. **They are not supported in current
Canton (Daml 3.x / SDK 3.4.x)** — `damlc` rejects a template with a `key` clause
("this feature is not currently supported. Contract keys"). Do not reach for them
out of Daml-2.x habit.

Model a unique business identifier as a normal field, and enforce uniqueness in the
workflow (an issuer/registry party that won't create a duplicate), passing
`ContractId`s when you already hold them:

```daml
template Account
  with
    bank   : Party
    number : Text     -- business identifier (NOT a ledger key)
    owner  : Party
  where
    signatory bank, owner
    -- Uniqueness of `number` is the bank's responsibility in its create workflow,
    -- not a ledger-enforced key.
```

## Interfaces

Interfaces let unrelated templates expose a common API and be exercised
polymorphically. Use them when multiple contract types must be handled uniformly
(e.g. the Token Standard); otherwise prefer plain templates.

**Define an interface in its own package, separate from the templates that
implement it.** Canton (3.4.x) errors by default when an interface is implemented in
the same package it is defined in, because it harms upgradeability
(`-Wupgrade-interfaces`). Same-package use compiles only if you downgrade that
warning — fine for a throwaway sample, not for production.

```daml
interface IAsset where
  viewtype AssetView
  getOwner : Party
  choice Transfer : ContractId IAsset
    with newOwner : Party
    controller getOwner this
    do pure (toInterfaceContractId @IAsset self)  -- implementations override

data AssetView = AssetView with owner : Party
```

## Functional idioms

- No mutation, no loops over storage. Build new values; recurse or `foldl`/`map`
  over lists within `Update`.
- `do` notation sequences `Update` actions (`<-` binds results).
- Model domain types with records (`data X = X with ...`) and variants
  (`data Status = Active | Closed`).
- Read the current ledger time with `getTime` (returns `Update Time`).

## Standard library (commonly needed)

`DA.List` (`map`, `filter`, `foldl`, `sort`, `elem`), `DA.Optional`
(`fromOptional`, `optional`), `DA.Map`/`DA.Set`, `DA.Action` (`when`, `unless`,
`forA`), `DA.Text`, `DA.Time`. Import explicitly, e.g. `import DA.List (sortOn)`.

Gotcha (verified SDK 3.4.11): **`Date` and `Time` are built-in types — do not
`import DA.Date (Date)`** (the module doesn't export it; the import errors). Use
`Date`/`Time` directly; import `DA.Date`/`DA.Time` only for the helper *functions*.

## Anti-patterns to correct

| ❌ Wrong-by-default (EVM/imperative) | ✅ Daml-correct |
|-------------------------------------|-----------------|
| Mutate a field in place | Archive + `create` a new contract |
| `require(msg.sender == owner)` in the body | Declare `controller owner`; protocol enforces it |
| `createCmd`/`exerciseCmd` inside a choice | Use `create`/`exercise` (Update monad) |
| Imperative `for` loop over storage | `map`/`foldl`/recursion within `Update` |
| Use Daml-2.x `key`/`maintainer` contract keys | Not supported on Canton 3.x — model an id field + pass `ContractId`s |
| One giant template with mutable status flags | Separate templates / choices; archive+create transitions |

## Examples

Compilable samples in [`examples/`](examples) (verified with `dpm build`,
SDK 3.4.11): `MinimalTemplate.daml`, `UniqueIdentifier.daml`, `WithInterface.daml`.

## References

- KB: [`daml-language-notes.md`](../../knowledge-base/daml-language-notes.md)
- Docs: [contract templates](https://docs.canton.network/appdev/modules/m3-contract-templates),
  [choices](https://docs.canton.network/appdev/modules/m3-choices),
  [contract keys](https://docs.canton.network/appdev/modules/m3-contract-keys),
  [interfaces](https://docs.canton.network/appdev/modules/m3-interfaces),
  [standard library](https://docs.canton.network/appdev/modules/m3-standard-library).

---

> **Stage: draft.** Verified against M3 docs; **all examples compile under
> `dpm build` with SDK 3.4.11** (this is how we found contract keys are unsupported
> on Canton 3.x). Before `stable`: run trigger + behavior evals
> ([CONTRIBUTING.md](../../CONTRIBUTING.md)).
