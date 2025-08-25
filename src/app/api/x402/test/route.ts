import { NextRequest, NextResponse } from 'next/server';
// Note: x402Middleware is not exported from x402-next, removed unused import
import { 
  generatePaymentRequirements, 
  X402_CONFIG,
  getCurrentX402Config,
  isTestnet,
} from '@/lib/x402/config';

// This is a test API endpoint that requires payment via x402
export async function GET(req: NextRequest) {
  // Get network-specific configuration
  const networkConfig = getCurrentX402Config();
  
  // Configure x402 payment requirements
  const paymentConfig = {
    amount: X402_CONFIG.paymentPresets.api_call, // 0.001 USDC
    recipient: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  };

  // Check for payment header
  const paymentHeader = req.headers.get('X-PAYMENT');
  
  if (!paymentHeader) {
    // No payment provided - return 402 Payment Required
    const requirements = generatePaymentRequirements(
      paymentConfig.amount,
      paymentConfig.recipient
    );
    
    return NextResponse.json(
      {
        ...requirements,
        message: 'Payment required to access this API',
        testnet: isTestnet() ? {
          warning: 'Using Sei Atlantic-2 Testnet',
          usdcFaucet: 'https://testnet.circle.com/faucets/usdc',
          seiFaucet: 'https://atlantic-2.app.sei.io/faucet',
        } : undefined,
      },
      { 
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Network': networkConfig.network,
          'X-Payment-Chain-Id': networkConfig.chainId.toString(),
        }
      }
    );
  }

  // TODO: Validate payment with facilitator
  // In production, you would verify the payment on-chain
  
  // For now, simulate successful payment validation
  return NextResponse.json({
    success: true,
    message: 'Payment received! Here is your premium content.',
    network: networkConfig.network,
    data: {
      secret: 'This is the premium API response',
      timestamp: new Date().toISOString(),
      paidAmount: paymentConfig.amount,
      currency: 'USDC',
      network: isTestnet() ? 'Sei Atlantic-2 Testnet' : 'Sei Mainnet',
    }
  });
}

export async function POST(req: NextRequest) {
  // Example of a paid API endpoint that generates AI content
  const networkConfig = getCurrentX402Config();
  
  const paymentConfig = {
    amount: X402_CONFIG.paymentPresets.ai_generation, // 0.005 USDC for AI generation
    recipient: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  };

  const paymentHeader = req.headers.get('X-PAYMENT');
  
  if (!paymentHeader) {
    const requirements = generatePaymentRequirements(
      paymentConfig.amount,
      paymentConfig.recipient
    );
    
    return NextResponse.json(
      {
        ...requirements,
        message: 'Payment required for AI generation',
        testnet: isTestnet() ? {
          warning: 'Using Sei Atlantic-2 Testnet',
          info: 'Test payments only - no real value',
        } : undefined,
      },
      { 
        status: 402,
        headers: {
          'X-Payment-Network': networkConfig.network,
          'X-Payment-Chain-Id': networkConfig.chainId.toString(),
        }
      }
    );
  }

  // Simulate AI generation after payment
  const body = await req.json();
  
  return NextResponse.json({
    success: true,
    generated: `AI generated content for: ${body.prompt || 'default'}`,
    paidAmount: paymentConfig.amount,
  });
}