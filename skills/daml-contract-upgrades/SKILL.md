---
name: daml-contract-upgrades
description: >-
  Evolve already-deployed Daml templates safely using Daml Smart Contract Upgrades
  (SCU). Use whenever a task involves changing a deployed Daml model, package
  versioning/naming, the daml.yaml `upgrades` field, package selection, upgrade
  compatibility, or "how do I add a field without breaking existing contracts" /
  "upgrade my Daml package" / "is this change backward-compatible." This is the
  skill that stops the agent from inventing EVM proxy/delegatecall upgrade patterns
  — Daml has first-class upgrade semantics with specific compatibility rules. For
  rolling the new DAR out (upload/vetting) use canton-deployment.
---

# Daml Contract Upgrades (SCU)

Daml has **first-class smart-contract upgrades**: evolve templates without breaking
existing contracts, governed by explicit compatibility rules checked at **compile
time**. Do **not** simulate EVM proxy/delegatecall — follow the SCU model.

Targets Daml SDK 3.4.x.

## Backward-compatible changes (allowed)

| Change | Notes |
|--------|-------|
| **Add `Optional` fields** (template, choice args, return types) | Old contracts default to `None`; a fetch fails if an unknown field is non-`None` (prevents silent data loss) |
| **Add variant/enum constructors** | Using a new value with old code fails, like a non-`None` new optional |
| **Add new choices** | Usable on v1 contracts **only after all stakeholder validators upload + vet the v2 DAR** |
| **Modify a choice** (controllers/observers/body) | For bug fixes / new args. Cannot *remove* a choice — deprecate with `abort "Deprecated."` |
| **Update signatory/observer/ensure** | Only if **computed values stay identical** for existing contracts (recomputation on fetch/exercise must match, else the tx aborts) |
| **Add interface instances / new templates** | Cannot remove them; interface definitions are immutable once deployed |

## Breaking changes (compiler-rejected)

Removing template/choice fields, changing field types, removing choices/templates,
removing variant constructors, removing interface instances, changing interface
definitions.

For a genuinely breaking change, **don't fight the compiler**: create a *new*
template and add an `Upgrade` choice on the old one that archives it and creates the
new shape — an explicit, authorized migration.

## Packaging rules

- **`daml.yaml` `upgrades:` field** names the v1 DAR; the compiler validates v2
  against it at build time (a newer compiler can validate even if v1 source can't be
  recompiled).
- Use **symbolic package references** `#package-name:Module:Template` (not raw
  package IDs) so ledger reads work across versions.
- **Hyphenated lowercase package names** (e.g. `example-account`, like Splice's
  `splice-api-token-holding-v1`). Dots are **not** allowed — `damlc` requires
  `^[A-Za-z][A-Za-z0-9]*(-[A-Za-z][A-Za-z0-9]*)*$`. Bump the version per release.

## Anti-patterns to correct

| ❌ Wrong-by-default (EVM brain) | ✅ Daml-correct |
|-------------------------------|-----------------|
| Proxy / delegatecall upgrade pattern | First-class SCU; evolve the template in place |
| Redeploy + manual storage migration | Compatible evolution via `upgrades:` + versioning |
| Add a required field in v2 | Add an **`Optional`** field (required fields are breaking) |
| Change a field's type to "fix" it | Breaking — new template + `Upgrade` choice |
| Remove an obsolete choice | Keep it; deprecate the body with `abort "Deprecated."` |
| Reference templates by package ID across versions | Use symbolic `#package-name:...` references |

## Examples

[`examples/upgrade-v1-v2.md`](examples/upgrade-v1-v2.md) — a compatible
field-addition upgrade with the `daml.yaml` wiring.

## References

- KB: [`upgrades-notes.md`](../../knowledge-base/upgrades-notes.md)
- Docs: [overview](https://docs.canton.network/appdev/modules/m6-overview),
  [compatibility](https://docs.canton.network/appdev/modules/m6-upgrade-compatibility),
  [package naming](https://docs.canton.network/appdev/modules/m6-package-naming),
  [package selection](https://docs.canton.network/appdev/modules/m6-package-selection),
  [first upgrade](https://docs.canton.network/appdev/modules/m6-writing-first-upgrade),
  [limitations](https://docs.canton.network/appdev/modules/m6-limitations).

---

> **Stage: draft (compiler-verified).** Built a real v1→v2 multi-package upgrade
> with SDK 3.4.11: adding an `Optional` field compiles; retyping a field is rejected
> by the LF typechecker. Also caught: package names must be hyphenated (not dotted).
> Before `stable`: add evals.
