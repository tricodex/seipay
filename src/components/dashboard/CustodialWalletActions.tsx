'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useMutation, useQuery, useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { getExplorerUrl } from '@/lib/sei/config';
import {
  PaperPlaneRight,
  Lock,
  LockOpen,
  Warning,
  CheckCircle,
  CaretDown,
  X,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { decryptPrivateKey } from '@/lib/wallet/encryption';

// Simple Ethereum address validation
const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

interface CustodialWalletActionsProps {
  wallet: any;
  onClose?: () => void;
}

export function CustodialWalletActions({ wallet, onClose }: CustodialWalletActionsProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [decryptedWallet, setDecryptedWallet] = useState<ethers.Wallet | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  // Transaction state
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Convex hooks
  const convex = useConvex();
  const recordFailedUnlock = useMutation(api.wallets.recordFailedUnlock);
  const resetFailedAttempts = useMutation(api.wallets.resetFailedAttempts);
  const storePayment = useMutation(api.payments.recordPayment);

  // Unlock wallet
  const handleUnlock = useCallback(async () => {
    if (!unlockPassword) {
      toast.error('Please enter your password');
      return;
    }

    setIsUnlocking(true);
    try {
      // Get encrypted wallet data from Convex using query
      const encryptedData = await convex.query(api.wallets.getEncryptedWallet, {
        userId: wallet.userId || '0x0000000000000000000000000000000000000001', // Test mode support
        walletId: wallet.walletId,
      });

      // Decrypt the private key
      const privateKey = await decryptPrivateKey(
        {
          encryptedKey: encryptedData.encryptedKey,
          salt: encryptedData.salt,
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
        },
        unlockPassword
      );

      // Create ethers wallet with provider
      const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
      const ethersWallet = new ethers.Wallet(privateKey, provider);
      
      setDecryptedWallet(ethersWallet);
      setIsUnlocked(true);
      
      // Reset failed attempts on successful unlock
      await resetFailedAttempts({
        userId: wallet.userId || '0x0000000000000000000000000000000000000001',
        walletId: wallet.walletId,
      });
      
      toast.success('Wallet unlocked successfully!');
      
      // Check balance
      const balance = await provider.getBalance(ethersWallet.address);
      const balanceInSei = ethers.formatEther(balance);
      console.log('Wallet balance:', balanceInSei, 'SEI');
      
    } catch (error: any) {
      console.error('Unlock error:', error);
      
      if (error.message && error.message.includes('Invalid password')) {
        // Record failed attempt
        try {
          const result = await recordFailedUnlock({
            userId: wallet.userId || '0x0000000000000000000000000000000000000001',
            walletId: wallet.walletId,
          });
          
          if (result.isLocked) {
            toast.error('Wallet locked after too many failed attempts');
          } else {
            toast.error(`Invalid password. ${result.attemptsRemaining} attempts remaining`);
          }
        } catch (recordError: any) {
          toast.error(recordError.message || 'Invalid password');
        }
      } else {
        toast.error(error.message || 'Failed to unlock wallet');
      }
    } finally {
      setIsUnlocking(false);
      setUnlockPassword('');
    }
  }, [wallet, unlockPassword, convex, recordFailedUnlock, resetFailedAttempts]);

  // Send transaction
  const handleSendTransaction = useCallback(async () => {
    if (!decryptedWallet) {
      toast.error('Please unlock the wallet first');
      return;
    }

    if (!validateAddress(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsSending(true);
    try {
      const provider = decryptedWallet.provider as ethers.JsonRpcProvider;
      
      // Check balance
      const balance = await provider.getBalance(decryptedWallet.address);
      const balanceInSei = parseFloat(ethers.formatEther(balance));
      const amountToSend = parseFloat(amount);
      
      if (amountToSend > balanceInSei) {
        toast.error(`Insufficient balance. Available: ${balanceInSei.toFixed(4)} SEI`);
        return;
      }

      // Estimate gas
      const gasPrice = await provider.getFeeData();
      const gasLimit = BigInt(21000); // Standard transfer
      const estimatedGas = parseFloat(ethers.formatEther(gasLimit * (gasPrice.gasPrice || BigInt(0))));
      
      if (amountToSend + estimatedGas > balanceInSei) {
        toast.error(`Insufficient balance for gas. Need: ${(amountToSend + estimatedGas).toFixed(4)} SEI`);
        return;
      }

      console.log('Sending transaction:', {
        from: decryptedWallet.address,
        to: recipientAddress,
        amount: amount,
        gasPrice: gasPrice.gasPrice?.toString(),
      });

      // Send transaction
      const tx = await decryptedWallet.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
        gasLimit: gasLimit,
      });

      toast.info('Transaction sent! Waiting for confirmation...');
      console.log('Transaction hash:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        setTxHash(tx.hash);
        
        // Store payment record in Convex
        await storePayment({
          fromAddress: decryptedWallet.address.toLowerCase(),
          toAddress: recipientAddress.toLowerCase(),
          amount: amount,
          currency: 'SEI',
          txHash: tx.hash,
          status: 'confirmed',
          message: `Sent from custodial wallet: ${wallet.fullWalletName || wallet.walletName}`,
        });
        
        toast.success(
          <div className="flex flex-col gap-1">
            <span>Transaction confirmed!</span>
            <a 
              href={getExplorerUrl(tx.hash, 'tx')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
            >
              View on Explorer →
            </a>
          </div>
        );
        
        // Clear form
        setRecipientAddress('');
        setAmount('');
        
      } else {
        toast.error('Transaction failed');
      }
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast.error(error.message || 'Failed to send transaction');
    } finally {
      setIsSending(false);
    }
  }, [decryptedWallet, recipientAddress, amount, wallet, storePayment]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Wallet Actions</h3>
            <p className="text-sm text-gray-600">{wallet.fullWalletName || wallet.walletName}</p>
            <p className="text-xs text-gray-500 font-mono">{wallet.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unlock Section */}
        {!isUnlocked ? (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-600">
              <Lock size={20} />
              <span className="font-medium">Wallet is locked</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter Password to Unlock
              </label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter encryption password"
                className="w-full p-2 border rounded-lg"
                disabled={isUnlocking}
              />
            </div>
            
            <button
              onClick={handleUnlock}
              disabled={isUnlocking || !unlockPassword}
              className={cn(
                "w-full py-2 px-4 rounded-lg font-medium transition-colors",
                "bg-black text-white hover:bg-gray-800",
                "disabled:bg-gray-300 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isUnlocking ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Unlocking...
                </>
              ) : (
                <>
                  <LockOpen size={18} />
                  Unlock Wallet
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Unlocked Status */}
            <div className="flex items-center gap-2 text-green-600 p-2 bg-green-50 rounded-lg">
              <CheckCircle size={20} />
              <span className="font-medium">Wallet Unlocked</span>
            </div>

            {/* Send Transaction Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 border rounded-lg font-mono text-sm"
                  disabled={isSending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (SEI)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.01"
                  step="0.001"
                  min="0"
                  className="w-full p-2 border rounded-lg"
                  disabled={isSending}
                />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {['0.001', '0.01', '0.1', '1'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    disabled={isSending}
                    className="flex-1 py-1 px-2 text-sm border rounded hover:bg-gray-50"
                  >
                    {preset} SEI
                  </button>
                ))}
              </div>

              <button
                onClick={handleSendTransaction}
                disabled={isSending || !recipientAddress || !amount}
                className={cn(
                  "w-full py-2 px-4 rounded-lg font-medium transition-colors",
                  "bg-orange-500 text-white hover:bg-orange-600",
                  "disabled:bg-gray-300 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperPlaneRight size={18} />
                    Send Transaction
                  </>
                )}
              </button>
            </div>

            {/* Transaction Result */}
            {txHash && (
              <div className="p-3 bg-green-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle size={20} />
                  <span className="font-medium">Transaction Successful!</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-mono break-all">{txHash}</p>
                  <a
                    href={getExplorerUrl(txHash, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View on Sei Explorer →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Agent Note */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
          <p className="font-medium mb-1">💡 AI Agent Integration</p>
          <p>This wallet can be controlled by AI agents when enabled. Set access levels in wallet settings to allow automated transactions.</p>
        </div>
      </div>
    </div>
  );
}