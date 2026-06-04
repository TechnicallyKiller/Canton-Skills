# Contributing & Authoring Guide

How skills in this repo are authored to a production bar. The workflow is
deliberately **docs → knowledge base → skill → eval**, never "write from memory."

## 1. Capture understanding in the knowledge base first

Before touching a `SKILL.md`, distill the relevant Canton docs into
`knowledge-base/<area>-notes.md`. Each note must:

- Link the canonical source page(s) on [docs.canton.network](https://docs.canton.network)
  (use [llms.txt](https://docs.canton.network/llms.txt) to find them) and Splice docs.
- Capture the **mental-model traps** for that area — what an EVM/Solidity-trained
  model assumes that is *wrong* for Canton. These become the skill's anti-patterns.
- Record concrete, **version-pinned** code/config snippets that are known to work.

The knowledge base is the citation layer. If a claim in a skill isn't backed by a
note, it isn't ready.

## 2. Write the skill

Each skill is a folder under `skills/<name>/`:

```
skills/<name>/
├── SKILL.md          # required: frontmatter + body
├── references/       # optional: deep material loaded on demand (>300-line files get a ToC)
├── examples/         # optional: compilable Daml / code samples
└── scripts/          # optional: deterministic helpers the agent runs
```

### Frontmatter

```yaml
---
name: skill-name                # lowercase-hyphenated, matches folder
description: >-
  What it does AND when to use it. This single field is the trigger — make it
  specific and slightly pushy. Name the concrete signals (file types, keywords,
  tasks) that should fire it.
---
```

### Body principles (from `skill-creator`)

- **Progressive disclosure.** Keep `SKILL.md` lean (< ~500 lines). Push long
  reference material into `references/` and point to it; the body is always loaded
  when the skill triggers, so don't bloat it.
- **Explain the *why*.** Don't pile up ALL-CAPS MUSTs. Modern models follow
  reasoning better than rules — say why a pattern matters (usually: privacy,
  authorization, or upgrade safety).
- **Lead with anti-patterns.** The unique value here is correcting wrong defaults.
  Pair each ❌ wrong-by-default with the ✅ Canton-correct version.
- **Examples must compile** against the pinned SDK. A sample that doesn't build is
  worse than none.

## 3. Evaluate with skill-creator

Use Anthropic's `skill-creator` to:

1. **Description / triggering** — generate should-trigger and near-miss
   should-not-trigger queries; run the optimizer until triggering is reliable.
2. **Behavior** — run realistic task prompts with vs. without the skill; review
   outputs side by side; confirm the skill measurably improves Daml/Canton
   correctness (compiles, preserves privacy, correct authorization).

Record eval prompts under `evals/<skill-name>/`. Don't mark a skill `stable` in
[ROADMAP.md](ROADMAP.md) until evals pass.

## 4. Keep it portable

Don't add agent-specific syntax inside `SKILL.md`. The `skills` CLI generates
native formats (Cursor `.mdc`, etc.) from the canonical `SKILL.md`. Anything
Canton-universal that every agent should respect goes in [AGENTS.md](AGENTS.md).

## Style

- Imperative voice ("Model the observer set", not "You should model…").
- Prefer real Daml over pseudocode.
- One skill = one tight concern. If a skill needs an "and", consider splitting it.
