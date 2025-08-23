'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Spinner } from '@phosphor-icons/react';

export default function DashboardPage() {
  const { address, isConnected, isConnecting } = useAccount();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not connected
    if (!isConnecting && !isConnected) {
      router.push('/');
    }
  }, [isConnected, isConnecting, router]);

  if (isConnecting) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
          <div className="container-fluid flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Spinner size={48} className="animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Connecting wallet...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isConnected) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
        <div className="container-fluid">
          <DashboardContent address={address!} />
        </div>
      </main>
    </>
  );
}