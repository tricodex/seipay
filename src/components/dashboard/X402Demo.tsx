'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { 
  Circuitry, 
  CheckCircle, 
  Warning,
  ArrowRight,
  Cpu,
  CurrencyCircleDollar
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function X402Demo() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [paymentRequired, setPaymentRequired] = useState<any>(null);
  
  const { sendTransaction, data: hash, isPending } = useSendTransaction();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  // Test the x402 API without payment (will get 402 response)
  const testWithoutPayment = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setPaymentRequired(null);

    try {
      const response = await fetch('/api/x402/test');
      const data = await response.json();
      
      if (response.status === 402) {
        // Payment required!
        setPaymentRequired(data);
        toast.error('Payment required to access this API');
      } else {
        setApiResponse(data);
      }
    } catch (error) {
      toast.error('Failed to call API');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Make the payment and retry
  const makePaymentAndRetry = async () => {
    if (!paymentRequired || !isConnected || !address) {
      toast.error('Wallet not connected or payment info missing');
      return;
    }

    const paymentInfo = paymentRequired.accepts[0];
    
    try {
      // Send payment transaction
      sendTransaction({
        to: paymentInfo.recipient as `0x${string}`,
        value: parseUnits(paymentInfo.amount, 18), // Assuming 18 decimals
        data: '0x' as `0x${string}`, // Empty data
      });

      // Wait for transaction to complete
      // In a real implementation, you'd pass the tx hash as payment proof
      
      toast.success('Payment sent! Retrying API call...');
      
      // Simulate retry with payment header
      setTimeout(async () => {
        const response = await fetch('/api/x402/test', {
          headers: {
            'X-PAYMENT': `tx:${hash}`, // In real implementation, this would be the signed payment
          }
        });
        
        const data = await response.json();
        setApiResponse(data);
        setPaymentRequired(null);
        toast.success('API access granted!');
      }, 2000);
      
    } catch (error) {
      toast.error('Payment failed');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Demo Section */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Cpu weight="duotone" size={24} className="text-primary" />
          Live x402 Demo
        </h3>

        <div className="space-y-4">
          {/* Step 1: Try API */}
          <div className="flex items-center gap-4">
            <button
              onClick={testWithoutPayment}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                "bg-primary text-white hover:bg-primary/90",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? 'Calling API...' : '1. Call Protected API'}
            </button>
            <span className="text-sm text-muted-foreground">
              This will return 402 Payment Required
            </span>
          </div>

          {/* Show 402 Response */}
          {paymentRequired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Warning weight="duotone" size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-2">
                    402 Payment Required
                  </p>
                  <div className="bg-white rounded p-3 font-mono text-xs">
                    <pre>{JSON.stringify(paymentRequired, null, 2)}</pre>
                  </div>
                  
                  {isConnected && (
                    <button
                      onClick={makePaymentAndRetry}
                      disabled={isPending}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {isPending ? 'Sending Payment...' : '2. Pay & Retry'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show Success Response */}
          {apiResponse && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle weight="fill" size={20} className="text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-2">
                    API Access Granted!
                  </p>
                  <div className="bg-white rounded p-3 font-mono text-xs">
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Circuitry weight="duotone" size={20} className="text-blue-600" />
          How This Demo Works
        </h4>
        
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong>Initial Request:</strong> Client calls API without payment
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong>402 Response:</strong> Server returns payment requirements (amount, recipient, network)
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong>Payment:</strong> Client sends USDC on Sei Network to specified address
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <strong>Retry with Proof:</strong> Client retries with transaction hash as payment proof
            </div>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
            <div>
              <strong>Access Granted:</strong> Server validates payment and returns premium content
            </div>
          </li>
        </ol>
      </div>

      {/* Real Implementation Note */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-start gap-3">
          <CurrencyCircleDollar weight="duotone" size={20} className="text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">Real Implementation Status</p>
            <p>
              This demo shows the actual x402 flow using Sei Network and USDC. In production:
            </p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Payments would use USDC token contract on Sei</li>
              <li>Server would verify on-chain payment before granting access</li>
              <li>Client would use x402-fetch for automatic payment handling</li>
              <li>Facilitator service would handle payment validation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}