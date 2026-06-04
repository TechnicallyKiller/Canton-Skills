# AGENTS.md — Canton Dev Skills

This file is the universal companion read by agents that support the `AGENTS.md`
convention (Cursor, Codex, Gemini, Copilot, and others). It tells any coding agent
how to use this repository's skills when working on a Canton / Daml project.

## What this repo provides

A catalog of focused [agent skills](skills/) for building on the Canton Network.
Each skill lives in `skills/<name>/SKILL.md` with YAML frontmatter (`name`,
`description`) and a markdown body. Agents that support Anthropic-style skills load
them natively; agents that don't can read the relevant `SKILL.md` directly.

## Operating rules for Canton work

When a task involves Canton, Daml, Splice, Canton Coin, or the Ledger API, apply
these before writing code — they are the defaults LLMs most often get wrong:

1. **No global ledger.** Never assume world-readable state or a single queryable
   chain. Model who can *see* each contract via signatories and observers first.
2. **Authorization is structural.** A choice can only be exercised by its declared
   controller; a contract can only be created with the authorization of all its
   signatories. Design the authorization graph before the data.
3. **Privacy by subtransaction.** Each party learns only the parts of a
   transaction they are party to. Don't leak data by over-broad observers.
4. **Daml is functional & contract-based**, not imperative storage. State changes
   are archive-old + create-new, not in-place mutation.
5. **Prefer the Token Standard** for anything asset/payment-shaped instead of
   hand-rolling balances.
6. **Pin versions.** Daml SDK and Canton releases move fast; state the version you
   target and keep generated code consistent with it.

## Skill selection

| If the task is about… | Use skill |
|-----------------------|-----------|
| "Is this even how Canton works?" / starting out | `canton-mental-models` |
| Writing/reviewing `.daml` templates & choices | `daml-language` |
| Who-can-do-what / multi-party workflows | `daml-authorization-patterns` |
| Testing Daml | `daml-testing` |
| Calling the ledger from an app (gRPC/JSON) | `canton-ledger-api` |
| App structure, backend/frontend, PQS, SDKs | `canton-app-architecture` |
| Tokens, transfers, Canton Coin, Amulet | `canton-token-standard` |
| Wallets, dApp SDK, exchanges | `canton-wallet-integration` |
| LocalNet/DevNet, parties, DARs, CI/CD | `canton-deployment` |
| Upgrading deployed contracts | `daml-contract-upgrades` |
| Security, monitoring, prod operations | `canton-production-ops` |

Skills compose — e.g. building a payment app pulls in `canton-mental-models` +
`daml-language` + `daml-authorization-patterns` + `canton-token-standard`.

## Canonical sources

All skill content traces to [docs.canton.network](https://docs.canton.network)
(machine index: [llms.txt](https://docs.canton.network/llms.txt)),
[Splice docs](https://docs.sync.global), and the
[`cn-quickstart`](https://github.com/digital-asset/cn-quickstart) reference. When
in doubt, verify against those rather than guessing.
