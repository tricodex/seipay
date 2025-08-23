'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/lib/sei/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';

const queryClient = new QueryClient();

function WalletProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={resolvedTheme === 'dark' ? darkTheme({
            accentColor: '#ff6b35',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          }) : lightTheme({
            accentColor: '#ff6b35',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            theme={resolvedTheme}
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <WalletProviders>{children}</WalletProviders>
    </ThemeProvider>
  );
}
