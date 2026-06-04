# Evals

Per-skill evaluation sets, following the Anthropic `skill-creator` workflow. Each
skill gets a subfolder with two kinds of evals:

```
evals/<skill-name>/
├── trigger-evals.json     # does the description fire on the right prompts?
└── behavior-evals.json    # does the skill measurably improve the output?
```

## Trigger evals

20 realistic queries — ~10 should-trigger, ~10 near-miss should-not-trigger.
Run through `skill-creator`'s description optimizer until triggering is reliable
without false positives. Schema:

```json
[
  { "query": "realistic user prompt with concrete detail", "should_trigger": true },
  { "query": "near-miss that should NOT fire this skill", "should_trigger": false }
]
```

The valuable negatives are **near-misses** — prompts that share keywords with the
skill but actually need a different skill (e.g. a "token" prompt that's really
about wallet integration, not the token standard).

## Behavior evals

Realistic task prompts run **with vs. without** the skill, reviewed side by side.
For Canton, good assertions are objective and check the things agents get wrong by
default:

- Generated Daml **compiles** against the pinned SDK.
- Authorization is **structural** (no `msg.sender`/`require` permission guards).
- **Privacy** preserved (no over-broad observers).
- Correct vocabulary (synchronizer, signatory, controller, archive+create).

## Status

No eval sets committed yet — skills are at `skeleton` stage. Add `trigger-evals.json`
first (cheap, high-value for triggering) when a skill reaches `draft`. See
[../CONTRIBUTING.md](../CONTRIBUTING.md) and [../ROADMAP.md](../ROADMAP.md).
