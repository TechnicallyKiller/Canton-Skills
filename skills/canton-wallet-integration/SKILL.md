---
name: canton-wallet-integration
description: >-
  Integrate wallets and exchanges with Canton using the dApp SDK, Wallet SDK, and
  Wallet Gateway. Use whenever a task involves connecting a dApp to a wallet, wallet
  discovery, the @canton-network/dapp-sdk or @canton-network/wallet-sdk packages,
  the CIP-103 dApp API, prepareExecute, external party signing (prepare/sign/submit,
  topology transactions), proof-of-transfer parsing, or exchange integration / memo
  tags. Triggers on "let users sign Canton transactions from their wallet,"
  "connect my dApp to a Canton wallet," "integrate Canton Coin into my exchange,"
  or "onboard an external party with their own key." Corrects MetaMask/Web3-wallet
  assumptions. Pairs with canton-token-standard for the value-transfer logic.
---

# Canton Wallet Integration

Connect user-facing wallets and exchanges to Canton. The **dApp SDK** handles
discovery/connection and command submission in the browser; the **Wallet SDK** and
**Wallet Gateway** serve wallet providers/exchanges and signing. Canton wallets are
**not MetaMask** — they manage *parties* and participant-side signing, with
Canton-specific external-signing flows.

Targets Daml SDK 3.4.x.

## dApp SDK (`@canton-network/dapp-sdk`)

```typescript
import * as sdk from '@canton-network/dapp-sdk'

await sdk.init()                    // register adapters, restore session (no picker)
const result = await sdk.connect()  // result.isConnected
const provider = sdk.getConnectedProvider()  // raw CIP-103 provider, or null

// Submit a command — prepareExecute does prepare → user approval/signature → submit
const primaryParty = (await sdk.listAccounts()).find(w => w.primary)?.partyId
await sdk.prepareExecute({
  commands: [{
    CreateCommand: {
      templateId: '#MyPkg:MyModule:MyTemplate',
      createArguments: { /* ... */ }
    }
  }]
})
```

Two layers: the high-level SDK (recommended) or the lower-level **CIP-103** Provider
API (EIP-1193-style). Use the SDK unless you need raw provider control. Other
module-level methods: `disconnect()`, `onTxChanged()` (real-time updates).

> The `@canton-network/dapp-sdk` / `@canton-network/wallet-sdk` packages are
> **pre-1.0 and may introduce breaking changes** — pin the version and check the
> changelog when upgrading.

## How Canton wallets differ from Web3 (design implications)

- **Parties cost validator state** — they are *not* ephemeral deposit addresses.
  Aim for **one party per key pair** (wallets); exchanges use **one/few vault
  parties + memo tags** for deposit attribution.
- Wallets connect to the **specific validator(s) hosting their parties**, not a
  universal RPC endpoint. Data is shared need-to-know (privacy-first).
- Party id format: **`name::fingerprint`** (fingerprint = sha256 of the public key,
  prefixed with `12`).

## External party signing

Keys off the participant → **prepare → sign → submit** (online or offline; offline
uses `signTransactionHash()`). Onboarding topology needs three transactions:
**PartyToParticipant** (party agrees to hosting), **ParticipantToParty** (validator
confirms), **KeyToParty** (public-key association).

## Proof of transfer & wallet display

Parse transaction trees with the Wallet SDK: events expose `lockedHoldingsChange`
(pending/locked UTXOs) and `unlockedHoldingsChange` (available); labels classify
operations (Mint / MergeSplit / TransferOut / TransferIn) for human-readable
history.

## Integrator requirements

Support **CIP-0056** token standard, **Canton Coin + USDCx**, **memo tags**, and
**UTXO consolidation**. Operate a **validator node** in DevNet/TestNet/MainNet.
Optional: Canton Coin **pre-approvals** (1-step transfers), **CIP-0103** dApp
compliance, multi-hosting for resilience.

## Anti-patterns to correct

| ❌ Wrong-by-default (Web3 brain) | ✅ Canton-correct |
|--------------------------------|-------------------|
| "Wallet = an address like MetaMask" | Wallet manages parties + participant-side signing |
| Generate a fresh address per deposit | Parties cost state; exchanges use vault party + **memo tags** |
| Sign a raw tx hash EVM-style | prepare → sign → submit; topology onboarding for external parties |
| Connect to a universal RPC | Connect to the validator(s) hosting the party |
| Assume public balances | Holdings are privacy-scoped; parse tx trees for history |

## Examples

[`examples/dapp-sdk-connect.ts`](examples/dapp-sdk-connect.ts) — connect + submit
with the dApp SDK.

## References

- KB: [`wallet-integration-notes.md`](../../knowledge-base/wallet-integration-notes.md)
- Docs: [dApp building overview](https://docs.canton.network/integrations/dapp-building-overview),
  [dApp SDK usage](https://docs.canton.network/integrations/dapp-sdk/usage),
  [wallet guidance](https://docs.canton.network/integrations/wallet/guidance),
  [wallet gateway usage](https://docs.canton.network/integrations/wallet-gateway/usage),
  [exchange integration](https://docs.canton.network/integrations/wallet/exchange-integration);
  [splice-wallet-kernel](https://github.com/hyperledger-labs/splice-wallet-kernel).

---

> **Stage: draft.** Package `@canton-network/dapp-sdk` and its methods
> (`connect`/`listAccounts`/`prepareExecute`/`disconnect`/`onTxChanged`) verified on
> npm + integrations docs (2026-06); pre-1.0. Before `stable`: run against a live
> wallet and add evals.
