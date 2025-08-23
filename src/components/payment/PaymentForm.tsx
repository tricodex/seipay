'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { 
  PaperPlaneTilt, 
  CircleNotch, 
  Warning, 
  CheckCircle, 
  Coffee, 
  Lightning, 
  Heart,
  Hamburger,
  ForkKnife,
  Gift
} from '@phosphor-icons/react';
import { DEFAULT_PAYMENT_AMOUNTS, TX_STATUS, DEFAULT_NETWORK } from '@/lib/sei/config';
import { formatAddress, formatSei, isValidSeiAddress, cn } from '@/lib/utils';
import { PaymentSuccess } from './PaymentSuccess';

interface PaymentFormProps {
  recipientAddress?: string;
  recipientName?: string;
  defaultAmount?: string;
  showRecipientInput?: boolean;
}

export function PaymentForm({
  recipientAddress = '',
  recipientName,
  defaultAmount,
  showRecipientInput = true,
}: PaymentFormProps) {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const [recipient, setRecipient] = useState(recipientAddress);
  const [amount, setAmount] = useState(defaultAmount || '0.001');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [txStatus, setTxStatus] = useState<string>(TX_STATUS.IDLE);
  const [mounted, setMounted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const {
    sendTransaction,
    data: hash,
    isPending: isSending,
    error: sendError,
  } = useSendTransaction();
  
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (recipientAddress) {
      setRecipient(recipientAddress);
    }
  }, [recipientAddress]);

  useEffect(() => {
    if (isConfirmed && hash) {
      setTxStatus(TX_STATUS.CONFIRMED);
      setShowSuccessModal(true);
      
      // Reset form after modal closes
      setTimeout(() => {
        setCustomAmount('');
        setMessage('');
        setTxStatus(TX_STATUS.IDLE);
      }, 5000);
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    if (sendError) {
      setTxStatus(TX_STATUS.FAILED);
      toast.error('Transaction failed. Please try again.');
    }
  }, [sendError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mounted || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isValidSeiAddress(recipient)) {
      toast.error('Please enter a valid Sei address');
      return;
    }

    const paymentAmount = customAmount || amount;
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check if on correct network
    if (chain?.id !== DEFAULT_NETWORK.chainId) {
      try {
        await switchChain({ chainId: DEFAULT_NETWORK.chainId });
        toast.info(`Switched to ${DEFAULT_NETWORK.chainName}`);
        // Wait a bit for the switch to complete
        setTimeout(() => handleSend(), 500);
      } catch {
        toast.error(`Please switch to ${DEFAULT_NETWORK.chainName} to send payments`);
      }
      return;
    }

    await handleSend();
  };

  const handleSend = async () => {
    const paymentAmount = customAmount || amount;
    
    setTxStatus(TX_STATUS.CONFIRMING);
    
    try {
      await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(paymentAmount),
        data: message ? `0x${Buffer.from(message).toString('hex')}` : undefined,
      });
      
      setTxStatus(TX_STATUS.PENDING);
    } catch {
      setTxStatus(TX_STATUS.FAILED);
    }
  };

  const isLoading = isSending || isConfirming;
  const isSuccess = txStatus === TX_STATUS.CONFIRMED;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Send Payment
          </h2>
          {recipientName && (
            <p className="text-muted-foreground">
              to <span className="text-foreground font-medium">{recipientName}</span>
            </p>
          )}
        </div>

        {/* Recipient Input */}
        {showRecipientInput && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
        )}

        {/* Amount Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Amount (SEI)
          </label>
          
          {/* Preset Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {DEFAULT_PAYMENT_AMOUNTS.slice(0, 6).map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setAmount(preset.value);
                  setCustomAmount('');
                }}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  "hover:border-primary hover:shadow-md",
                  amount === preset.value && !customAmount
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  {preset.label.includes('Coffee') && <Coffee weight="duotone" size={24} className="text-primary" />}
                  {preset.label.includes('Lunch') && <Hamburger weight="duotone" size={24} className="text-primary" />}
                  {preset.label.includes('Dinner') && <ForkKnife weight="duotone" size={24} className="text-primary" />}
                  {preset.label.includes('Premium') && <Lightning weight="duotone" size={24} className="text-primary" />}
                  {preset.label.includes('Generous') && <Gift weight="duotone" size={24} className="text-primary" />}
                  {preset.label.includes('Supporter') && <Heart weight="duotone" size={24} className="text-primary" />}
                </div>
                <div className="text-xs font-medium">{preset.value} SEI</div>
                <div className="text-xs text-muted-foreground">{preset.usd}</div>
              </button>
            ))}
          </div>
          
          {/* Custom Amount */}
          <input
            type="number"
            placeholder="Custom amount (SEI)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            step="0.0001"
            min="0.0001"
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Optional Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Message (Optional)
          </label>
          <textarea
            placeholder="Add a note with your payment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Transaction Status */}
        {txStatus !== TX_STATUS.IDLE && (
          <div className={cn(
            "p-4 rounded-lg flex items-start gap-3",
            isSuccess ? "bg-green-500/10 text-green-500" :
            txStatus === TX_STATUS.FAILED ? "bg-red-500/10 text-red-500" :
            "bg-primary/10 text-primary"
          )}>
            {txStatus === TX_STATUS.CONFIRMING && <CircleNotch weight="regular" size={20} className="animate-spin mt-0.5" />}
            {txStatus === TX_STATUS.PENDING && <CircleNotch weight="regular" size={20} className="animate-spin mt-0.5" />}
            {isSuccess && <CheckCircle weight="fill" size={20} className="mt-0.5" />}
            {txStatus === TX_STATUS.FAILED && <Warning weight="fill" size={20} className="mt-0.5" />}
            
            <div className="flex-1">
              <div className="font-medium">
                {txStatus === TX_STATUS.CONFIRMING && 'Confirming transaction...'}
                {txStatus === TX_STATUS.PENDING && 'Transaction pending...'}
                {isSuccess && 'Payment sent successfully!'}
                {txStatus === TX_STATUS.FAILED && 'Transaction failed'}
              </div>
              {hash && (
                <a
                  href={`${DEFAULT_NETWORK.blockExplorerUrls[0]}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:no-underline mt-1 block"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!mounted || isLoading || !address || isSuccess}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all",
            "flex items-center justify-center gap-2",
            "bg-gradient-to-r from-primary to-accent",
            "text-primary-foreground",
            "hover:shadow-lg hover:scale-[1.02]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isLoading ? (
            <>
              <CircleNotch weight="regular" size={20} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle weight="fill" size={20} />
              <span>Payment Sent!</span>
            </>
          ) : (
            <>
              <PaperPlaneTilt weight="regular" size={20} />
              <span>Send Payment</span>
            </>
          )}
        </button>
      </form>
      
      {/* Payment Success Modal */}
      <PaymentSuccess
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={customAmount || amount}
        recipient={recipient}
        recipientName={recipientName}
        txHash={hash}
      />
    </div>
  );
}
