import { useState, useEffect } from 'react';

// Test wallet for development
const TEST_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';

export function useTestWallet() {
  const [isTestMode, setIsTestMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // Check for test mode in localStorage
      const testMode = localStorage.getItem('testWalletMode');
      setIsTestMode(testMode === 'true');
    }
  }, []);

  const enableTestWallet = () => {
    localStorage.setItem('testWalletMode', 'true');
    setIsTestMode(true);
    window.location.reload(); // Reload to apply test mode
  };

  const disableTestWallet = () => {
    localStorage.removeItem('testWalletMode');
    setIsTestMode(false);
    window.location.reload();
  };

  return {
    isTestMode,
    testAddress: TEST_WALLET_ADDRESS,
    enableTestWallet,
    disableTestWallet,
  };
}