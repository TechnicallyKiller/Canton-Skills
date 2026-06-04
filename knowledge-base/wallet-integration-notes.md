# Wallet & Integration Notes

> Sources:
> - Integrations overview, integration patterns
> - dApp SDK (CIP-103 dApp API, adapters/discovery, best practices)
> - Wallet SDK, Wallet Gateway (APIs, signing providers)
> - Exchange integration; "Canton vs Web3 wallets"
> - Splice wallet kernel <https://github.com/hyperledger-labs/splice-wallet-kernel>
>
> Feeds `canton-wallet-integration`. **Drafted — verified against integrations
> dApp SDK usage + wallet guidance (2026-06, SDK 3.4.x).**

## Verified: dApp SDK (`@canton-network/dapp-sdk`)

```typescript
import * as sdk from '@canton-network/dapp-sdk'

await sdk.init()                       // register adapters, restore session (no picker)
const result = await sdk.connect()     // result.isConnected
const provider = sdk.getConnectedProvider()  // raw CIP-103 provider or null

// Submit a Daml command — handles prepare → approval/signature → submit:
const primaryParty = (await sdk.listAccounts()).find(w => w.primary)?.partyId
await sdk.prepareExecute({
  commands: [{ CreateCommand: { templateId: '#Pkg:Module:Template',
    createArguments: { /* ... */ } } }]
})
```

Two layers: high-level SDK (recommended) or the lower-level **CIP-103** Provider API
(EIP-1193-style).

## Verified: how Canton wallets differ from Web3

- *"Creating parties has a cost and creates state on the validator node"* — **not**
  for ephemeral deposit addresses. Aim for **one party per key pair** (wallets);
  exchanges use one/few vault parties **+ memo tags** for deposits.
- Wallets connect to the **specific validator nodes hosting their parties**, not a
  universal RPC. Privacy: data shared need-to-know only.
- Party id format: **`name::fingerprint`** (fingerprint = sha256 of pubkey prefixed
  with `12`).

## Verified: external party signing & SDKs

- **Wallet SDK** `@canton-network/wallet-sdk`; dApp SDK is the lighter browser
  bundle. Shared core packages.
- External signing = **prepare → sign → submit**; offline via `signTransactionHash()`.
  Topology needs 3 txns: **PartyToParticipant**, **ParticipantToParty**, **KeyToParty**.
- **Proof of transfer**: parse transaction trees; events `lockedHoldingsChange` /
  `unlockedHoldingsChange`; labels Mint/MergeSplit/TransferOut/TransferIn.

## Verified: integrator requirements

Support **CIP-0056** token standard, Canton Coin + USDCx, **memo tags**, UTXO
consolidation. Operate a **validator node** in DevNet/TestNet/MainNet. Optional:
Canton Coin pre-approvals (1-step transfers), **CIP-0103** dApp compliance.

## Key concepts (to fill / expand)

- **dApp SDK**: browser SDK implementing the CIP-103 dApp API, multi-transport;
  wallet discovery and connection.
- **Wallet SDK**: for wallet providers and exchanges integrating with Canton +
  Splice Token Standard.
- **Wallet Gateway**: signing providers, APIs, configuration.
- Exchange integration: node operations + SDK.
- Proof of transfer; external party onboarding.

## Mental-model traps (EVM-brain → Canton-correct)

- "MetaMask-style account = address" → Canton wallets manage parties + signing,
  differ from Web3 wallets; visibility/privacy differ.
- "Sign a tx hash like EVM" → external signing flow (hashing/onboarding/topology)
  is Canton-specific.

## Canonical patterns / snippets (TODO)

- Connect a dApp to a wallet via dApp SDK.
- Initiate a Token Standard transfer from a wallet.

## Open questions / to verify

- Current dApp/Wallet SDK package names + CIP-103 status.
