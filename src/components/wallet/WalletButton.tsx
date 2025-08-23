'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName, useBalance } from 'wagmi';
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check } from 'lucide-react';
import { formatAddress, formatSei, copyToClipboard, cn } from '@/lib/utils';
import { getExplorerUrl } from '@/lib/sei/config';
import { toast } from 'sonner';

export function WalletButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });
  
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    if (address) {
      const success = await copyToClipboard(address);
      if (success) {
        setCopied(true);
        toast.success('Address copied!');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleViewExplorer = () => {
    if (address) {
      window.open(getExplorerUrl(address, 'address'), '_blank');
    }
  };

  if (!mounted) {
    return (
      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium opacity-50">
        <Wallet className="w-4 h-4" />
      </button>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors"
          disabled={isPending}
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg z-50">
              <div className="p-2">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => {
                      connect({ connector });
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4 text-primary" />
                    <span>{connector.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "bg-card border border-border hover:border-primary transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-medium">
            {ensName || formatAddress(address || '')}
          </span>
          {balance && (
            <span className="text-muted-foreground text-sm">
              {formatSei(balance.formatted)} {balance.symbol}
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50">
            <div className="p-4 border-b border-border">
              <div className="text-sm text-muted-foreground mb-1">Connected to</div>
              <div className="font-medium">{chain?.name || 'Unknown Network'}</div>
            </div>

            <div className="p-2">
              <button
                onClick={handleCopy}
                className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-primary" />
                )}
                <span>Copy Address</span>
              </button>

              <button
                onClick={handleViewExplorer}
                className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span>View in Explorer</span>
              </button>

              <hr className="my-2 border-border" />

              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors flex items-center gap-2 text-red-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
