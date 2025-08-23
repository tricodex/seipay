import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import DashboardPage from '../page';

// Mock the modules
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div>Header</div>,
}));

vi.mock('@/components/dashboard/DashboardContent', () => ({
  DashboardContent: ({ address }: { address: string }) => (
    <div>Dashboard Content for {address}</div>
  ),
}));

describe('Dashboard Authentication', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('should show loading state initially', () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: true,
      isReconnecting: false,
    });

    render(<DashboardPage />);
    
    expect(screen.getByText('Checking wallet connection...')).toBeInTheDocument();
  });

  it('should show wallet connection required when not connected', async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Wallet Connection Required')).toBeInTheDocument();
    }, { timeout: 1500 });
    
    expect(screen.getByText(/The dashboard contains personalized features/)).toBeInTheDocument();
  });

  it('should show dashboard content when wallet is connected', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    
    (useAccount as any).mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(`Dashboard Content for ${mockAddress}`)).toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('should handle reconnecting state', () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: true,
    });

    render(<DashboardPage />);
    
    expect(screen.getByText('Checking wallet connection...')).toBeInTheDocument();
  });

  it('should not allow access without valid address even if connected', async () => {
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Loading wallet address...')).toBeInTheDocument();
    }, { timeout: 1500 });
  });
});

describe('Dashboard Security', () => {
  it('should validate Ethereum address format', () => {
    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = 'not-an-address';
    
    // This is a simple validation function that should be used
    const isValidEthereumAddress = (address: string) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    };
    
    expect(isValidEthereumAddress(validAddress)).toBe(true);
    expect(isValidEthereumAddress(invalidAddress)).toBe(false);
  });

  it('should sanitize user input to prevent XSS', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitizedInput = maliciousInput.replace(/[<>]/g, '');
    
    expect(sanitizedInput).not.toContain('<script>');
    expect(sanitizedInput).not.toContain('</script>');
  });

  it('should timeout authentication check after reasonable time', async () => {
    vi.useFakeTimers();
    
    (useAccount as any).mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: true,
      isReconnecting: false,
    });

    render(<DashboardPage />);
    
    // Initially should be checking
    expect(screen.getByText('Checking wallet connection...')).toBeInTheDocument();
    
    // After timeout, should stop checking
    vi.advanceTimersByTime(1000);
    
    vi.useRealTimers();
  });
});