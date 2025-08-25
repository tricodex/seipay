import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentAgent } from '../PaymentAgent';
import { toast } from 'sonner';

// Mock modules
const mockSendTransaction = vi.fn();
const mockIsConnected = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => ({
    isConnected: mockIsConnected(),
  }),
  useSendTransaction: () => ({
    sendTransaction: mockSendTransaction,
    data: mockSendTransaction.mock.results[0]?.value,
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PaymentAgent Integration Tests', () => {
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsConnected.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Transaction Execution', () => {
    it('executes transaction when Execute Transaction button is clicked', async () => {
      mockSendTransaction.mockResolvedValue('0xabc123def456');
      
      render(<PaymentAgent address={mockAddress} />);
      
      // Send a payment message
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1.5 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      // Wait for AI response
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      // Click execute button
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      // Verify transaction was called
      expect(mockSendTransaction).toHaveBeenCalledWith({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        value: expect.any(BigInt), // parseEther('1.5')
      });
      
      // Check for success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Transaction sent! Waiting for confirmation...');
      });
    });

    it('shows error when wallet is not connected', async () => {
      mockIsConnected.mockReturnValue(false);
      
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      expect(toast.error).toHaveBeenCalledWith('Please connect your wallet first');
      expect(mockSendTransaction).not.toHaveBeenCalled();
    });

    it('validates address format before sending', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      // Send with invalid address
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to invalidaddress');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      // Should show error for invalid address
      expect(toast.error).toHaveBeenCalledWith('Invalid recipient address format');
      expect(mockSendTransaction).not.toHaveBeenCalled();
    });

    it('handles transaction errors gracefully', async () => {
      const errorMessage = 'User rejected transaction';
      mockSendTransaction.mockRejectedValue(new Error(errorMessage));
      
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
        expect(screen.getByText(/❌ Transaction failed: User rejected transaction/)).toBeInTheDocument();
      });
    });

    it('shows processing state during transaction', async () => {
      // Make sendTransaction take some time
      mockSendTransaction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('0xabc123'), 1000))
      );
      
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      // Should show processing state
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('displays transaction hash after successful submission', async () => {
      const txHash = '0xabc123def456789';
      mockSendTransaction.mockResolvedValue(txHash);
      
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/✨ Transaction submitted!/)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(txHash))).toBeInTheDocument();
      });
    });
  });

  describe('Message Processing', () => {
    it('correctly parses decimal amounts', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 0.005 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText(/Amount: 0.005 SEI/)).toBeInTheDocument();
      });
    });

    it('handles large amounts correctly', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1000000 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText(/Amount: 1000000 SEI/)).toBeInTheDocument();
      });
    });

    it('extracts addresses with mixed case', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      const mixedCaseAddress = '0x742D35Cc6634C0532925A3B844bc9E7595F0BEb5';
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, `Send 1 SEI to ${mixedCaseAddress}`);
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(mixedCaseAddress))).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error for missing amount', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText(/I need more information to process this payment/)).toBeInTheDocument();
      });
    });

    it('shows error for missing recipient', async () => {
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 10 SEI');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText(/I need more information to process this payment/)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      mockSendTransaction.mockRejectedValue(new Error('Network error'));
      
      render(<PaymentAgent address={mockAddress} />);
      
      const input = screen.getByPlaceholderText('Ask me anything about payments...');
      await userEvent.type(input, 'Send 1 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
      
      const form = input.closest('form');
      fireEvent.submit(form!);
      
      await waitFor(() => {
        expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
      });
      
      const executeButton = screen.getByText('Execute Transaction');
      await userEvent.click(executeButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
        expect(screen.getByText(/❌ Transaction failed: Network error/)).toBeInTheDocument();
      });
    });
  });
});