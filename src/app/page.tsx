'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentQR } from '@/components/payment/PaymentQR';
import { LottieAnimation } from '@/components/animations/LottieAnimation';
import { ArrowRight, Zap, Shield, Globe, QrCode, Send, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import PaymentAnimation from '@/public/Payment.json';
import TigerAnimation from '@/public/Tiger.json';
import WorldmapAnimation from '@/public/Worldmap.json';

export default function Home() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant payments with 400ms finality on Sei Network',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Built on Sei\'s high-performance blockchain',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Send payments anywhere in the world instantly',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm font-medium">Now Live on Sei Network</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Instant Payments
                  </span>
                  <br />
                  <span>Made Simple</span>
                </h1>

                <p className="text-xl text-muted-foreground">
                  Send and receive payments globally with SeiPay. 
                  Fast, secure, and powered by Sei Network\'s blazing speed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/send"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:shadow-lg transition-all"
                  >
                    Start Sending
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl" />
                <div className="relative">
                  {mounted && (
                    <LottieAnimation
                      animationData={PaymentAnimation}
                      className="w-full max-w-md mx-auto"
                      loop
                      autoplay
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Why Choose SeiPay?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of payments with cutting-edge blockchain technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-6 rounded-xl bg-card border border-border hover:border-primary transition-all hover:shadow-xl"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Get Started Now
                </h2>
                <p className="text-muted-foreground">
                  Connect your wallet and start transacting
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-lg bg-card border border-border p-1">
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'send'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    Send Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('receive')}
                    className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'receive'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Receive Payment
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-card rounded-xl border border-border p-8">
                {activeTab === 'send' ? (
                  <PaymentForm showRecipientInput />
                ) : (
                  <div>
                    {address ? (
                      <PaymentQR address={address} recipientName="Your Wallet" />
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                          Connect your wallet to generate a payment QR code
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Global Reach Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Send Money
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {' '}Anywhere, Anytime
                  </span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  With SeiPay, geographical boundaries don\'t exist. Send payments to anyone,
                  anywhere in the world, instantly. Our global network ensures your money
                  reaches its destination in seconds, not days.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>No international transfer fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>24/7 availability, even on holidays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>Transparent blockchain verification</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                {mounted && (
                  <LottieAnimation
                    animationData={WorldmapAnimation}
                    className="w-full"
                    loop
                    autoplay
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section with Tiger Animation */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                {mounted && (
                  <LottieAnimation
                    animationData={TigerAnimation}
                    className="w-32 h-32 mx-auto"
                    loop
                    autoplay
                  />
                )}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Experience the Future?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of users already using SeiPay for instant, secure payments
              </p>
              <Link
                href="/send"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
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
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
                <a
                  href="https://docs.sei.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Docs
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
