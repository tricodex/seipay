'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentQR } from '@/components/payment/PaymentQR';
import { 
  ArrowRight, 
  Lightning, 
  Shield, 
  Globe, 
  QrCode, 
  PaperPlaneTilt,
  CheckCircle,
  Wallet,
  Clock,
  ShieldCheck
} from '@phosphor-icons/react';
import { useAccount } from 'wagmi';

export default function Home() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');

  const features = [
    {
      icon: Lightning,
      title: '400ms Finality',
      description: 'Lightning-fast transactions with near-instant confirmation',
    },
    {
      icon: ShieldCheck,
      title: 'Secure & Reliable',
      description: 'Built on Sei Network\'s battle-tested infrastructure',
    },
    {
      icon: Globe,
      title: 'Global Payments',
      description: 'Send money anywhere in the world, 24/7',
    },
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Works with MetaMask, Coinbase, and more',
    },
  ];

  const benefits = [
    { icon: CheckCircle, text: 'No international transfer fees' },
    { icon: CheckCircle, text: '24/7 availability, even on holidays' },
    { icon: CheckCircle, text: 'Transparent blockchain verification' },
    { icon: CheckCircle, text: 'Instant settlement, no waiting' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white">
        {/* Hero Section with Payment Form */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          
          <div className="container-fluid relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-sm font-medium text-orange-900">Live on Sei Network</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                    Send Money
                    <span className="block gradient-text">Instantly</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground max-w-xl">
                    The fastest way to send and receive payments on Sei Network. 
                    No banks, no delays, just instant transfers.
                  </p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Clock weight="duotone" size={24} className="text-primary" />
                    <span className="font-medium">&lt; 1 sec transfers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck weight="duotone" size={24} className="text-primary" />
                    <span className="font-medium">Bank-grade security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe weight="duotone" size={24} className="text-primary" />
                    <span className="font-medium">Global reach</span>
                  </div>
                </div>
              </div>

              {/* Right Payment Card */}
              <div className="lg:pl-8">
                <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                  {/* Tab Selector */}
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setActiveTab('send')}
                      className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'send'
                          ? 'bg-orange-50 text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <PaperPlaneTilt weight="regular" size={20} />
                      Send Payment
                    </button>
                    <button
                      onClick={() => setActiveTab('receive')}
                      className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'receive'
                          ? 'bg-orange-50 text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <QrCode weight="regular" size={20} />
                      Receive Payment
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'send' ? (
                      <PaymentForm showRecipientInput />
                    ) : (
                      <div>
                        {address ? (
                          <PaymentQR address={address} recipientName="Your Wallet" />
                        ) : (
                          <div className="text-center py-12 space-y-4">
                            <Wallet weight="light" size={48} className="mx-auto text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground mb-4">
                                Connect your wallet to generate a payment QR code
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Your address will be displayed here for others to send you payments
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
          <div className="container-fluid">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl font-bold">
                Why businesses choose SeiPay
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of merchants accepting instant payments with zero fees
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <Icon weight="bold" size={24} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="container-fluid">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  The future of payments is here
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Say goodbye to wire transfers, ACH delays, and international fees. 
                  With SeiPay, your money moves at the speed of the internet.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <li key={index} className="flex items-center gap-3">
                        <Icon weight="fill" size={24} className="text-success flex-shrink-0" />
                        <span className="text-lg">{benefit.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/send"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Start Sending Now
                    <ArrowRight weight="bold" size={20} />
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Traditional Bank Transfer</span>
                      <span className="font-semibold text-red-600">3-5 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wire Transfer</span>
                      <span className="font-semibold text-orange-600">1-2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Credit Card</span>
                      <span className="font-semibold text-yellow-600">Instant + 3% fee</span>
                    </div>
                    <div className="border-t-2 border-primary pt-6">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">SeiPay</span>
                        <span className="font-bold text-success">&lt; 1 second, 0% fee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent">
          <div className="container text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to accept instant payments?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join the payment revolution. No setup fees, no monthly charges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/send"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started
                <ArrowRight weight="bold" size={20} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/20 text-white border-2 border-white/50 font-semibold hover:bg-white/30 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-50 border-t border-border">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/seipay.png"
                  alt="SeiPay"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold">SeiPay</span>
                <span className="text-muted-foreground">© 2025</span>
              </div>
              
              <div className="flex gap-8 text-sm">
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/send" className="text-muted-foreground hover:text-primary transition-colors">
                  Send
                </Link>
                <Link href="/receive" className="text-muted-foreground hover:text-primary transition-colors">
                  Receive
                </Link>
                <a
                  href="https://docs.sei.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Docs
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}