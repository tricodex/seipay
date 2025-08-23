'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { wagmiConfig } from '@/lib/sei/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'sonner';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ConvexProvider client={convex}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: '#ff6b35',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
            modalSize="compact"
            showRecentTransactions={true}
          >
            {children}
            <Toaster
            position="bottom-right"
            richColors
            theme="light"
            toastOptions={{
              style: {
                background: 'white',
                color: '#09090b',
                border: '1px solid #e4e4e7',
                fontFamily: "'Inter Variable', system-ui, sans-serif",
              },
            }}
          />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConvexProvider>
  );
}