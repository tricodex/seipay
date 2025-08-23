'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Spinner, Warning, Wallet } from '@phosphor-icons/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentication check with delay to allow wallet reconnection
  useEffect(() => {
    if (!isClient) return;

    // Allow time for wallet to reconnect on page load
    const timer = setTimeout(() => {
      if (!isConnecting && !isReconnecting && !isConnected) {
        setAuthChecked(true);
      } else if (isConnected) {
        setAuthChecked(true);
      }
    }, 1000); // Give 1 second for wallet to reconnect

    return () => clearTimeout(timer);
  }, [isClient, isConnected, isConnecting, isReconnecting]);

  // Loading state while checking authentication
  if (!isClient || !authChecked || isConnecting || isReconnecting) {
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

  // Not connected state - show helpful message
  if (!isConnected && authChecked) {
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

  // Verify address exists before rendering dashboard
  if (!address) {
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
          <DashboardContent address={address} />
        </div>
      </main>
    </>
  );
}