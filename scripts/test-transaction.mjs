#!/usr/bin/env node

/**
 * TEST TRANSACTION SCRIPT
 * Tests sending a transaction from a custodial wallet
 */

import { ethers } from 'ethers';
import fs from 'fs';

// Read test wallet
const testWallet = JSON.parse(fs.readFileSync('./test-wallet.json', 'utf8'));

async function testTransaction() {
  try {
    console.log('🚀 Testing custodial wallet transaction');
    console.log('Test wallet address:', testWallet.address);
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
    const wallet = new ethers.Wallet(testWallet.privateKey, provider);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Current balance:', ethers.formatEther(balance), 'SEI');
    
    if (parseFloat(ethers.formatEther(balance)) === 0) {
      console.log('\n⚠️  Wallet has no balance!');
      console.log('Please fund this address with test SEI:');
      console.log(wallet.address);
      console.log('\nYou can get test SEI from:');
      console.log('1. Sei Testnet Faucet: https://atlantic-2.app.sei.io/faucet');
      console.log('2. Or transfer from another wallet with test funds');
      
      // Generate a funding request QR or link
      console.log('\n📋 Funding Instructions:');
      console.log('1. Go to the faucet link above');
      console.log('2. Connect your wallet');
      console.log('3. Request test SEI for address:', wallet.address);
      console.log('4. Wait for confirmation');
      console.log('5. Run this script again');
      
      return;
    }
    
    // Test transaction
    const recipientAddress = '0x9Ac44C807FfcAf3e150e184a06a660EaE5b848C8';
    const amount = '0.001'; // Small test amount
    
    console.log('\n📤 Sending test transaction:');
    console.log('To:', recipientAddress);
    console.log('Amount:', amount, 'SEI');
    
    // Estimate gas
    const gasPrice = await provider.getFeeData();
    const gasLimit = 21000n;
    const estimatedGas = parseFloat(ethers.formatEther(gasLimit * (gasPrice.gasPrice || 0n)));
    
    console.log('Estimated gas:', estimatedGas.toFixed(6), 'SEI');
    
    // Check if we have enough for transaction + gas
    const totalNeeded = parseFloat(amount) + estimatedGas;
    if (totalNeeded > parseFloat(ethers.formatEther(balance))) {
      console.log('\n❌ Insufficient balance for transaction + gas');
      console.log('Need:', totalNeeded.toFixed(6), 'SEI');
      console.log('Have:', ethers.formatEther(balance), 'SEI');
      return;
    }
    
    // Send transaction
    console.log('\n🔄 Sending transaction...');
    const tx = await wallet.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther(amount),
      gasLimit: gasLimit,
    });
    
    console.log('Transaction hash:', tx.hash);
    console.log('Waiting for confirmation...');
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log('\n✅ Transaction confirmed!');
      console.log('Block number:', receipt.blockNumber);
      console.log('Gas used:', receipt.gasUsed.toString());
      console.log('\n🔗 View on Explorer:');
      console.log(`https://seitrace.com/tx/${tx.hash}?chain=atlantic-2`);
      
      // Check new balance
      const newBalance = await provider.getBalance(wallet.address);
      console.log('\nNew balance:', ethers.formatEther(newBalance), 'SEI');
      
      // Return transaction details for verification
      return {
        success: true,
        txHash: tx.hash,
        from: wallet.address,
        to: recipientAddress,
        amount: amount,
        blockNumber: receipt.blockNumber,
        explorerUrl: `https://seitrace.com/tx/${tx.hash}?chain=atlantic-2`
      };
    } else {
      console.log('❌ Transaction failed');
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n💡 You need to fund the test wallet first');
      console.log('Address:', testWallet.address);
    }
  }
}

// Run the test
testTransaction().then(result => {
  if (result && result.success) {
    console.log('\n🎉 Test completed successfully!');
    console.log('Transaction can be verified at:', result.explorerUrl);
  }
});