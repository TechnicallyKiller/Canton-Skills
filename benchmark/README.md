# Behavior Benchmark: does the skill make the Daml better?

A controlled, **compile-verified** test of whether `canton-dev-skills` improves the
Daml an LLM generates for Canton — not whether the skill *triggers*, but whether
its **content** produces correct code.

## Method

- **Same task, same model, same toolchain.** The only variable is whether the
  `canton-mental-models` + `daml-language` skills are in context.
- **Model:** Claude Sonnet (representative of what most agents/devs run).
- **Task:** *"A bank issues an Account to an owner; each account has a **unique
  account number** per owner, a Decimal balance, Deposit/Withdraw, plus a Daml
  Script test. Target Canton / Daml SDK 3.4.x."*
- **Scoring:** compile each generated file with `dpm build` on **Daml SDK 3.4.11**.
  Pass = builds.
- **Runs:** 3 per arm.

The "unique account number" is a deliberate trap: it strongly tempts an LLM toward
Daml-2.x **contract keys** (`key`/`maintainer`) — which **Canton 3.x does not
support**.

## Result

| Arm | Compiled | Used contract keys |
|-----|----------|--------------------|
| **Without skill** | **0 / 3** ❌ | 3 / 3 |
| **With skill** | **3 / 3** ✅ | 0 / 3 |

Every without-skill run reached for contract keys and failed; every with-skill run
avoided them and built. The exact failure (`benchmark/examples/without-skill.build.log`):

```
Severity: DsError
Contract keys.
ERROR: Creation of DAR file failed.
```

## The diff (verbatim, see `examples/`)

**Without skill** — reaches for unsupported contract keys:

```daml
    key (owner, accountNumber) : (Party, Text)   -- ❌ not supported on Canton 3.x
    maintainer key._1
```

**With skill** — models the identifier as a field and explains why:

```daml
-- Uniqueness of accountNumber per owner is the bank's responsibility in its
-- create workflow; contract keys are not supported on Canton 3.x.
template Account
  with
    ...
    accountNumber : Text
```

Both arms otherwise produced reasonable Daml (correct `submitMulti` for the
two-signatory create, etc.) — the **skill's content was the single difference
between code that compiles on Canton and code that doesn't.**

## Reproduce

With a Daml SDK 3.4.x toolchain (`dpm`) and an authenticated `claude` CLI:

```bash
# generate with/without the skill in context, then dpm build each, N times
bash .verify/wsl-benchmark.sh sonnet 3
```

(The harness used here runs in WSL; see `.verify/wsl-benchmark.sh`.)

## Honest caveats

- **Small sample (n=3), one task, one model.** The result is consistent and
  compile-verified, but it is a demonstration of one high-value gotcha, not a broad
  statistical claim. Expanding to more tasks (authorization leaks, JSON Ledger API,
  upgrades) and more runs would strengthen it.
- It measures the skill's **content value assuming it is in context** — separate
  from how often the skill auto-*triggers* (see notes in the project README /
  ROADMAP; triggering is high-precision but modest-recall, mitigated by the
  always-on `AGENTS.md` baseline).
- The trap chosen is one the catalog explicitly teaches, so this is a best case.
  It is, however, a *real* and common case — "unique identifier" is everyday
  modeling, and contract keys are the natural (wrong) reach.
