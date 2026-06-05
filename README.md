# Canton Dev Skills

Portable, production-grade **agent skills** for building on the
[Canton Network](https://docs.canton.network) with Daml. One source of truth,
installable into **Claude Code, Cursor, Gemini CLI, Codex, GitHub Copilot**, and
30+ other agents via the open [`skills`](https://github.com/vercel-labs/skills) CLI.

> These skills don't just paste documentation into your agent. They **correct the
> mental-model mistakes** an LLM makes on Canton by default — treating it like an
> EVM chain — and encode the Daml idioms, authorization rules, and ledger-API
> patterns that make generated code actually compile and preserve privacy.

## Why this exists

Canton is **not "a blockchain with different syntax."** Agents trained mostly on
Ethereum/Solidity reliably get four things wrong:

1. **Privacy-first** — there is no global, world-readable state.
2. **Distributed state** — each party sees only its own subtransaction view; there
   is no single queryable ledger.
3. **Targeted consensus** — consensus runs only across the parties to a
   transaction, not the whole network.
4. **Structural authorization** — who can do what is declared at compile time in
   Daml (signatories / observers / controllers) and enforced by the protocol.

Every skill in this catalog is built to push the agent off the wrong defaults and
onto the correct Canton model.

## Install

```bash
# Install the whole catalog into the current project (auto-detects your agent)
npx skills add TechnicallyKiller/Canton-Skills

# Global install, specific agents only
npx skills add TechnicallyKiller/Canton-Skills -g --agent claude-code cursor gemini

# Install a single skill
npx skills add TechnicallyKiller/Canton-Skills/skills/daml-language
```

The CLI installs into each agent's native location (`.claude/skills/`,
`.cursor/skills/`, `~/.gemini/skills/`, `.agents/skills/`, …) from this single
repo, so updates flow to every tool at once. See [AGENTS.md](AGENTS.md) for the
cross-agent contract.

## Skill catalog

Skills are intentionally **focused** — narrow, well-triggered, and composable —
rather than one monolith. See [ROADMAP.md](ROADMAP.md) for build status.

**Verification legend** (so you know how far to trust each skill today):
✅ **compiler-verified** — examples build/run on Daml SDK 3.4.11 ·
🔎 **source-verified** — identifiers checked against Splice/npm source ·
📄 **docs-verified** — authored from current canonical Canton docs, not yet run on a
live system.

| Skill | What it does | Status |
|-------|--------------|--------|
| [`canton-mental-models`](skills/canton-mental-models) | Corrects EVM-brain defaults; the foundation every other skill builds on | ✅ |
| [`daml-language`](skills/daml-language) | Write Daml: templates, choices, interfaces, stdlib, time (keys are *not* supported on Canton 3.x) | ✅ |
| [`daml-authorization-patterns`](skills/daml-authorization-patterns) | Signatory/observer/controller modeling and multi-party design patterns | ✅ |
| [`daml-testing`](skills/daml-testing) | Daml Script test suites, ledger assertions, multi-party scenarios | ✅ |
| [`canton-ledger-api`](skills/canton-ledger-api) | gRPC + JSON Ledger API, codegen bindings, command dedup, disclosure | 📄 |
| [`canton-app-architecture`](skills/canton-app-architecture) | App topology: backend, frontend, PQS read model, SDK selection, observability | 📄 |
| [`canton-token-standard`](skills/canton-token-standard) | Token Standard (CIP-0056), transfers, Canton Coin / Amulet, Splice | 🔎 |
| [`canton-wallet-integration`](skills/canton-wallet-integration) | dApp SDK, Wallet SDK, Wallet Gateway, exchange integration | 🔎 |
| [`canton-deployment`](skills/canton-deployment) | LocalNet → DevNet, party & package management, CI/CD | 📄 |
| [`daml-contract-upgrades`](skills/daml-contract-upgrades) | Smart-contract upgrades: compatibility, package naming/selection | 📄 |
| [`canton-production-ops`](skills/canton-production-ops) | Security, compliance, performance, error handling, monitoring | 📄 |

> Honesty note: Phase-1 modeling skills (✅) are proven against the real compiler —
> verifying them caught three Canton-3.x gotchas now baked into the skills. The 📄
> skills are accurate to current docs but not yet exercised end-to-end on LocalNet;
> that hardening is in progress.

## How a skill is built here

Each skill is authored from a distilled, source-linked **knowledge base** rather
than from memory, so claims trace back to canonical Canton docs:

```
knowledge-base/   docs understanding  →  distilled, source-mapped notes
      │
      ▼
skills/<name>/    SKILL.md (frontmatter + body) + references/ + examples/
      │
      ▼
evals/            trigger + behavior evals (does it fire? does it help?)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring workflow and quality bar.

## License

MIT — see [LICENSE](LICENSE).

Built with the Anthropic `skill-creator` conventions. Canton, Daml, Splice, and
Canton Coin are projects of Digital Asset and the Global Synchronizer Foundation;
this is an independent, community skill catalog.
