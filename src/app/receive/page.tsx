'use client';

import { Header } from '@/components/layout/Header';
import { PaymentQR } from '@/components/payment/PaymentQR';
import { WalletButton } from '@/components/wallet/WalletButton';
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function ReceivePage() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Receive <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SEI Payment</span>
              </h1>
              <p className="text-muted-foreground">
                Share your QR code or payment link to receive instant payments
              </p>
            </div>

            {address ? (
              <>
                {/* Optional Amount Input */}
                <div className="bg-card rounded-xl border border-border p-6 mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Request Specific Amount (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.0001"
                      min="0"
                      className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="px-4 py-2 bg-muted rounded-lg font-medium">SEI</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    If set, the payment QR will include this amount
                  </p>
                </div>

                {/* QR Code Section */}
                <div className="bg-card rounded-xl border border-border p-8 shadow-xl">
                  <PaymentQR 
                    address={address} 
                    recipientName="Your Wallet"
                    amount={amount || undefined}
                  />
                </div>

                {/* Wallet Info */}
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connected Wallet:</span>
                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </code>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet to generate a payment QR code
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
