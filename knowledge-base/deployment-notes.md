# Deployment Notes

> Sources:
> - M5 deployment (environment config, LocalNet, CI/CD, testing strategies,
>   Daml package/party management)
> - QuickStart: deploy to DevNet, onboard external parties
> - Node operations: validator onboarding, console, Docker Compose / Helm
>
> Feeds `canton-deployment`. **Drafted — verified against M5 LocalNet (2026-06,
> SDK 3.4.x).**

## Verified: LocalNet (M5)

*"A Docker Compose-based local network that mirrors the Canton Network topology on
your development machine."* Includes **3 participants** (app-provider, app-user,
sv/super-validator) + validators, **PostgreSQL**, and web apps (wallet, SV, scan)
behind NGINX.

Run via cn-quickstart Makefile:

```bash
cd quickstart
make setup    # first-time
make build    # build Daml + backend
make start    # start LocalNet
make stop
```

Ports follow `<role-digit><suffix>`: SV `4xxx`, app-provider `3xxx`, app-user
`2xxx`. Suffix **`901` = Ledger API (gRPC)**, **`975` = JSON API (HTTP)**. Web UIs:
`http://wallet.localhost:2000` (user), `:3000` (provider), `http://sv.localhost:4000`.

Progression: **LocalNet → DevNet → TestNet → MainNet**. Operating a real app means
running a **validator node** in DevNet/TestNet/MainNet.

## Key concepts (to fill / expand)

- **LocalNet** for local dev; **DevNet** for shared testing; the path between them.
- Party allocation/onboarding (incl. external parties).
- **DAR/package management**: upload, vetting, package selection.
- Environment configuration; validator setup basics.
- CI/CD for Daml: build DARs, run Daml Script tests, deploy.

## Mental-model traps (EVM-brain → Canton-correct)

- "Deploy = push bytecode to one chain" → upload DARs to participants + manage
  parties + connect to a synchronizer.
- "One network" → LocalNet/DevNet/MainNet distinctions and validator roles.

## Canonical patterns / snippets (TODO)

- LocalNet bring-up.
- DAR upload + party allocation.
- Minimal CI pipeline.

## Open questions / to verify

- Current LocalNet tooling (cn-quickstart) commands and ports.
