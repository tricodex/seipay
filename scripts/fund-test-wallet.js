#!/usr/bin/env node

/**
 * FUND TEST WALLET SCRIPT
 * Sends 1 SEI from $PKD wallet to our test wallet
 * BE CAREFUL: This uses real funds on testnet
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function fundTestWallet() {
  try {
    // Load test wallet address
    const testWalletPath = path.join(__dirname, '..', 'test-wallet.json');
    if (!fs.existsSync(testWalletPath)) {
      console.error('❌ Test wallet not found. Run test-wallet.js first!');
      process.exit(1);
    }
    
    const testWallet = JSON.parse(fs.readFileSync(testWalletPath, 'utf8'));
    const recipientAddress = testWallet.address;
    
    console.log('🚀 Funding Test Wallet');
    console.log('======================');
    console.log('Recipient:', recipientAddress);
    
    // Connect to Sei testnet
    const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
    
    // IMPORTANT: $PKD private key - handle with extreme care
    // This is the wallet with 5 SEI that the user mentioned
    // We'll send 1 SEI to our test wallet
    const PKD_PRIVATE_KEY = process.env.PKD_PRIVATE_KEY;
    
    if (!PKD_PRIVATE_KEY) {
      console.error('❌ PKD_PRIVATE_KEY not found in environment');
      console.log('');
      console.log('To fund the test wallet, you need to:');
      console.log('1. Set the PKD_PRIVATE_KEY environment variable');
      console.log('2. Run: PKD_PRIVATE_KEY="your_key_here" node scripts/fund-test-wallet.js');
      console.log('');
      console.log('⚠️  SECURITY: Never commit or expose the private key!');
      process.exit(1);
    }
    
    // Create wallet from private key
    const pkdWallet = new ethers.Wallet(PKD_PRIVATE_KEY, provider);
    
    // Check balance
    const balance = await provider.getBalance(pkdWallet.address);
    const balanceInSei = ethers.formatEther(balance);
    console.log('PKD Balance:', balanceInSei, 'SEI');
    
    if (parseFloat(balanceInSei) < 1.1) {
      console.error('❌ Insufficient balance. Need at least 1.1 SEI (1 SEI + gas)');
      process.exit(1);
    }
    
    // Send 1 SEI to test wallet
    const amountToSend = ethers.parseEther('1.0');
    
    console.log('');
    console.log('Sending 1 SEI to test wallet...');
    
    const tx = await pkdWallet.sendTransaction({
      to: recipientAddress,
      value: amountToSend,
      gasLimit: 21000,
    });
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed!');
    console.log('Block:', receipt.blockNumber);
    
    // Check new balance
    const newBalance = await provider.getBalance(recipientAddress);
    const newBalanceInSei = ethers.formatEther(newBalance);
    console.log('');
    console.log('Test wallet funded successfully!');
    console.log('New balance:', newBalanceInSei, 'SEI');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fundTestWallet();