'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { PaymentQR } from '@/components/payment/PaymentQR';
import { WalletButton } from '@/components/wallet/WalletButton';
import { ArrowLeft, QrCode, Wallet, Copy, CheckCircle, Share } from '@phosphor-icons/react';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

export default function ReceivePage() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sharePaymentLink = () => {
    const paymentUrl = `${window.location.origin}/send?to=${address}${amount ? `&amount=${amount}` : ''}`;
    if (navigator.share) {
      navigator.share({
        title: 'SeiPay Payment Request',
        text: `Send me ${amount ? `${amount} SEI` : 'a payment'} via SeiPay`,
        url: paymentUrl,
      });
    } else {
      navigator.clipboard.writeText(paymentUrl);
      toast.success('Payment link copied to clipboard');
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white pt-24 pb-16">
        <div className="container-fluid">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft weight="regular" size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Receive Payment
                </h1>
                <p className="text-xl text-muted-foreground">
                  Share your QR code or wallet address to receive instant payments on Sei Network.
                </p>
              </div>

              {address ? (
                <div className="space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Request Amount (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        step="0.0001"
                        min="0"
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                      />
                      <span className="px-4 py-3 bg-muted rounded-xl font-semibold">SEI</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a specific amount for the payment request
                    </p>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your name or business"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be shown to the sender
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-orange-900">Your Wallet Address</span>
                      <button
                        onClick={copyAddress}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white border border-orange-200 hover:bg-orange-100 transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle weight="fill" size={14} className="text-success" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy weight="regular" size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-xs font-mono text-orange-800 break-all">
                      {address}
                    </code>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={sharePaymentLink}
                    className="w-full px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Share weight="regular" size={20} />
                    Share Payment Link
                  </button>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <p className="text-orange-900 mb-4">
                    Connect your wallet to start receiving payments
                  </p>
                  <WalletButton />
                </div>
              )}
            </div>

            {/* Right QR Code */}
            <div className="lg:sticky lg:top-24">
              {address ? (
                <div className="bg-white rounded-2xl shadow-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <QrCode weight="regular" size={24} className="text-primary" />
                    <h2 className="text-2xl font-bold">Payment QR Code</h2>
                  </div>
                  
                  <PaymentQR 
                    address={address} 
                    recipientName={recipientName || 'Your Wallet'}
                    amount={amount || undefined}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-border p-12 text-center">
                  <Wallet weight="light" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your wallet to generate a payment QR code
                  </p>
                  <WalletButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
