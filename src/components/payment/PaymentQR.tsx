'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Share2, Download, Copy, CheckCircle, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { generatePaymentUrl, copyToClipboard } from '@/lib/utils';

interface PaymentQRProps {
  address: string;
  recipientName?: string;
  amount?: string;
}

export function PaymentQR({ address, recipientName = 'User', amount }: PaymentQRProps) {
  const [copied, setCopied] = useState(false);
  
  const paymentUrl = generatePaymentUrl(address, amount);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(paymentUrl);
    if (success) {
      setCopied(true);
      toast.success('Payment link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };
  
  const handleDownloadQR = () => {
    const wrapper = document.getElementById('seipay-qr-code');
    const svg = wrapper?.querySelector('svg');
    if (!svg) return;
    
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('width', '512');
    clonedSvg.setAttribute('height', '512');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const img = new Image();
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Dark background with gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(1, '#1a0f0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Add padding
      const padding = 40;
      const qrSize = size - (padding * 2);
      
      // White background for QR code
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(padding, padding, qrSize, qrSize);
      
      // Draw QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize);
      
      // Download
      const link = document.createElement('a');
      link.download = `seipay-qr-${address.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    };
    
    img.onerror = () => {
      toast.error('Failed to download QR code');
    };
    
    img.src = url;
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pay ${recipientName} on Sei`,
          text: `Send payments to ${recipientName} using SeiPay`,
          url: paymentUrl,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* QR Code Card */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Payment QR</h3>
          </div>
          {amount && (
            <span className="text-sm px-2 py-1 rounded bg-primary/10 text-primary font-medium">
              {amount} SEI
            </span>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg">
          <div id="seipay-qr-code" style={{ lineHeight: 0 }}>
            <QRCode
              value={paymentUrl}
              size={200}
              level="H"
              fgColor="#ff6b35"
              bgColor="#FFFFFF"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>
        </div>
      </div>
      
      {/* Payment URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Payment Link
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={paymentUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors"
            title="Copy link"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        <button
          onClick={handleDownloadQR}
          className="flex-1 py-2.5 px-4 rounded-lg bg-card border border-border hover:border-primary transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>
      
      {/* Info Text */}
      <p className="text-xs text-center text-muted-foreground">
        Share this QR code to receive instant payments on Sei Network
      </p>
    </div>
  );
}
