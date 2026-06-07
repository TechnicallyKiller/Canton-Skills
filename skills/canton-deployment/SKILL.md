---
name: canton-deployment
description: >-
  Deploy and run Canton/Daml applications across environments. Use whenever a task
  involves running LocalNet, the cn-quickstart make targets, Docker Compose for
  Canton, promoting through DevNet/TestNet/MainNet, allocating/onboarding parties,
  uploading/vetting DARs and package management, validator setup, or CI/CD for a
  Daml project. Triggers on "run Canton locally," "start LocalNet," "deploy my Daml
  app to DevNet," "upload a DAR," "onboard a party," or "set up CI for my Daml
  build." Corrects the "deploy = push bytecode to one chain" assumption. For
  contract upgrades use daml-contract-upgrades; for prod hardening use
  canton-production-ops.
---

# Canton Deployment

Get a Canton app running and promote it across environments. Deployment is not
"push bytecode to one chain": you upload **DARs** to participants, allocate and
onboard **parties**, connect to a **synchronizer**, and manage package vetting —
starting on **LocalNet**, then **DevNet → TestNet → MainNet**.

Targets Daml SDK 3.4.x. Canonical scaffold:
[cn-quickstart](https://github.com/digital-asset/cn-quickstart).

## LocalNet

A **Docker Compose** network mirroring Canton topology locally: **3 participants**
(app-provider, app-user, sv/super-validator) + validators, PostgreSQL, and web
apps (wallet, SV, scan) behind NGINX.

```bash
cd quickstart
make setup    # first-time setup
make build    # build Daml + backend
make start    # start LocalNet
make stop     # stop
```

Ports: SV `4xxx`, app-provider `3xxx`, app-user `2xxx`. Suffix **`901` = Ledger API
(gRPC)**, **`975` = JSON API (HTTP)** — e.g. health at `http://localhost:3975/v2/livez`.
Web UIs at `http://wallet.localhost:2000` (user), `:3000` (provider),
`http://sv.localhost:4000`.

Splice images are pulled from **`ghcr.io/digital-asset/decentralized-canton-sync`**
(public — no credentials needed; auth errors usually mean a Docker config issue, see
below).

### LocalNet gotchas (verified bringing it up on Windows/WSL, 2026-06)

- **`make setup` is interactive** (a Gradle wizard prompting for env vars) — it can't
  be scripted. To automate/CI, skip it and write `quickstart/.env.local` directly:
  `OBSERVABILITY_ENABLED=false`, `AUTH_MODE=shared-secret`,
  `PARTY_HINT=<org>-<role>-<n>`, `TEST_MODE=off`.
- **First `make start` often reports "container canton is unhealthy"** even when
  Canton is fine — the health check races gRPC readiness. **Wait ~60s and re-run
  `make start`**; it succeeds.
- **Windows: CRLF breaks the shell scripts.** Cloned `gradlew`/`*.sh` get `\r`, so
  WSL runs `/bin/sh^M` → exit 126. Fix first:
  `find . -name "*.sh" -o -name gradlew | xargs sed -i 's/\r//'`.
- **WSL + Docker Desktop: the credential helper breaks builds.** `~/.docker/config.json`
  has `"credsStore": "desktop.exe"`, which isn't on the WSL PATH, so `docker compose
  build` fails even for public images. Fix: `printf '{"auths": {}}' > ~/.docker/config.json`.

## Environment progression

**LocalNet → DevNet → TestNet → MainNet.** Operating a real app means running a
**validator node** in the shared environments (not just LocalNet). Keep config
(parties, package set, synchronizer connection) reproducible per environment.

## Parties & packages

- **Parties** are allocated/onboarded per environment and **cost state on the
  validator** — don't treat them as throwaway addresses. External parties onboard
  via the topology flow (PartyToParticipant / ParticipantToParty / KeyToParty).
- **DARs** are uploaded to participants and **vetted** by stakeholders. A new choice
  or template only becomes usable once *all* stakeholder validators have uploaded
  and vetted the DAR — coordinate rollouts.

## CI/CD

Build the DAR (`dpm build`), run Daml Script tests (`dpm test`), then deploy
(upload DAR + allocate parties) to the target environment. Pin the SDK in
`daml.yaml`; keep DAR builds reproducible so vetting hashes match across nodes.

## Anti-patterns to correct

| ❌ Wrong-by-default | ✅ Canton-correct |
|--------------------|-------------------|
| "Deploy = one bytecode push" | Upload DARs + onboard parties + connect a synchronizer, per environment |
| "One global network" | LocalNet / DevNet / TestNet / MainNet + validator roles |
| Spin up parties freely like EVM addresses | Parties cost validator state; allocate deliberately |
| Upload v2 DAR to one node and expect new choices to work | All stakeholder validators must upload + vet first |
| Non-reproducible DAR builds | Pin SDK; reproducible builds so vetting hashes align |

## Hand-offs

Upgrading deployed contracts → [`daml-contract-upgrades`](../daml-contract-upgrades).
Production hardening/monitoring → [`canton-production-ops`](../canton-production-ops).
App structure → [`canton-app-architecture`](../canton-app-architecture).

## Examples

[`examples/localnet-quickstart.md`](examples/localnet-quickstart.md) — bring up
LocalNet and deploy with cn-quickstart.

## References

- KB: [`deployment-notes.md`](../../knowledge-base/deployment-notes.md)
- Docs: [LocalNet](https://docs.canton.network/appdev/modules/m5-localnet-development),
  [deployment progression](https://docs.canton.network/appdev/modules/m5-deployment-progression),
  [manage Daml packages](https://docs.canton.network/appdev/modules/m5-manage-daml-packages),
  [CI/CD](https://docs.canton.network/appdev/modules/m5-ci-cd-integration).

---

> **Stage: draft.** Verified against M5 LocalNet (SDK 3.4.x). Before `stable`:
> confirm current cn-quickstart make targets/ports and add evals.
