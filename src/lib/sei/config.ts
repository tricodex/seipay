// Sei Network Configuration
export const SEI_NETWORKS = {
  mainnet: {
    chainId: 1329, // 0x531 in hex
    chainName: 'Sei Network',
    nativeCurrency: {
      name: 'Sei',
      symbol: 'SEI',
      decimals: 18,
    },
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    blockExplorerUrls: ['https://seistream.app'],
  },
  testnet: {
    chainId: 1328, // 0x530 in hex
    chainName: 'Sei Testnet (atlantic-2)',
    nativeCurrency: {
      name: 'Sei',
      symbol: 'SEI',
      decimals: 18,
    },
    rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
    blockExplorerUrls: ['https://testnet.seistream.app'],
  },
} as const;

// Default to testnet for development
export const DEFAULT_NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? SEI_NETWORKS.mainnet 
  : SEI_NETWORKS.testnet;

// Transaction status constants
export const TX_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  CONFIRMING: 'confirming',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
} as const;

// Default payment amounts
export const DEFAULT_PAYMENT_AMOUNTS = [
  { value: '0.001', label: 'Coffee ☕', usd: '~$5' },
  { value: '0.002', label: 'Lunch 🍱', usd: '~$10' },
  { value: '0.005', label: 'Dinner 🍽️', usd: '~$25' },
  { value: '0.01', label: 'Premium 💎', usd: '~$50' },
  { value: '0.02', label: 'Generous 🎁', usd: '~$100' },
  { value: '0.05', label: 'Supporter 🚀', usd: '~$250' },
] as const;

// Wallet connector configurations
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Explorer URLs
export const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx') => {
  const baseUrl = DEFAULT_NETWORK.blockExplorerUrls[0];
  // Seistream uses different URL structure
  if (type === 'tx') {
    return `${baseUrl}/tx/${hash}`;
  } else if (type === 'address') {
    return `${baseUrl}/account/${hash}`;
  }
  return `${baseUrl}/${type}/${hash}`;
};

// Chain helpers
export const isSeiNetwork = (chainId: number | undefined) => {
  if (!chainId) return false;
  return chainId === SEI_NETWORKS.mainnet.chainId || chainId === SEI_NETWORKS.testnet.chainId;
};

export const getSeiNetwork = (chainId: number | undefined) => {
  if (chainId === SEI_NETWORKS.mainnet.chainId) return SEI_NETWORKS.mainnet;
  if (chainId === SEI_NETWORKS.testnet.chainId) return SEI_NETWORKS.testnet;
  return null;
};
