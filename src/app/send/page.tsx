'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { ArrowLeft, PaperPlaneTilt, Lightning, Shield, Clock } from '@phosphor-icons/react';

export default function SendPage() {
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
                  Send Payment
                </h1>
                <p className="text-xl text-muted-foreground">
                  Transfer funds instantly to any wallet address on Sei Network. 
                  Fast, secure, and with zero fees.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lightning weight="duotone" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Lightning Fast</h3>
                    <p className="text-muted-foreground text-sm">
                      Transactions confirm in under 1 second with Sei's 400ms finality
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield weight="duotone" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Transparent</h3>
                    <p className="text-muted-foreground text-sm">
                      All transactions are recorded on the blockchain for full transparency
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock weight="duotone" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Availability</h3>
                    <p className="text-muted-foreground text-sm">
                      Send payments anytime, anywhere. No bank holidays or closing hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-900">
                  <strong>Tip:</strong> You can save frequently used addresses by adding a 
                  recipient name. This makes future payments even faster!
                </p>
              </div>
            </div>

            {/* Right Payment Form */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PaperPlaneTilt weight="regular" size={24} className="text-primary" />
                  <h2 className="text-2xl font-bold">Send SEI</h2>
                </div>
                
                <PaymentForm showRecipientInput />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
