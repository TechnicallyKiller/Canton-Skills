# Smart-Contract Upgrades Notes

> Sources:
> - M6 smart-contract upgrades (overview, compatibility, limitations, deployment,
>   package naming/selection, testing, first upgrade)
> - Deep dives: smart-contract upgrades (reference, architecture)
>
> Feeds `daml-contract-upgrades`. **Drafted — verified against M6 upgrade
> compatibility (2026-06, SDK 3.4.x).**

## Verified: SCU compatibility rules (M6)

**Backward-compatible (allowed):**
- **Add `Optional` fields** to templates, choice args, return types. Old contracts
  default new fields to `None`; fetch fails if an unknown field is non-`None`.
- **Add variant/enum constructors** (using a new value with old code fails, like a
  non-`None` new optional).
- **Add new choices** — usable on v1 contracts only after all stakeholder
  validators upload & vet the v2 DAR.
- **Modify a choice's controllers/observers/body** (bug fixes / new args). Cannot
  *remove* a choice — deprecate via `abort "Deprecated."` in the body.
- **Update signatory/observer/ensure** *only if computed values stay the same* for
  existing contracts (recomputation on fetch/exercise must match or the tx aborts).
- **Add interface instances** (cannot remove); interface definitions are immutable.
- **Add new templates** (cannot remove; deprecate via `ensure False` — leaves
  existing contracts unarchivable — or remove references).

**Breaking (compiler-rejected):** removing template/choice fields, changing field
types, removing choices/templates, removing variant constructors, removing
interface instances, changing interface definitions. For these, create **new**
templates + an `Upgrade` choice on the old one to migrate.

## Verified: packaging

- Use **symbolic package references** `#package-name:Module:Template` (not package
  IDs) for cross-version ledger reads.
- **Reverse-DNS** package naming to avoid conflicts.
- Compiler validates compatibility at build time against the v1 DAR named in
  `daml.yaml`'s **`upgrades:`** field (newer compiler can validate even if v1 source
  can't be recompiled).

## Key concepts (to fill / expand)

- Daml **smart-contract upgrades (SCU)**: evolve templates without breaking
  existing contracts; the compatibility rules that make an upgrade valid.
- Package naming & versioning; **package selection** at runtime.
- What changes are allowed vs. breaking (add optional fields, etc.).
- Upgrade deployment flow and testing an upgrade.

## Mental-model traps (EVM-brain → Canton-correct)

- "Proxy pattern / delegatecall to upgrade" → Daml has first-class upgrade
  semantics; don't simulate EVM proxies.
- "Redeploy and migrate storage manually" → SCU handles compatible evolution;
  follow the package naming/selection rules.

## Canonical patterns / snippets (TODO)

- Compatible field addition example (v1 → v2).
- Package version + selection config.

## Open questions / to verify

- Exact compatibility matrix and limitations for current SDK.
