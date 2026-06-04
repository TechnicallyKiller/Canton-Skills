# Daml Language Notes

> Sources:
> - M3 Daml fundamentals (language, functional programming, templates, choices,
>   contract keys, interfaces, design patterns, stdlib, time)
> - Reference: Daml language reference, Daml-LF reference, standard library
> - <https://docs.canton.network> (find pages via llms.txt)
>
> Feeds `daml-language` and `daml-testing`. **Drafted — verified against the M3
> pages above (2026-06, Daml SDK 3.4.11).** Code blocks below are quoted/derived
> from the canonical docs.

## Verified snippets (from M3 docs)

Minimal template — *"Every contract must have at least one signatory."* Signatories
are *"the parties whose authority is required to create the contract or archive it"*
and are guaranteed to see its creation and archival:

```daml
template Token
  with
    owner : Party
  where
    signatory owner
```

Choices are **consuming by default** (exercising archives the contract). The
`controller` is *"the only party that is allowed to exercise"* the choice. Inside a
choice body use `create`/`exercise` (Update monad), not the `*Cmd` variants:

```daml
choice UpdateTelephone
  : ContractId Contact
  with
    newTelephone : Text
  controller owner
  do
    create this with
      telephone = newTelephone
```

- A choice *always* returns an `Update`; the annotated type is shorthand.
- `archive cid` == `exercise cid Archive`; `Archive` is implicitly added to every
  template with the **signatories as controllers**.
- `nonconsuming choice` does not archive the contract when exercised.

## Key concepts (to fill / expand)

- Templates: `template`, `with` (fields), `where`, `signatory`, `observer`, `ensure`.
- Choices: `choice`/`nonconsuming choice`, `controller`, `do` body, return type.
- Contract keys: `key`, `maintainer`, lookup/fetch semantics and pitfalls.
- Interfaces & view types; when to use interfaces vs templates.
- Functional idioms: `Update` monad, `do` notation, records, ADTs, no mutation.
- Standard library: `DA.List`, `DA.Map`, `DA.Optional`, `DA.Action`, `DA.Time`, etc.
- Time on the ledger: `getTime`, ledger time vs record time.

## Mental-model traps (EVM-brain → Daml-correct)

- "Mutate state" → archive + create; everything is immutable.
- "Loops/imperative storage" → recursion / fold over `Update`.
- "`require` guards" → `ensure` for invariants, structural authz for permissions.
- "Global getters" → fetch a contract you're entitled to; no global reads.
- (expand during drafting)

## Canonical patterns / snippets (version-pinned — TODO)

- Minimal template with signatory + observer + one consuming choice.
- Template with contract key + maintainer.
- Interface + implementing template.

## Open questions / to verify

- Current Daml SDK version + any 3.x language changes to reflect.
