import { createConfig, http, createStorage } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  argentWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { SEI_NETWORKS, WALLET_CONNECT_PROJECT_ID } from './config';

// Define Sei Mainnet chain
export const seiMainnet: Chain = {
  id: SEI_NETWORKS.mainnet.chainId,
  name: SEI_NETWORKS.mainnet.chainName,
  nativeCurrency: SEI_NETWORKS.mainnet.nativeCurrency,
  rpcUrls: {
    default: {
      http: SEI_NETWORKS.mainnet.rpcUrls,
    },
    public: {
      http: SEI_NETWORKS.mainnet.rpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: 'SeiTrace',
      url: SEI_NETWORKS.mainnet.blockExplorerUrls[0],
    },
  },
  testnet: false,
};

// Define Sei Testnet chain
export const seiTestnet: Chain = {
  id: SEI_NETWORKS.testnet.chainId,
  name: SEI_NETWORKS.testnet.chainName,
  nativeCurrency: SEI_NETWORKS.testnet.nativeCurrency,
  rpcUrls: {
    default: {
      http: SEI_NETWORKS.testnet.rpcUrls,
    },
    public: {
      http: SEI_NETWORKS.testnet.rpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: 'SeiTrace',
      url: SEI_NETWORKS.testnet.blockExplorerUrls[0],
    },
  },
  testnet: true,
};

// Configure wallet connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended for Sei',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
      ],
    },
    {
      groupName: 'Other Wallets',
      wallets: [
        rainbowWallet,
        argentWallet,
        trustWallet,
      ],
    },
  ],
  {
    appName: 'SeiPay',
    projectId: WALLET_CONNECT_PROJECT_ID || 'seipay_default_project_id',
  }
);

// Determine which chain to use based on environment
const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
const chains: readonly [Chain, ...Chain[]] = isMainnet 
  ? [seiMainnet] as const
  : [seiTestnet] as const;

// Create wagmi config with storage for persistence
export const wagmiConfig = createConfig({
  connectors,
  chains,
  transports: {
    [seiMainnet.id]: http(SEI_NETWORKS.mainnet.rpcUrls[0]),
    [seiTestnet.id]: http(SEI_NETWORKS.testnet.rpcUrls[0]),
  },
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: 'seipay-wallet',
  }),
  ssr: true,
});

// Export the default chain
export const defaultChain = chains[0];
