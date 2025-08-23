'use client';

import { TestTube } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

export function TestWalletToggle() {
  const router = useRouter();

  const handleToggleTestMode = () => {
    // Toggle test mode by adding/removing query parameter
    const params = new URLSearchParams(window.location.search);
    const isTestMode = params.get('test') === 'true';
    
    if (isTestMode) {
      params.delete('test');
    } else {
      params.set('test', 'true');
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    router.push(newUrl);
    router.refresh();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={handleToggleTestMode}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-100 text-yellow-900 hover:bg-yellow-200 transition-colors text-sm font-medium"
      title="Toggle Test Wallet Mode"
    >
      <TestTube size={18} weight="duotone" />
      <span>Test Mode</span>
    </button>
  );
}