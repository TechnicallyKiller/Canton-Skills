# Source Map: Canton Docs → Skills

Maps the Canton Network documentation (per
[llms.txt](https://docs.canton.network/llms.txt)) onto this catalog's skills, so
authoring has a clear provenance trail. Doc areas are the learning modules
**M1–M7** plus deep dives, references, and the Splice / integrations docs.

## Learning modules → skills

| Module | Docs content | Skill(s) |
|--------|--------------|----------|
| **M1 Understanding Canton** | Mental models, development stack, how Canton differs | `canton-mental-models` |
| **M2 Blockchain dev migration** | Ethereum comparison, concept translation, multi-party workflows, privacy differences | `canton-mental-models` |
| **M3 Daml fundamentals** | Language, FP, templates, choices, contract keys, interfaces, authorization, design patterns, testing, stdlib, time | `daml-language`, `daml-authorization-patterns`, `daml-testing` |
| **M4 Building applications** | Architecture, backend/frontend, SDKs/APIs, JSON Ledger API, observability, PQS, Canton Coin | `canton-app-architecture`, `canton-ledger-api`, `canton-token-standard` |
| **M5 Deployment** | Env config, LocalNet, CI/CD, testing strategies, Daml package/party management | `canton-deployment` |
| **M6 Smart-contract upgrades** | Compatibility, limitations, deployment, package naming/selection, testing, first upgrade | `daml-contract-upgrades` |
| **M7 Production operations** | Security, compliance, performance, error handling, Canton Coin preapprovals, package management | `canton-production-ops` |

## Cross-cutting docs → skills

| Docs area | Skill(s) |
|-----------|----------|
| Architecture: ledger model, privacy model, two-layer consensus, trust model | `canton-mental-models` |
| Deep dives: authorization, multi-party composition, contract disclosure, command deduplication | `daml-authorization-patterns`, `canton-ledger-api` |
| Deep dives: external signing (hashing, onboarding, topology, transactions) | `canton-ledger-api`, `canton-deployment` |
| Reference: gRPC Ledger API, JSON API, Java bindings, codegen | `canton-ledger-api` |
| Reference: Daml language ref, Daml-LF, standard library | `daml-language` |
| AppDev QuickStart ([cn-quickstart](https://github.com/digital-asset/cn-quickstart)) | `canton-app-architecture`, `canton-deployment` |
| Token Standard, tokenomics, Canton Coin | `canton-token-standard` |
| Splice ([docs.sync.global](https://docs.sync.global)), Amulet, validator APIs | `canton-token-standard`, `canton-wallet-integration` |
| Integrations: dApp SDK, Wallet SDK, Wallet Gateway, exchange integration | `canton-wallet-integration` |
| Node operations: console, deployment, monitoring, DR, KMS, pruning | `canton-production-ops`, `canton-deployment` |

## Canonical entry points

- Docs root: <https://docs.canton.network>
- Machine index: <https://docs.canton.network/llms.txt>
- Splice docs: <https://docs.sync.global>
- Quickstart repo: <https://github.com/digital-asset/cn-quickstart>
- Splice reference apps: <https://github.com/hyperledger-labs/splice>
