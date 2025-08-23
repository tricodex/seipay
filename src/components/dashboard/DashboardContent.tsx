'use client';

import { useState } from 'react';
import { 
  Robot, 
  Building, 
  Users, 
  Code, 
  Warning,
  Lightning,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight
} from '@phosphor-icons/react';
import { PaymentAgent } from './PaymentAgent';
import { cn } from '@/lib/utils';

interface DashboardContentProps {
  address: string;
}

export function DashboardContent({ address }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'b2b' | 'api'>('agent');

  const features = [
    {
      id: 'agent',
      icon: Robot,
      title: 'AI Payment Assistant',
      description: 'Chat-based payment assistance',
      status: 'available',
      badge: 'Beta'
    },
    {
      id: 'b2b',
      icon: Building,
      title: 'B2B Payments',
      description: 'Enterprise payment solutions',
      status: 'coming-soon',
      badge: 'Coming Soon'
    },
    {
      id: 'api',
      icon: Code,
      title: 'API Payments (x402)',
      description: 'Micropayments for APIs',
      status: 'coming-soon',
      badge: 'Coming Soon'
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
      <div className="grid md:grid-cols-3 gap-4 mb-8">
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
        {activeTab === 'agent' && (
          <PaymentAgent address={address} />
        )}
        
        {activeTab === 'b2b' && (
          <div className="p-8 text-center space-y-6">
            <Building weight="light" size={64} className="mx-auto text-muted-foreground" />
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
          <div className="p-8 text-center space-y-6">
            <Code weight="light" size={64} className="mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold mb-2">x402 API Payments Coming Soon</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Enable micropayments for API calls using the x402 protocol. 
                Perfect for AI agents and automated systems.
              </p>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm text-left max-w-2xl mx-auto">
              <div className="opacity-60"># Example x402 Payment Flow</div>
              <div className="mt-2">
                <div>{"POST /api/generate HTTP/1.1"}</div>
                <div>{"Host: api.example.com"}</div>
                <div className="text-yellow-400">{"X-Payment: sei1abc...xyz"}</div>
                <div className="mt-2 opacity-60">{"# Server responds with payment request"}</div>
                <div>{"HTTP/1.1 402 Payment Required"}</div>
                <div className="text-blue-400">{"X-Payment-Request: 0.001 SEI"}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info weight="fill" size={16} />
              <span>Requires smart contract deployment on Sei Network</span>
            </div>
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