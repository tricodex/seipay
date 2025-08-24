'use client';

import { useState } from 'react';
import { 
  Aperture, 
  Buildings, 
  Users, 
  HardDrive, 
  Warning,
  Pulse,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  UserCircle,
  MagicWand,
  Cpu,
  Wallet,
  Lock
} from '@phosphor-icons/react';
import { PaymentAgent } from './PaymentAgent';
import { UsernameManager } from './UsernameManager';
import { X402ApiPanel } from './X402ApiPanel';
import { CustodialWalletPanel } from './CustodialWalletPanel';
import { cn } from '@/lib/utils';

interface DashboardContentProps {
  address: string;
}

export function DashboardContent({ address }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'b2b' | 'api' | 'profile' | 'wallets'>('agent');

  const features = [
    {
      id: 'profile',
      icon: UserCircle,
      title: 'Profile & Username',
      description: 'Manage your unique username',
      status: 'available',
      badge: 'New'
    },
    {
      id: 'wallets',
      icon: Lock,
      title: 'Custodial Wallets',
      description: 'AI-controlled secure wallets',
      status: 'available',
      badge: 'Secure'
    },
    {
      id: 'agent',
      icon: Aperture,
      title: 'AI Payment Assistant',
      description: 'Chat-based payment assistance',
      status: 'available',
      badge: 'Beta'
    },
    {
      id: 'b2b',
      icon: Buildings,
      title: 'B2B Payments',
      description: 'Enterprise payment solutions',
      status: 'coming-soon',
      badge: 'Coming Soon'
    },
    {
      id: 'api',
      icon: HardDrive,
      title: 'x402 API Payments',
      description: 'Micropayments for APIs',
      status: 'available',
      badge: 'Demo'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Dashboard</h1>
        <p className="text-muted-foreground">
          Advanced payment features powered by AI and smart contracts
        </p>
      </div>

      {/* Feature Tabs */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeTab === feature.id;
          const isAvailable = feature.status === 'available';
          
          return (
            <button
              key={feature.id}
              onClick={() => isAvailable && setActiveTab(feature.id as any)}
              disabled={!isAvailable}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all text-left",
                isActive && isAvailable
                  ? "border-primary bg-orange-50 shadow-lg"
                  : isAvailable
                  ? "border-border bg-white hover:border-primary/50 hover:shadow-md"
                  : "border-border bg-gray-50 opacity-60 cursor-not-allowed"
              )}
            >
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  feature.status === 'available' 
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {feature.badge}
                </span>
              </div>
              
              <Icon 
                weight="duotone" 
                size={32} 
                className={cn(
                  "mb-4",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        {activeTab === 'profile' && (
          <div className="p-8">
            <UsernameManager />
          </div>
        )}
        
        {activeTab === 'wallets' && (
          <div className="p-8">
            <CustodialWalletPanel />
          </div>
        )}
        
        {activeTab === 'agent' && (
          <PaymentAgent address={address} />
        )}
        
        {activeTab === 'b2b' && (
          <div className="p-8 text-center space-y-6">
            <Buildings weight="light" size={64} className="mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold mb-2">B2B Payments Coming Soon</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Enterprise-grade payment solutions with smart contract escrow, 
                multi-signature approvals, and automated invoicing.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <CheckCircle weight="fill" size={24} className="text-success mb-2" />
                <h4 className="font-semibold text-sm mb-1">Smart Escrow</h4>
                <p className="text-xs text-muted-foreground">
                  Automated fund release based on conditions
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <CheckCircle weight="fill" size={24} className="text-success mb-2" />
                <h4 className="font-semibold text-sm mb-1">Multi-Sig</h4>
                <p className="text-xs text-muted-foreground">
                  Require multiple approvals for large transactions
                </p>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <CheckCircle weight="fill" size={24} className="text-success mb-2" />
                <h4 className="font-semibold text-sm mb-1">Invoicing</h4>
                <p className="text-xs text-muted-foreground">
                  Automated invoice generation and tracking
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'api' && (
          <div className="p-8">
            <X402ApiPanel />
          </div>
        )}
      </div>

      {/* Implementation Notice */}
      <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Warning weight="duotone" size={24} className="text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">Technical Implementation Status</p>
            <p>
              The AI Payment Assistant demonstrates what is currently possible with existing technology. 
              B2B and x402 API payments require additional smart contract infrastructure 
              and are shown as proof-of-concept designs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}