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
  projectId: 'your-project-id',
  chain: mainnet,
  // ... other KernelClient options
})

// Bridge tokens across chains
const bridgeResult = await client.actions.bridgeTokens({
  sourceToken: '0x...',
  destinationToken: '0x...',
  amount: 1000000n,
  destinationChain: optimism
})

// Swap tokens on the same chain
const swapResult = await client.actions.swapTokens({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: 1000000n,
  minAmountOut: 900000n
})
```

## Features

- Extends ZeroDev's KernelClient with chain abstraction capabilities
- Cross-chain token bridging
- Token swapping via DEX aggregators
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
