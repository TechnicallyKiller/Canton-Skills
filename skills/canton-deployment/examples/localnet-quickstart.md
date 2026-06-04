# Bring up LocalNet and deploy (cn-quickstart)

LocalNet is a Docker Compose network mirroring Canton topology: 3 participants
(app-provider, app-user, sv) + validators, PostgreSQL, web apps behind NGINX.
Targets Daml SDK 3.4.x. Confirm make targets against the current cn-quickstart.

## 1. Start

```bash
git clone https://github.com/digital-asset/cn-quickstart
cd cn-quickstart/quickstart
make setup    # first-time setup
make build    # build the DAR + backend
make start    # start LocalNet
```

## 2. Endpoints

| Service | Pattern | Example |
|---------|---------|---------|
| Ledger API (gRPC) | `<role><901>` | app-provider `3901`, app-user `2901` |
| JSON API (HTTP)   | `<role><975>` | app-provider `3975`, app-user `2975` |
| Wallet UI (user)  | — | http://wallet.localhost:2000 |
| Wallet UI (provider) | — | http://wallet.localhost:3000 |
| SV UI             | — | http://sv.localhost:4000 |

Roles: SV `4xxx`, app-provider `3xxx`, app-user `2xxx`.

## 3. Verify and deploy your DAR

```bash
# JSON API health (app-provider)
curl http://localhost:3975/v2/livez

# `make build` builds + uploads the quickstart DAR. For your own DAR, build then
# upload to the target participant and allocate parties (see m5 package mgmt docs).
dpm build
```

## 4. Stop

```bash
make stop
```

## Next

- Promote LocalNet → DevNet → TestNet → MainNet; run a validator node in shared
  environments.
- New choices/templates require **all** stakeholder validators to upload + vet the
  DAR before they're usable.
