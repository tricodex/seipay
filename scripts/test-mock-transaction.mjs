#!/usr/bin/env node

/**
 * MOCK TRANSACTION TEST
 * Tests the transaction flow without actual blockchain interaction
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import crypto from 'crypto';

async function testMockTransaction() {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://reliable-pig-585.convex.cloud';
    
    console.log('🚀 Testing mock transaction flow');
    console.log('Convex URL:', convexUrl);
    
    // Create Convex client
    const client = new ConvexHttpClient(convexUrl);
    
    // Mock transaction details
    const fromAddress = '0x7eE0a7645eE7358f19c88659486EFC5d81d13A2a';
    const toAddress = '0x9Ac44C807FfcAf3e150e184a06a660EaE5b848C8';
    const amount = '0.001';
    const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    console.log('\n📤 Simulating transaction:');
    console.log('From:', fromAddress);
    console.log('To:', toAddress);
    console.log('Amount:', amount, 'SEI');
    console.log('Mock TX Hash:', mockTxHash);
    
    // Store the mock transaction in Convex
    console.log('\n💾 Storing transaction in database...');
    const payment = await client.mutation(api.payments.recordPayment, {
      fromAddress: fromAddress.toLowerCase(),
      toAddress: toAddress.toLowerCase(),
      amount: amount,
      currency: 'SEI',
      message: 'Test transaction from custodial wallet',
      txHash: mockTxHash,
      status: 'confirmed',
    });
    
    console.log('✅ Transaction stored successfully!');
    console.log('Payment ID:', payment._id);
    
    // Verify the transaction was stored
    console.log('\n🔍 Verifying stored transaction...');
    const storedPayment = await client.query(api.payments.getPaymentByTxHash, {
      txHash: mockTxHash,
    });
    
    if (storedPayment) {
      console.log('✅ Transaction verified in database!');
      console.log('Details:', {
        from: storedPayment.fromAddress,
        to: storedPayment.toAddress,
        amount: storedPayment.amount,
        status: storedPayment.status,
        timestamp: new Date(storedPayment.timestamp).toISOString(),
      });
      
      // Mock explorer URL
      const explorerUrl = `https://seitrace.com/tx/${mockTxHash}?chain=atlantic-2`;
      console.log('\n🔗 Mock Explorer URL:');
      console.log(explorerUrl);
      console.log('(This is a mock transaction, so the explorer link won\'t work)');
      
      // Get payment history for the sender
      console.log('\n📊 Checking payment history...');
      const history = await client.query(api.payments.getPaymentHistory, {
        walletAddress: fromAddress,
        limit: 5,
        type: 'sent',
      });
      
      console.log(`Found ${history.length} sent transactions`);
      if (history.length > 0) {
        console.log('Latest transaction:', {
          to: history[0].toAddress,
          amount: history[0].amount,
          txHash: history[0].txHash,
        });
      }
      
      // Get payment stats
      console.log('\n📈 Payment statistics:');
      const stats = await client.query(api.payments.getPaymentStats, {
        walletAddress: fromAddress,
      });
      
      console.log('Total sent:', stats.totalSent, 'SEI');
      console.log('Sent count:', stats.sentCount);
      console.log('Unique recipients:', stats.uniqueRecipients);
      
      return {
        success: true,
        payment: storedPayment,
        explorerUrl,
      };
    } else {
      console.log('❌ Transaction not found in database');
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testMockTransaction().then(result => {
  if (result && result.success) {
    console.log('\n🎉 Mock transaction test completed successfully!');
    console.log('The transaction flow and database storage are working correctly.');
    console.log('\nNext steps:');
    console.log('1. Fund the test wallet with SEI from the faucet');
    console.log('2. Test with real blockchain transactions');
  }
});