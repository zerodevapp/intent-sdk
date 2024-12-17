# @zerodev/intent

Chain Abstraction SDK for ZeroDev, built on top of @zerodev/sdk.

## Installation

```bash
bun add @zerodev/intent
```

## Usage

```typescript
import { createIntentClient } from '@zerodev/intent'
import { mainnet } from 'viem/chains'

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
