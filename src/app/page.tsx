'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentQR } from '@/components/payment/PaymentQR';
import { LottieAnimation } from '@/components/animations/LottieAnimation';
import { 
  ArrowRight, 
  Lightning, 
  Shield, 
  Globe, 
  QrCode, 
  PaperPlaneTilt, 
  Users,
  CheckCircle
} from '@phosphor-icons/react';
import { useAccount } from 'wagmi';
import PaymentAnimation from '../../public/Payment.json';
import WorldmapAnimation from '../../public/Worldmap.json';

export default function Home() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Lightning,
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
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-12 lg:pt-32 lg:pb-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-sm font-medium">Now Live on Sei Network</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                    <span className="gradient-text">
                      Instant Payments
                    </span>
                    <br />
                    <span>Made Simple</span>
                  </h1>
                  
                  <p className="text-lg lg:text-xl text-muted-foreground max-w-xl">
                    Send and receive payments globally with SeiPay. 
                    Fast, secure, and powered by Sei Network's blazing speed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/send"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Start Sending
                    <ArrowRight weight="bold" size={16} />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border hover:border-primary hover:bg-card/80 transition-all font-medium"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Animation */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl" />
                <div className="relative">
                  {mounted && (
                    <LottieAnimation
                      animationData={PaymentAnimation}
                      className="w-full max-w-lg mx-auto"
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
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Why Choose SeiPay?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Experience the future of payments with cutting-edge blockchain technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                      <Icon weight="bold" size={24} className="text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Payment Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Get Started Now
                </h2>
                <p className="text-muted-foreground">
                  Connect your wallet and start transacting
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-xl bg-muted p-1">
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'send'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <PaperPlaneTilt weight="regular" size={18} />
                    Send Payment
                  </button>
                  <button
                    onClick={() => setActiveTab('receive')}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      activeTab === 'receive'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <QrCode weight="regular" size={18} />
                    Receive Payment
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-card rounded-2xl border border-border p-8">
                {activeTab === 'send' ? (
                  <PaymentForm showRecipientInput />
                ) : (
                  <div>
                    {address ? (
                      <PaymentQR address={address} recipientName="Your Wallet" />
                    ) : (
                      <div className="text-center py-12 space-y-4">
                        <Users weight="light" size={48} className="mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
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
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Send Money
                  <span className="gradient-text">
                    {' '}Anywhere, Anytime
                  </span>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  With SeiPay, geographical boundaries don't exist. Send payments to anyone,
                  anywhere in the world, instantly. Our global network ensures your money
                  reaches its destination in seconds, not days.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle weight="fill" size={16} className="text-primary-foreground" />
                    </div>
                    <span>No international transfer fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle weight="fill" size={16} className="text-primary-foreground" />
                    </div>
                    <span>24/7 availability, even on holidays</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle weight="fill" size={16} className="text-primary-foreground" />
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

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Ready to Experience the Future?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of users already using SeiPay for instant, secure payments
                </p>
              </div>
              
              <Link
                href="/send"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-primary text-primary-foreground font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Started Now
                <ArrowRight weight="bold" size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container">
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
                <a
                  href="https://docs.sei.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Docs
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
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