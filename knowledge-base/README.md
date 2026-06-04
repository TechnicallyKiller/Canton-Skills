# Knowledge Base

The **docs-understanding layer**. Before any skill is written, the relevant Canton
documentation is distilled here into source-linked notes. Skills are authored
*from these notes*, so every claim in a skill traces back to a canonical source.

## Why a separate layer

- **Citations.** A skill should never assert Canton behavior from an LLM's prior;
  it should reflect the docs. These notes are where that grounding lives.
- **Reuse.** Several skills draw on the same concepts (privacy, authorization).
  Distill once here, reference from many skills.
- **Trap capture.** Each note records the **mental-model traps** — what an
  EVM/Solidity-trained model wrongly assumes — which become each skill's
  anti-patterns (the highest-value content).

## Files

| Note | Feeds skills | Primary sources |
|------|--------------|-----------------|
| [`canton-core-concepts.md`](canton-core-concepts.md) | `canton-mental-models`, all | Overview, ledger model, privacy, consensus |
| [`daml-language-notes.md`](daml-language-notes.md) | `daml-language`, `daml-testing` | M3 Daml fundamentals, language ref, stdlib |
| [`authorization-notes.md`](authorization-notes.md) | `daml-authorization-patterns` | M3 authorization, deep dives |
| [`ledger-api-notes.md`](ledger-api-notes.md) | `canton-ledger-api` | gRPC + JSON API ref, Java bindings |
| [`app-architecture-notes.md`](app-architecture-notes.md) | `canton-app-architecture` | M4 building applications, PQS |
| [`token-standard-notes.md`](token-standard-notes.md) | `canton-token-standard` | Token standard, Splice/Amulet |
| [`wallet-integration-notes.md`](wallet-integration-notes.md) | `canton-wallet-integration` | dApp SDK, Wallet SDK, gateway |
| [`deployment-notes.md`](deployment-notes.md) | `canton-deployment` | M5 deployment, party/package mgmt |
| [`upgrades-notes.md`](upgrades-notes.md) | `daml-contract-upgrades` | M6 smart-contract upgrades |
| [`production-ops-notes.md`](production-ops-notes.md) | `canton-production-ops` | M7 production operations, node ops |

See [`source-map.md`](source-map.md) for the full docs → skill mapping.

## Note format

Each note follows:

```markdown
# <Area>

> Sources: <canonical doc links>

## Key concepts
## Mental-model traps (EVM-brain → Canton-correct)
## Canonical patterns / snippets (version-pinned)
## Open questions / to verify
```
