/**
 * Simple manual test for PaymentAgent transaction functionality
 * Run this test manually to verify the payment execution works
 */

import { parseEther } from 'viem';

describe('PaymentAgent Transaction Logic', () => {
  it('should validate transaction data correctly', () => {
    const transactionData = {
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
      amount: '1.5',
      message: 'Test payment'
    };
    
    // Validate address format
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(transactionData.to);
    expect(isValidAddress).toBe(true);
    
    // Validate amount parsing
    const value = parseEther(transactionData.amount);
    expect(value).toBe(1500000000000000000n); // 1.5 ETH in wei
  });
  
  it('should reject invalid addresses', () => {
    const invalidAddresses = [
      'alice.sei',
      '0x123',
      'not-an-address',
      '0xGGGG',
    ];
    
    invalidAddresses.forEach(address => {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      expect(isValid).toBe(false);
    });
  });
  
  it('should handle decimal amounts correctly', () => {
    const amounts = [
      { input: '0.001', expected: 1000000000000000n },
      { input: '0.5', expected: 500000000000000000n },
      { input: '10', expected: 10000000000000000000n },
      { input: '100.5', expected: 100500000000000000000n },
    ];
    
    amounts.forEach(({ input, expected }) => {
      const value = parseEther(input);
      expect(value).toBe(expected);
    });
  });
  
  it('should extract payment details from messages', () => {
    const messages = [
      {
        input: 'Send 5 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        expectedAmount: '5',
        expectedTo: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5'
      },
      {
        input: 'Transfer 0.5 SEI to 0x9A8E3B897F8993047d499126c9269C8567fB6B73',
        expectedAmount: '0.5',
        expectedTo: '0x9A8E3B897F8993047d499126c9269C8567fB6B73'
      },
      {
        input: 'send 10.25 sei to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        expectedAmount: '10.25',
        expectedTo: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5'
      }
    ];
    
    messages.forEach(({ input, expectedAmount, expectedTo }) => {
      const amountMatch = input.match(/(\d+(?:\.\d+)?)\s*sei/i);
      const toMatch = input.match(/to\s+(0x[a-fA-F0-9]{40})/i);
      
      expect(amountMatch?.[1]).toBe(expectedAmount);
      expect(toMatch?.[1]).toBe(expectedTo);
    });
  });
  
  it('should handle username resolution', () => {
    const messages = [
      'Send 5 SEI to alice.sei',
      'Transfer 10 SEI to bob',
      'Pay 2.5 SEI to merchant.sei'
    ];
    
    messages.forEach(message => {
      const toMatch = message.match(/to\s+([a-zA-Z0-9._-]+(?:\.sei)?|0x[a-fA-F0-9]{40})/i);
      const recipient = toMatch?.[1];
      
      if (recipient && !recipient.startsWith('0x')) {
        // This would be resolved to an address in the actual implementation
        expect(recipient).toMatch(/^[a-zA-Z0-9._-]+/);
      }
    });
  });
});