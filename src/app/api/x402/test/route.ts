import { NextRequest, NextResponse } from 'next/server';
import { x402Middleware } from 'x402-next';

// This is a test API endpoint that requires payment via x402
export async function GET(req: NextRequest) {
  // Configure x402 payment requirements
  const paymentConfig = {
    amount: '0.001', // 0.001 USDC
    currency: 'USDC',
    network: 'sei',
    recipient: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
    facilitator: 'https://api.x402.org/validate', // Coinbase's x402 facilitator
  };

  // Check for payment header
  const paymentHeader = req.headers.get('X-PAYMENT');
  
  if (!paymentHeader) {
    // No payment provided - return 402 Payment Required
    return NextResponse.json(
      {
        x402Version: '1.0',
        accepts: [{
          type: 'evm-transfer',
          currency: paymentConfig.currency,
          network: paymentConfig.network,
          amount: paymentConfig.amount,
          recipient: paymentConfig.recipient,
        }],
        message: 'Payment required to access this API'
      },
      { 
        status: 402,
        headers: {
          'Content-Type': 'application/json',
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
    data: {
      secret: 'This is the premium API response',
      timestamp: new Date().toISOString(),
      paidAmount: paymentConfig.amount,
    }
  });
}

export async function POST(req: NextRequest) {
  // Example of a paid API endpoint that generates AI content
  const paymentConfig = {
    amount: '0.005', // 0.005 USDC for AI generation
    currency: 'USDC',
    network: 'sei',
    recipient: process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000',
  };

  const paymentHeader = req.headers.get('X-PAYMENT');
  
  if (!paymentHeader) {
    return NextResponse.json(
      {
        x402Version: '1.0',
        accepts: [{
          type: 'evm-transfer',
          currency: paymentConfig.currency,
          network: paymentConfig.network,
          amount: paymentConfig.amount,
          recipient: paymentConfig.recipient,
        }],
        message: 'Payment required for AI generation'
      },
      { status: 402 }
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