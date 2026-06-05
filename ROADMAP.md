# Roadmap & Build Status

This catalog is built in phases. Each skill moves through four stages:

- **skeleton** — folder + frontmatter + outline + source links (authoring guide)
- **draft** — full body written from the knowledge base
- **evaluated** — trigger evals + behavior evals run via `skill-creator`, reviewed
- **stable** — passing evals, real Daml/code examples compile, version-pinned

## Status

| Phase | Skill | Stage | Knowledge-base source |
|-------|-------|-------|-----------------------|
| 1 | `canton-mental-models` | **draft** | `knowledge-base/canton-core-concepts.md` |
| 1 | `daml-language` | **draft** | `knowledge-base/daml-language-notes.md` |
| 1 | `daml-authorization-patterns` | **draft** | `knowledge-base/authorization-notes.md` |
| 1 | `daml-testing` | **draft** | `knowledge-base/daml-language-notes.md` |
| 2 | `canton-ledger-api` | **draft** | `knowledge-base/ledger-api-notes.md` |
| 2 | `canton-app-architecture` | **draft** | `knowledge-base/app-architecture-notes.md` |
| 2 | `canton-token-standard` | **draft** | `knowledge-base/token-standard-notes.md` |
| 3 | `canton-wallet-integration` | **draft** | `knowledge-base/wallet-integration-notes.md` |
| 3 | `canton-deployment` | **draft** | `knowledge-base/deployment-notes.md` |
| 3 | `daml-contract-upgrades` | **draft** | `knowledge-base/upgrades-notes.md` |
| 3 | `canton-production-ops` | **draft** | `knowledge-base/production-ops-notes.md` |

## Phase ordering — and why

**Phase 1 (modeling core).** The highest-leverage skills. `canton-mental-models`
is the foundation: it fixes the wrong defaults every other skill depends on.
`daml-language` + `daml-authorization-patterns` + `daml-testing` cover writing
correct, private, well-authorized contracts — the thing agents most often botch.

**Phase 2 (app integration).** Once the on-ledger model is right, connect an app:
the Ledger API, app architecture, and the Token Standard (most Canton apps move
value, so this is near-core).

**Phase 3 (lifecycle & ops).** Wallets/exchanges, deployment, upgrades, and
production operations — essential for shipping, but they build on a correct model
and a working app.

## Definition of done (per skill)

A skill is **stable** when:

1. `description` triggers reliably on real user phrasings and avoids near-miss
   false positives (validated with `skill-creator`'s description optimizer).
2. Body is < ~500 lines; long material lives in `references/` with clear pointers.
3. Every code example **compiles** against the pinned Daml SDK / Canton release.
4. It encodes at least the **anti-patterns** for its area (what the agent gets
   wrong by default) with the corrected pattern beside each.
5. Claims trace to a canonical source in the matching `knowledge-base/` note.

## Pinned versions

Track the toolchain each skill targets so examples stay consistent. Sourced from
the [Splice version information](https://docs.sync.global/app_dev/overview/version_information.html)
page (the versions the current Canton Network release is built with). Daml/Canton
docs guidance: use a recent stable Daml SDK with matching major.minor (3.4.x).

- **Daml SDK: `3.4.11`** (3.4.x line) — used for compiling DARs and Java/TS codegen.
- **Canton: 3.x** (Splice builds on `3.5.x` snapshots; target 3.4.x stable for apps).
- **Splice / Token Standard:** tracks Daml SDK 3.4.11.
- **CLI:** Daml 3.x uses **`dpm`** (Daml Package Manager) — e.g. `dpm build`,
  `dpm test` — alongside Daml Studio (VS Code).

> When a newer stable 3.4.x (or 3.5.x once stable) lands, re-verify examples
> compile and bump this block.

## Verification log

- **2026-06-05** — All 7 Phase-1 Daml examples compiled with `dpm build` (SDK
  3.4.11); both Daml Script tests pass under `dpm test`. Findings folded back into
  the skills: (1) **contract keys are not supported on Canton 3.x** (`damlc`
  rejects `key`); (2) an interface implemented in its own package errors by default
  (`-Wupgrade-interfaces`) — define interfaces in a separate package; (3) creating
  a multi-signatory contract in a script needs `submitMulti`, not `submit`.
- **2026-06-05** — Built a real v1→v2 multi-package **upgrade** (SDK 3.4.11):
  adding an `Optional` field compiles; retyping a field is rejected by the LF
  typechecker. Finding: **package names must be hyphenated lowercase** — dotted
  reverse-DNS names are rejected. `daml-contract-upgrades` → compiler-verified.
- **2026-06-05** — `canton-token-standard` interface/choice/package IDs and the
  `Transfer` record source-verified against docs.sync.global + the splice
  `token-standard/` source. `canton-wallet-integration` dApp SDK API verified
  against the `@canton-network/dapp-sdk` npm package.
