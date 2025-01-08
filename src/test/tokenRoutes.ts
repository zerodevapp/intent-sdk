import { type Address, type Chain, parseUnits, zeroAddress } from "viem";
import {
  arbitrum,
  base,
  baseSepolia,
  bsc,
  mainnet,
  optimism,
  sepolia,
} from "viem/chains";

export type InputToken = {
  chainId: number;
  address: Address;
  amount?: bigint;
};

export type OutputToken = {
  chainId: number;
  address: Address;
  amount: bigint;
};

export type TokenRoute = {
  chain: Chain;
  routes: {
    name: string;
    inputTokens: InputToken[];
    outputTokens: OutputToken[];
  }[];
};

export const SEPOLIA_TOKEN_ROUTES: TokenRoute = {
  chain: sepolia,
  routes: [
    // NATIVE
    {
      name: "sepolia eth <-> baseSepolia eth",
      inputTokens: [
        {
          chainId: sepolia.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: baseSepolia.id,
          address: zeroAddress,
          amount: parseUnits("0.005", 18),
        },
      ],
    },
    // USDC
    {
      name: "sepolia usdc <-> baseSepolia usdc",
      inputTokens: [
        {
          chainId: sepolia.id,
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        },
      ],
      outputTokens: [
        {
          chainId: baseSepolia.id,
          address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          amount: parseUnits("0.01", 6),
        },
      ],
    },
  ],
};

export const BASE_SEPOLIA_TOKEN_ROUTES: TokenRoute = {
  chain: baseSepolia,
  routes: [
    // NATIVE
    {
      name: "baseSepolia eth <-> sepolia eth",
      inputTokens: [
        {
          chainId: baseSepolia.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: sepolia.id,
          address: zeroAddress,
          amount: parseUnits("0.005", 18),
        },
      ],
    },
    // USDC
    {
      name: "baseSepolia usdc <-> sepolia usdc",
      inputTokens: [
        {
          chainId: baseSepolia.id,
          address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        },
      ],
      outputTokens: [
        {
          chainId: sepolia.id,
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          amount: parseUnits("0.01", 6),
        },
      ],
    },
  ],
};

export const ETH_TOKEN_ROUTES: TokenRoute = {
  chain: mainnet,
  routes: [
    // NATIVE
    {
      name: "mainnet eth <-> op eth",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    {
      name: "mainnet eth <-> arb eth",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    {
      name: "mainnet eth <-> base eth",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    // USDC
    {
      name: "mainnet usdc <-> op usdc",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x4200000000000000000000000000000000000006",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "mainnet usdc <-> arb usdc",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "mainnet usdc <-> base usdc",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "mainnet usdc <-> bsc usdc",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          amount: parseUnits("1.5", 18),
        },
      ],
    },
    // USDT
    {
      name: "mainnet usdt <-> op usdt",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "mainnet usdt <-> arb usdt",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "mainnet usdt <-> bsc usdt",
      inputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
          amount: parseUnits("1.5", 18),
        },
      ],
    },
  ],
};

export const OP_TOKEN_ROUTES: TokenRoute = {
  chain: optimism,
  routes: [
    // NATIVE
    {
      name: "op eth <-> mainnet eth",
      inputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    {
      name: "op eth <-> arb eth",
      inputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    {
      name: "op eth <-> base eth",
      inputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    // USDC
    {
      name: "op usdc <-> mainnet usdc",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          amount: parseUnits("500", 6),
        },
      ],
    },
    {
      name: "op usdc <-> arb usdc",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "op usdc <-> base usdc",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: parseUnits("0.6", 6),
        },
      ],
    },
    {
      name: "op usdt <-> bsc usdc",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          amount: parseUnits("0.6", 18),
        },
      ],
    },
    // USDT
    {
      name: "op usdt <-> mainnet usdt",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          amount: parseUnits("500", 6),
        },
      ],
    },
    {
      name: "op usdt <-> arb usdt",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "op usdt <-> bsc usdt",
      inputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
          amount: parseUnits("0.6", 18),
        },
      ],
    },
  ],
};

export const ARB_TOKEN_ROUTES: TokenRoute = {
  chain: arbitrum,
  routes: [
    // NATIVE
    {
      name: "arb eth <-> mainnet eth",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    {
      name: "arb eth <-> op eth",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    {
      name: "arb eth <-> base eth",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    // USDC
    {
      name: "arb usdc <-> mainnet usdc",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          amount: parseUnits("200", 6),
        },
      ],
    },
    {
      name: "arb usdc <-> op usdc",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          amount: parseUnits("0.6", 6),
        },
      ],
    },
    {
      name: "arb usdc <-> base usdc",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: parseUnits("0.6", 6),
        },
      ],
    },
    {
      name: "arb usdc <-> bsc usdc",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          amount: parseUnits("0.6", 18),
        },
      ],
    },
    // USDT
    {
      name: "arb usdt <-> mainnet usdt",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          amount: parseUnits("200", 6),
        },
      ],
    },
    {
      name: "arb usdt <-> op usdt",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
          amount: parseUnits("0.6", 6),
        },
      ],
    },
    {
      name: "arb usdt <-> bsc usdt",
      inputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
          amount: parseUnits("0.6", 18),
        },
      ],
    },
  ],
};

export const BASE_TOKEN_ROUTES: TokenRoute = {
  chain: base,
  routes: [
    // NATIVE
    {
      name: "base eth <-> mainnet eth",
      inputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: zeroAddress,
          amount: parseUnits("0.1", 18),
        },
      ],
    },
    {
      name: "base eth <-> op eth",
      inputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    {
      name: "base eth <-> arb eth",
      inputTokens: [
        {
          chainId: base.id,
          address: zeroAddress,
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: zeroAddress,
          amount: parseUnits("0.002", 18),
        },
      ],
    },
    // USDC
    {
      name: "base usdc <-> mainnet usdc",
      inputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          amount: parseUnits("200", 6),
        },
      ],
    },
    {
      name: "base usdc <-> op usdc",
      inputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "base usdc <-> arb usdc",
      inputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "base usdc <-> bsc usdc",
      inputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        },
      ],
      outputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          amount: parseUnits("1.5", 18),
        },
      ],
    },
  ],
};

export const BSC_TOKEN_ROUTES: TokenRoute = {
  chain: bsc,
  routes: [
    // USDC
    {
      name: "bsc usdc <-> mainnet usdc",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          amount: parseUnits("200", 6),
        },
      ],
    },
    {
      name: "bsc usdc <-> op usdc",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "bsc usdc <-> arb usdc",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "bsc usdc <-> base usdc",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        },
      ],
      outputTokens: [
        {
          chainId: base.id,
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    // USDT
    {
      name: "bsc usdt <-> mainnet usdt",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
        },
      ],
      outputTokens: [
        {
          chainId: mainnet.id,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          amount: parseUnits("200", 6),
        },
      ],
    },
    {
      name: "bsc usdt <-> op usdt",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
        },
      ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
    {
      name: "bsc usdt <-> arb usdt",
      inputTokens: [
        {
          chainId: bsc.id,
          address: "0x55d398326f99059ff775485246999027b3197955",
        },
      ],
      outputTokens: [
        {
          chainId: arbitrum.id,
          address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
          amount: parseUnits("1.5", 6),
        },
      ],
    },
  ],
};

export const MAINNET_TOKEN_ROUTES_SAME_CHAIN: TokenRoute[] = [
  {
    chain: mainnet,
    routes: [
      {
        name: "mainnet usdc <-> mainnet usdc",
        inputTokens: [
          {
            chainId: mainnet.id,
            address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          },
        ],
        outputTokens: [],
      },
    ],
  },
  {
    chain: optimism,
    routes: [
      {
        name: "optimism usdc <-> optimism usdc",
        inputTokens: [
          {
            chainId: optimism.id,
            address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
          },
        ],
        outputTokens: [],
      },
    ],
  },
  {
    chain: arbitrum,
    routes: [
      {
        name: "arbitrum usdc <-> arbitrum usdc",
        inputTokens: [
          {
            chainId: arbitrum.id,
            address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
          },
        ],
        outputTokens: [],
      },
    ],
  },
  {
    chain: base,
    routes: [
      {
        name: "base usdc <-> base usdc",
        inputTokens: [
          {
            chainId: base.id,
            address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          },
        ],
        outputTokens: [],
      },
    ],
  },
  {
    chain: bsc,
    routes: [
      {
        name: "bsc usdc <-> bsc usdc",
        inputTokens: [
          {
            chainId: bsc.id,
            address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          },
        ],
        outputTokens: [],
      },
    ],
  },
];

export const TESTNET_TOKEN_ROUTES: TokenRoute[] = [
  SEPOLIA_TOKEN_ROUTES,
  BASE_SEPOLIA_TOKEN_ROUTES,
];

export const MAINNET_TOKEN_ROUTES: TokenRoute[] = [
  ETH_TOKEN_ROUTES,
  OP_TOKEN_ROUTES,
  ARB_TOKEN_ROUTES,
  BASE_TOKEN_ROUTES,
  BSC_TOKEN_ROUTES,
];
