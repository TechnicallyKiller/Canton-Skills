# Compatible upgrade: v1 → v2 (add an Optional field)

Adding an `Optional` field is backward-compatible: existing v1 contracts default
the new field to `None`. Adding a *required* field would be breaking. Targets Daml
SDK 3.4.x.

## v1

```daml
-- package: example-account, version 1.0.0
module Account where

template Account
  with
    bank    : Party
    owner   : Party
    balance : Decimal
  where
    signatory bank, owner
```

## v2 — compatible change

```daml
-- package: example-account, version 2.0.0
module Account where

template Account
  with
    bank    : Party
    owner   : Party
    balance : Decimal
    label   : Optional Text   -- NEW: Optional, so v1 contracts default to None
  where
    signatory bank, owner
```

## Wire the upgrade in daml.yaml (v2 project)

```yaml
sdk-version: 3.4.11
name: example-account            # hyphenated lowercase — dots are NOT allowed
version: 2.0.0
source: daml
upgrades: ../v1/.daml/dist/example-account-1.0.0.dar  # compiler validates v2 vs v1
dependencies:
  - daml-prim
  - daml-stdlib
```

The compiler checks compatibility at build time against the named v1 DAR.
**Verified** with SDK 3.4.11: v1 builds, the v2 above (adds an `Optional` field)
builds, and a v2 that retypes `balance` is rejected — *"The upgraded template
Account has changed the types of some of its original fields: Field 'balance'
changed type from Numeric 10 to Text."*

## Reading across versions

Use a symbolic package reference so reads work regardless of version:

```
#example-account:Account:Account
```

## If you need a BREAKING change

Removing/retyping a field or removing a choice is compiler-rejected. Instead, add a
new template and migrate explicitly:

```daml
-- on the old template:
choice Upgrade : ContractId AccountV2
  controller bank, owner
  do create AccountV2 with bank, owner, balance, label = None
```
