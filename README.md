# @zerodev/intent

Chain Abstraction SDK for ZeroDev, built on top of @zerodev/sdk.

## Installation

```bash
bun add @zerodev/intent
```

## Usage

```typescript
import { createIntentClient } from '@zerodev/intent'
import { mainnet, polygon, base, optimism } from 'viem/chains'

const client = createIntentClient({
  chain: mainnet,
  bundlerTransport: http(),
  // Optional transports
  intentTransport: http(),
  relayerTransport: http(),
})

// Flow 1: Direct send
const result1 = await client.sendUserIntent({
  calls: [{
    to: '0x...',
    value: 0n,
    data: '0x...'
  }],
  inputTokens: [{
    address: '0x...',
    chainId: 1
  }],
  outputTokens: [{
    address: '0x...',
    amount: 900000n,
    chainId: 10
  }]
})

// Flow 2: Prepare then send
// First prepare the intent
const intent = await client.prepareUserIntent({
  calls: [{
    to: '0x...',
    value: 0n,
    data: '0x...'
  }],
  inputTokens: [{
    address: '0x...',
    chainId: 1
  }],
  outputTokens: [{
    address: '0x...',
    amount: 900000n,
    chainId: 10
  }]
})

// Then send the prepared intent
const result2 = await client.sendUserIntent({
  intent
})

// Wait for the intent to be opened (works for both flows)
const openReceipt = await client.waitForUserIntentOpenReceipt({
  uiHash: result1.uiHash, // or result2.uiHash
});

// Wait for the intent to be executed (works for both flows)
const executionReceipt = await client.waitForUserIntentExecutionReceipt({
  uiHash: result1.uiHash, // or result2.uiHash
});

// Get consolidated account balances
// Using connected account
const balances1 = await client.getCAB({
  networkType: "mainnet" // or "testnet"
})

// Using specific address with network filter
const balances2 = await client.getCAB({
  accountAddress: "0x...",
  tokenTickers: ["ETH", "USDC"],
  networks: [mainnet.id, polygon.id] // Using viem chain IDs
})

// Example response structure
const balances = await client.getCAB({
  networks: [base.id, optimism.id],
  tokenTickers: ["USDC"]
})
// Response:
{
  tokens: [{
    ticker: "USDC",
    amount: "0x1234...", // Normalized total amount across chains (using decimal field)
    decimal: 6,          // Lowest decimal among all chains (for normalization)
    breakdown: [{
      chainId: 8453,     // base chain ID
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      amount: "0x0abc..."  // Original amount with chain-specific decimals (6)
    }, {
      chainId: 10,       // optimism chain ID
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      amount: "0x0def..."  // Original amount with chain-specific decimals (6)
    }]
  }]
}
```

## Features

- Extends ZeroDev's KernelClient with chain abstraction capabilities
- Cross-chain user intent preparation and execution
  - Direct send flow
  - Prepare-then-send flow
- Intent status tracking
- Consolidated account balances across chains
  - Filter by network type (mainnet/testnet)
  - Filter by specific networks using viem chains
  - Filter by token tickers
  - Automatic amount normalization to lowest decimal
    - Root level amount is normalized across chains
    - Breakdown amounts preserve chain-specific decimals
    - Handles tokens with different decimals (e.g., USDC 6 on Base vs 18 on BNB)
- Type-safe API
- Built with Bun and TypeScript

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Lint
bun run lint

# Format
bun run format
```

## License

MIT
