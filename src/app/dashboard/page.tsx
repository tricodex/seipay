'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Spinner, Warning, Wallet, TestTube } from '@phosphor-icons/react';
import Link from 'next/link';

// Test wallet address for development
const TEST_WALLET = '0x0000000000000000000000000000000000000000';

export default function DashboardPage() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [useTestWallet, setUseTestWallet] = useState(false);
  const [testModeActive, setTestModeActive] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
    
    // Check for test mode in URL or development environment
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isTestMode = params.get('test') === 'true' || process.env.NODE_ENV === 'development';
      
      if (isTestMode) {
        setTestModeActive(true);
        setUseTestWallet(true);
      }
    }
  }, []);

  // Authentication check with proper wallet state handling
  useEffect(() => {
    if (!isClient) return;

    // If wallet is actively connecting/reconnecting, wait
    if (isConnecting || isReconnecting) {
      return;
    }

    // Give wallet time to auto-reconnect (500ms grace period)
    const timeoutId = setTimeout(() => {
      // Once wallet state is settled, check authentication
      if (testModeActive || isConnected || (!isConnecting && !isReconnecting)) {
        setAuthChecked(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isClient, isConnected, isConnecting, isReconnecting, testModeActive]);

  // Loading state while checking authentication (skip for test mode)
  if (!testModeActive && (!isClient || !authChecked || isConnecting || isReconnecting)) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
          <div className="container-fluid flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Spinner size={48} className="animate-spin mx-auto text-primary" weight="bold" />
              <div>
                <p className="text-lg font-medium">Checking wallet connection...</p>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we verify your wallet</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Not connected state - show helpful message (unless in test mode)
  if (!testModeActive && !isConnected && authChecked) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
          <div className="container-fluid flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                <Wallet size={40} className="text-primary" weight="duotone" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Wallet Connection Required</h1>
                <p className="text-muted-foreground">
                  Please connect your wallet to access the dashboard and manage your payment settings.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Warning weight="duotone" size={20} className="text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-900 text-left">
                    <p className="font-semibold mb-1">Why do I need to connect?</p>
                    <p>
                      The dashboard contains personalized features like your unique username, 
                      payment history, and API keys that are tied to your wallet address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click the wallet button in the header to connect
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Verify address exists before rendering dashboard (use test wallet if in test mode)
  const effectiveAddress = testModeActive ? TEST_WALLET : address;
  
  if (!effectiveAddress) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
          <div className="container-fluid flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Spinner size={48} className="animate-spin mx-auto text-primary" weight="bold" />
              <p className="text-muted-foreground">Loading wallet address...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Authenticated - show dashboard
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
        <div className="container-fluid">
          {testModeActive && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-xl flex items-center gap-2">
              <TestTube size={20} className="text-yellow-700" weight="duotone" />
              <span className="text-sm font-medium text-yellow-900">
                Test Mode Active - Using test wallet: {TEST_WALLET.slice(0, 6)}...{TEST_WALLET.slice(-4)}
              </span>
            </div>
          )}
          <DashboardContent address={effectiveAddress} />
        </div>
      </main>
    </>
  );
}