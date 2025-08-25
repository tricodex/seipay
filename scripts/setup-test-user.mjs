#!/usr/bin/env node

/**
 * SETUP TEST USER SCRIPT
 * Creates a test user with username in Convex for testing custodial wallets
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

async function setupTestUser() {
  try {
    // Get Convex URL from environment
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://reliable-pig-585.convex.cloud';
    
    console.log('🚀 Setting up test user');
    console.log('Convex URL:', convexUrl);
    
    // Create Convex client
    const client = new ConvexHttpClient(convexUrl);
    
    // Test user address (same as we're using in the component)
    const testAddress = '0x0000000000000000000000000000000000000001';
    
    console.log('Creating user with address:', testAddress);
    
    // Register user (this will create a user with auto-generated username)
    const user = await client.mutation(api.users.registerUser, {
      walletAddress: testAddress,
    });
    
    console.log('✅ Test user created/updated successfully!');
    console.log('Username:', user.username);
    console.log('Display Name:', user.displayName || 'Not set');
    console.log('');
    console.log('You can now create custodial wallets for this test user.');
    console.log('The wallet name will be: ' + user.username + '.<wallet-name>');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupTestUser();