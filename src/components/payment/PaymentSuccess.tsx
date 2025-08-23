'use client';

import { useEffect } from 'react';
import { LottieAnimation } from '@/components/animations/LottieAnimation';
import { X, CheckCircle } from '@phosphor-icons/react';
import { formatAddress, formatSei } from '@/lib/utils';
import TigerAnimation from '../../../public/Tiger.json';

interface PaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  recipient: string;
  recipientName?: string;
  txHash?: string;
}

export function PaymentSuccess({
  isOpen,
  onClose,
  amount,
  recipient,
  recipientName,
  txHash,
}: PaymentSuccessProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-2xl border border-border p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X weight="regular" size={20} />
        </button>
        
        {/* Content */}
        <div className="text-center space-y-6">
          {/* Success Animation */}
          <div className="w-32 h-32 mx-auto">
            <LottieAnimation
              animationData={TigerAnimation}
              loop={false}
              autoplay
            />
          </div>
          
          {/* Success Icon & Title */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle weight="fill" size={32} className="text-success" />
            </div>
            <h3 className="text-2xl font-bold">Payment Sent!</h3>
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{formatSei(amount)} SEI</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">To</span>
              <span className="font-medium">
                {recipientName || formatAddress(recipient)}
              </span>
            </div>
            {txHash && (
              <div className="pt-2">
                <a
                  href={`https://seitrace.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent transition-colors underline"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}