# Compatible upgrade: v1 → v2 (add an Optional field)

Adding an `Optional` field is backward-compatible: existing v1 contracts default
the new field to `None`. Adding a *required* field would be breaking. Targets Daml
SDK 3.4.x.

## v1

```daml
-- package: com.example.account, version 1.0.0
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
-- package: com.example.account, version 2.0.0
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
name: com.example.account
version: 2.0.0
upgrades: ../v1/.daml/dist/com.example.account-1.0.0.dar  # compiler validates v2 vs v1
dependencies:
  - daml-prim
  - daml-stdlib
```

The compiler checks compatibility at build time against the named v1 DAR.

## Reading across versions

Use a symbolic package reference so reads work regardless of version:

```
#com.example.account:Account:Account
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
