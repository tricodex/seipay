// x402 Protocol Configuration for Sei Network

// USDC Contract Addresses
export const USDC_CONTRACTS = {
  mainnet: {
    address: '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1', // USDC on Sei Mainnet
    decimals: 6,
    symbol: 'USDC',
  },
  testnet: {
    address: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED', // USDC on Sei Atlantic-2 Testnet
    decimals: 6,
    symbol: 'USDC',
  },
} as const;

// x402 Payment Configuration
export const X402_CONFIG = {
  // Protocol version
  version: '1.0',
  
  // Network-specific settings
  networks: {
    mainnet: {
      network: 'sei',
      chainId: 1329,
      currency: 'USDC',
      asset: USDC_CONTRACTS.mainnet.address,
      facilitator: 'https://api.x402.org/validate', // Coinbase facilitator
      rpcUrl: 'https://evm-rpc.sei-apis.com',
    },
    testnet: {
      network: 'sei-testnet',
      chainId: 1328,
      currency: 'USDC',
      asset: USDC_CONTRACTS.testnet.address,
      facilitator: 'https://api.x402.org/testnet/validate', // Testnet facilitator
      rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
    },
  },
  
  // Default payment amounts (in USDC)
  paymentPresets: {
    api_call: '0.001',      // $0.001 - Basic API call
    ai_generation: '0.005', // $0.005 - AI content generation
    data_query: '0.002',    // $0.002 - Database query
    compute_task: '0.01',   // $0.01 - Compute-intensive task
    premium_api: '0.05',    // $0.05 - Premium API endpoint
  },
  
  // Payment type for x402 protocol
  paymentType: 'evm-transfer',
  
  // Timeout settings (in milliseconds)
  timeouts: {
    payment: 60000,      // 60 seconds for payment
    verification: 10000, // 10 seconds for verification
    retry: 3000,        // 3 seconds between retries
  },
  
  // Max retries for payment verification
  maxRetries: 3,
} as const;

// Get current network configuration
export const getCurrentX402Config = () => {
  const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
  return isMainnet ? X402_CONFIG.networks.mainnet : X402_CONFIG.networks.testnet;
};

// Get USDC contract for current network
export const getCurrentUSDCContract = () => {
  const isMainnet = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
  return isMainnet ? USDC_CONTRACTS.mainnet : USDC_CONTRACTS.testnet;
};

// Format USDC amount (handles 6 decimals)
export const formatUSDCAmount = (amount: string): string => {
  const num = parseFloat(amount);
  return (num * 1e6).toString(); // Convert to 6 decimal places
};

// Parse USDC amount from contract format
export const parseUSDCAmount = (amount: string): string => {
  const num = parseInt(amount);
  return (num / 1e6).toFixed(6); // Convert from 6 decimal places
};

// Generate payment requirements for x402 response
export const generatePaymentRequirements = (amount: string, recipient: string) => {
  const config = getCurrentX402Config();
  const usdcContract = getCurrentUSDCContract();
  
  return {
    x402Version: X402_CONFIG.version,
    accepts: [{
      type: X402_CONFIG.paymentType,
      currency: usdcContract.symbol,
      network: config.network,
      chainId: config.chainId,
      asset: usdcContract.address,
      amount: amount,
      recipient: recipient,
      decimals: usdcContract.decimals,
    }],
    facilitator: config.facilitator,
    timeout: X402_CONFIG.timeouts.payment,
  };
};

// Testnet helpers
export const TESTNET_RESOURCES = {
  seiFaucet: 'https://atlantic-2.app.sei.io/faucet',
  seitraceFaucet: 'https://seitrace.com/tool/faucet?chain=atlantic-2',
  usdcBridge: 'https://testnet.circle.com/faucets/usdc', // Circle's CCTP for testnet USDC
  documentation: 'https://docs.sei.io/evm/usdc-on-sei',
};

// Check if we're on testnet
export const isTestnet = () => {
  return process.env.NEXT_PUBLIC_NETWORK !== 'mainnet';
};

// Get testnet warning message
export const getTestnetWarning = () => {
  if (!isTestnet()) return null;
  
  return {
    message: 'You are on Sei Atlantic-2 Testnet',
    details: [
      'Using testnet USDC (no real value)',
      'Get test SEI from the faucet for gas fees',
      'Get test USDC from Circle\'s testnet bridge',
      'Payments are for testing only',
    ],
    resources: TESTNET_RESOURCES,
  };
};