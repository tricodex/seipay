import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentAgent } from '../PaymentAgent';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ isConnected: true })),
  useSendTransaction: vi.fn(() => ({
    sendTransaction: vi.fn().mockResolvedValue('0x123abc'),
    data: null,
    isPending: false,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
  })),
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PaymentAgent', () => {
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the AI assistant interface', () => {
    render(<PaymentAgent address={mockAddress} />);
    
    expect(screen.getByText('AI Payment Assistant')).toBeInTheDocument();
    expect(screen.getByText('Powered by Sei Network')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays initial system message', () => {
    render(<PaymentAgent address={mockAddress} />);
    
    expect(screen.getByText(/Hello! I'm your AI Payment Assistant/)).toBeInTheDocument();
  });

  it('shows capability cards', () => {
    render(<PaymentAgent address={mockAddress} />);
    
    expect(screen.getByText('Instant Transfers')).toBeInTheDocument();
    expect(screen.getByText('Balance Checks')).toBeInTheDocument();
    expect(screen.getByText('Smart Payments')).toBeInTheDocument();
  });

  it('handles user input submission', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(input, 'Send 10 SEI to alice.sei');
    await userEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Send 10 SEI to alice.sei')).toBeInTheDocument();
    });
  });

  it('processes payment intent correctly', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Send 5.5 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/I'll help you send 5.5 SEI/)).toBeInTheDocument();
    });
  });

  it('shows transaction data when payment is detected', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Send 10 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/Amount: 10 SEI/)).toBeInTheDocument();
      expect(screen.getByText('Execute Transaction')).toBeInTheDocument();
    });
  });

  it('handles balance check requests', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, "What's my wallet balance?");
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/Your wallet balance:/)).toBeInTheDocument();
      expect(screen.getByText(/125.5 SEI/)).toBeInTheDocument();
    });
  });

  it('handles QR code generation requests', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Generate a payment QR code');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/I've generated a payment QR code/)).toBeInTheDocument();
    });
  });

  it('handles bill splitting requests', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Split 100 SEI between 4 people');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/split 100 SEI between 4 recipients/)).toBeInTheDocument();
      expect(screen.getByText(/Each person will receive 25.00 SEI/)).toBeInTheDocument();
    });
  });

  it('displays suggestions after AI response', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Send 10 SEI to alice.sei');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText('Add a payment message')).toBeInTheDocument();
      expect(screen.getByText('Change the amount')).toBeInTheDocument();
    });
  });

  it('handles suggestion clicks', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    // Click on an example prompt
    const examplePrompt = screen.getByText('Send 10 SEI to alice.sei');
    await userEvent.click(examplePrompt);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    expect(input).toHaveValue('Send 10 SEI to alice.sei');
  });

  it('prevents submission when input is empty', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await userEvent.type(input, 'Test message');
    expect(sendButton).not.toBeDisabled();
  });

  it('handles Enter key submission', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Test message{enter}');
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('prevents Enter key submission with Shift', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Line 1{shift>}{enter}{/shift}Line 2');
    
    expect(input).toHaveValue('Line 1\nLine 2');
  });

  it('shows loading state while processing', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Test message');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    // Check for loading animation
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles copy to clipboard', async () => {
    const mockClipboard = {
      writeText: vi.fn(),
    };
    Object.assign(navigator, { clipboard: mockClipboard });
    
    render(<PaymentAgent address={mockAddress} />);
    
    // Wait for initial message
    const systemMessage = await screen.findByText(/Hello! I'm your AI Payment Assistant/);
    
    // Hover over the message to show copy button
    fireEvent.mouseEnter(systemMessage.closest('.group')!);
    
    // Click copy button
    const copyButton = systemMessage.closest('.group')?.querySelector('button[class*="absolute"]');
    if (copyButton) {
      fireEvent.click(copyButton);
      expect(mockClipboard.writeText).toHaveBeenCalled();
    }
  });

  it('resolves usernames to addresses', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Send 5 SEI to alice.sei');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      // Should show resolved address
      expect(screen.getByText(/resolved to 0x742d...bEb5/)).toBeInTheDocument();
    });
  });

  it('validates Ethereum addresses', async () => {
    render(<PaymentAgent address={mockAddress} />);
    
    const input = screen.getByPlaceholderText('Ask me anything about payments...');
    await userEvent.type(input, 'Send 5 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5');
    
    const form = input.closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      // Should not show "resolved to" for valid addresses
      expect(screen.queryByText(/resolved to/)).not.toBeInTheDocument();
      expect(screen.getByText(/I'll help you send 5 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5/)).toBeInTheDocument();
    });
  });
});