'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ArrowLeft, Lightning, Cpu, Shield, Globe, Gauge, Layers } from '@phosphor-icons/react';

export default function AboutPage() {
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

          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                About SeiPay
              </h1>
              <p className="text-xl text-muted-foreground">
                A payment interface built on Sei Network's high-performance blockchain infrastructure.
              </p>
            </div>

            {/* Sei Network Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">The Sei Network Foundation</h2>
              
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  Sei Network operates as a Layer 1 blockchain designed specifically for trading and financial applications. 
                  The network achieves transaction finality in 390 milliseconds, positioning it among the fastest blockchain 
                  infrastructures currently in production.
                </p>
                
                <p>
                  Built using the Cosmos SDK and Tendermint consensus mechanism, Sei has been optimized through a system 
                  called Twin Turbo consensus. This optimization reduces block time from Tendermint's standard 6 seconds 
                  to under 400 milliseconds while maintaining single-slot finality.
                </p>

                <p>
                  The network processes approximately 12,500 transactions per second in its current configuration. 
                  Internal testing environments have demonstrated capabilities of 28,300 batched transactions per second 
                  with the V2 upgrade deployed in July 2024.
                </p>
              </div>
            </section>

            {/* Technical Specifications */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Technical Architecture</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start gap-3">
                    <Gauge weight="duotone" size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Performance Metrics</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Block finality: 390ms (production)</li>
                        <li>• Transaction throughput: 12,500 TPS</li>
                        <li>• V2 capacity: 28,300 TPS (batched)</li>
                        <li>• Testnet lower bound: 300ms finality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start gap-3">
                    <Cpu weight="duotone" size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Consensus Mechanism</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Twin Turbo consensus</li>
                        <li>• Optimistic block processing</li>
                        <li>• Intelligent block propagation</li>
                        <li>• Single-slot finality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start gap-3">
                    <Layers weight="duotone" size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Network Features</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Parallelized EVM compatibility</li>
                        <li>• IBC protocol support</li>
                        <li>• Integrated blockchain architecture</li>
                        <li>• Cosmos SDK foundation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-start gap-3">
                    <Lightning weight="duotone" size={24} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Future Developments</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Giga upgrade (2025)</li>
                        <li>• Target: 200,000+ TPS</li>
                        <li>• 5 gigagas/second processing</li>
                        <li>• Maintained sub-400ms finality</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Comparison Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Network Comparison</h2>
              
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Network</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Finality Time</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">TPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-6 py-3 text-sm">Sei Network</td>
                      <td className="px-6 py-3 text-sm font-semibold text-success">390ms</td>
                      <td className="px-6 py-3 text-sm">12,500</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm">Solana</td>
                      <td className="px-6 py-3 text-sm">~4 seconds</td>
                      <td className="px-6 py-3 text-sm">65,000</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm">Ethereum</td>
                      <td className="px-6 py-3 text-sm">~13 minutes</td>
                      <td className="px-6 py-3 text-sm">15-30</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-sm">Bitcoin</td>
                      <td className="px-6 py-3 text-sm">~60 minutes</td>
                      <td className="px-6 py-3 text-sm">7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                * Finality represents the time required for a transaction to be considered irreversible.
                Sei's 390ms finality is approximately 2,000 times faster than Ethereum's epoch-based finality.
              </p>
            </section>

            {/* SeiPay Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">SeiPay Implementation</h2>
              
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  SeiPay functions as a payment interface layer built on top of Sei Network's infrastructure. 
                  The application leverages the network's sub-second finality to enable near-instantaneous 
                  payment confirmations.
                </p>
                
                <p>
                  Integration is achieved through standard Web3 wallet connections, supporting MetaMask, 
                  Coinbase Wallet, and other EVM-compatible wallets through the RainbowKit library. 
                  Transactions are processed directly on-chain without intermediary services.
                </p>

                <p>
                  The system operates on both Sei mainnet (chain ID 1329) and testnet (chain ID 1328) 
                  environments. Payment data, including optional messages, is encoded directly into 
                  transaction calldata for on-chain record keeping.
                </p>
              </div>
            </section>

            {/* Security & Compliance */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Security Considerations</h2>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield weight="duotone" size={24} className="text-orange-600 mt-1" />
                  <div className="text-sm text-orange-900 space-y-2">
                    <p>
                      All transactions are processed directly through blockchain consensus without custody 
                      or control by SeiPay. Users maintain complete control of their funds through their 
                      wallet applications.
                    </p>
                    <p>
                      Transaction finality at 390ms is achieved through Byzantine Fault Tolerant consensus, 
                      requiring agreement from two-thirds of network validators. Once finalized, transactions 
                      cannot be reversed or altered.
                    </p>
                    <p>
                      The application does not store private keys, seed phrases, or any sensitive wallet 
                      information. All cryptographic operations are handled by the user's wallet software.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Network Stats */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Current Network Activity</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-2xl font-bold text-primary">390ms</div>
                  <div className="text-sm text-muted-foreground">Block Finality</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-2xl font-bold text-primary">45+ TPS</div>
                  <div className="text-sm text-muted-foreground">Live Activity</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-2xl font-bold text-primary">12,500</div>
                  <div className="text-sm text-muted-foreground">Max TPS</div>
                </div>
                <div className="bg-white rounded-xl border border-border p-4">
                  <div className="text-2xl font-bold text-primary">2024</div>
                  <div className="text-sm text-muted-foreground">V2 Deployed</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}