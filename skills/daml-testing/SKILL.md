---
name: daml-testing
description: >-
  Write and debug tests for Daml models using Daml Script. Use whenever the task
  involves testing on-ledger Daml logic: writing test scenarios, allocating
  parties, submit/submitMustFail, asserting ledger outcomes or privacy, multi-party
  test flows, or "add tests for this template" / "why does my Daml Script fail."
  Emphasizes proving authorization with submitMustFail. This is specifically Daml
  Script — NOT for frontend/JS/TS tests, property-based tests in other languages,
  or integration tests that drive the Ledger API from app code. Pairs with
  daml-language for the code under test.
---

# Daml Testing

Test Daml with **Daml Script**: allocate parties, submit commands *as specific
parties*, and assert outcomes. A good Canton test proves the **authorization and
privacy model**, not just the happy path — the highest-value test is usually a
`submitMustFail` showing an unauthorized party *cannot* act.

Targets Daml SDK 3.4.x. Run with `dpm test` (CLI) or the "Script results" lens in
Daml Studio (VS Code).

## Anatomy of a script

```daml
module Test where

import Daml.Script

setup : Script ()
setup = do
  -- Allocate test parties.
  alice <- allocateParty "Alice"
  bank  <- allocateParty "Bank"

  -- Submit a command AS a party. Use *Cmd variants in scripts (not bare create).
  accountCid <- submit bank do
    createCmd Account with bank; owner = alice; balance = 100.0

  -- Exercise a choice as its controller.
  accountCid2 <- submit alice do
    exerciseCmd accountCid (Deposit with amount = 50.0)

  pure ()
```

Key APIs:

- **`allocateParty : Text -> Script Party`** — create a test party.
- **`submit p cmds`** — submit as party `p`; fails the script if the ledger rejects.
- **`submitMustFail p cmds`** — asserts the submission is **rejected** (the
  authorization/privacy test).
- **`createCmd` / `exerciseCmd` / `exerciseByKeyCmd`** — command builders (the
  `Cmd` suffix is what distinguishes Script-land from the Update monad in choices).
- **`query p`** / **`queryContractId p cid`** — read what party `p` can see (reads
  are privacy-scoped — querying as the wrong party returns nothing).
- **`assert` / `assertMsg`** — check conditions on results.

## Prove authorization, not just success

The test that actually validates a Canton model is the negative one:

```daml
testAuthorization : Script ()
testAuthorization = do
  alice <- allocateParty "Alice"
  mallory <- allocateParty "Mallory"
  bank <- allocateParty "Bank"

  accountCid <- submit bank do
    createCmd Account with bank; owner = alice; balance = 100.0

  -- Mallory is not the controller of Deposit, so this MUST be rejected.
  submitMustFail mallory do
    exerciseCmd accountCid (Deposit with amount = 50.0)
```

## What good coverage includes

- **Happy path** end-to-end (e.g. full propose → accept flow).
- **A `submitMustFail` for every privileged action**, submitted as a party who
  should *not* be allowed — this is what proves structural authorization.
- **Privacy checks**: `query` as a non-stakeholder and assert they see nothing.
- **Invariant violations**: assert `ensure`/`assertMsg` guards reject bad input.
- **Multi-party flows**: drive propose/accept across the real parties.

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Daml-correct |
|--------------------|-----------------|
| Only testing the happy path | Add `submitMustFail` for every unauthorized action |
| Submitting everything as one "god" party | Submit as the actual controller to exercise real authz |
| Asserting against "global state" | `query`/`queryContractId` as an *entitled* party |
| `create`/`exercise` in a script | Use `createCmd`/`exerciseCmd` in Script-land |

## Examples

Compilable samples in [`examples/`](examples): `BasicTest.daml`,
`AuthorizationTest.daml`. Run with `dpm test`.

## References

- KB: [`daml-language-notes.md`](../../knowledge-base/daml-language-notes.md)
- Docs: [testing](https://docs.canton.network/appdev/modules/m3-testing); Daml
  Script reference.

---

> **Stage: draft.** Verified against Daml Script conventions (SDK 3.4.x). Before
> `stable`: confirm examples run under `dpm test`.
