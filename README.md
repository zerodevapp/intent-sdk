# @zerodev/cab-sdk

Chain Abstraction SDK for ZeroDev, built on top of @zerodev/sdk.

## Installation

```bash
bun add @zerodev/cab-sdk
```

## Usage

```typescript
import { createCabClient } from '@zerodev/cab-sdk'
import { mainnet } from 'viem/chains'

const client = createCabClient({
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
    amount: 1000000n,
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
    amount: 1000000n,
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

// Check intent status (works for both flows)
const status = await client.getUserIntentStatus({
  uiHash: result1.uiHash // or result2.uiHash
})
```

## Features

- Extends ZeroDev's KernelClient with chain abstraction capabilities
- Cross-chain user intent preparation and execution
  - Direct send flow
  - Prepare-then-send flow
- Intent status tracking
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
