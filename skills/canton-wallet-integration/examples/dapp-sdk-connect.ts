// Connect a dApp to a Canton wallet and submit a command with the dApp SDK.
// Package: @canton-network/dapp-sdk. Targets Daml SDK 3.4.x — verify the SDK API
// against the current release before relying on it.
import * as sdk from '@canton-network/dapp-sdk'

export async function connectAndPing(): Promise<void> {
  // init() registers adapters and restores a prior session WITHOUT opening the
  // wallet picker. Call it early in the app lifecycle.
  await sdk.init()

  // Open the wallet picker / connect. result.isConnected is true on success.
  const result = await sdk.connect()
  if (!result.isConnected) {
    throw new Error('wallet not connected')
  }

  // The user's primary party (Canton wallets manage PARTIES, not addresses).
  const accounts = await sdk.listAccounts()
  const primaryParty = accounts.find((w) => w.primary)?.partyId
  if (!primaryParty) throw new Error('no primary party')

  // prepareExecute handles the full lifecycle: prepare -> user approval/signature
  // -> submit to the ledger. Template ids use the symbolic #Package:Module:Template
  // form so they survive package upgrades.
  await sdk.prepareExecute({
    commands: [
      {
        CreateCommand: {
          templateId: '#AdminWorkflows:Canton.Internal.Ping:Ping',
          createArguments: {
            id: `ping-${Date.now()}`,
            initiator: primaryParty,
            responder: primaryParty,
          },
        },
      },
    ],
  })
}

// For raw CIP-103 provider access (EIP-1193-style), use:
//   const provider = sdk.getConnectedProvider()  // or null if not connected
