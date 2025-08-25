#!/usr/bin/env node

/**
 * SETUP TEST USER SCRIPT
 * Creates a test user with username in Convex for testing custodial wallets
 */

const { ConvexHttpClient } = require('convex/browser');
const { api } = require('../convex/_generated/api');

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
    const username = 'testuser';
    const displayName = 'Test User';
    
    console.log('Creating user with:');
    console.log('- Address:', testAddress);
    console.log('- Username:', username);
    console.log('- Display Name:', displayName);
    
    try {
      // Create or update user
      await client.mutation(api.users.createOrUpdateUser, {
        walletAddress: testAddress,
        username: username,
        displayName: displayName,
      });
      
      console.log('✅ Test user created successfully!');
      console.log('');
      console.log('You can now create custodial wallets for this test user.');
      
    } catch (error) {
      if (error.message && error.message.includes('already taken')) {
        console.log('⚠️  Username already exists, trying with timestamp...');
        const uniqueUsername = `testuser_${Date.now()}`;
        
        await client.mutation(api.users.createOrUpdateUser, {
          walletAddress: testAddress,
          username: uniqueUsername,
          displayName: displayName,
        });
        
        console.log('✅ Test user created with username:', uniqueUsername);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupTestUser();