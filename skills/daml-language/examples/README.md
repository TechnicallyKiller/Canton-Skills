# daml-language examples

Compilable Daml samples referenced by `../SKILL.md`. **Verified with `dpm build`
against Daml SDK 3.4.11.**

- `MinimalTemplate.daml` — template with signatory, observer, `ensure`, consuming +
  nonconsuming choices.
- `UniqueIdentifier.daml` — a unique business id **without** contract keys (keys are
  not supported on Canton 3.x).
- `WithInterface.daml` — interface + implementing template. Note: Canton errors by
  default when an interface is implemented in its own package (upgradeability);
  define interfaces in a separate package in production.
