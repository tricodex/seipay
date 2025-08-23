'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  PaperPlaneTilt, 
  Robot, 
  User, 
  Sparkle,
  Copy,
  CheckCircle,
  ArrowsClockwise,
  Lightning,
  Wallet,
  CurrencyCircleDollar
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PaymentAgentProps {
  address: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  transactionData?: {
    to?: string;
    amount?: string;
    message?: string;
  };
}

const EXAMPLE_PROMPTS = [
  "Send 10 SEI to alice.sei",
  "What's my wallet balance?",
  "Generate a payment QR code",
  "Split 50 SEI between 3 wallets",
  "Schedule a recurring payment",
  "Check transaction status"
];

const CAPABILITIES = [
  { icon: Lightning, label: "Instant Transfers", description: "Send SEI in under 1 second" },
  { icon: Wallet, label: "Balance Checks", description: "View wallet balances and history" },
  { icon: CurrencyCircleDollar, label: "Smart Payments", description: "Split bills and batch transfers" },
];

export function PaymentAgent({ address }: PaymentAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: "Hello! I'm your AI Payment Assistant. I can help you send payments, check balances, and manage transactions on Sei Network. How can I assist you today?",
      timestamp: new Date(),
      suggestions: EXAMPLE_PROMPTS.slice(0, 3)
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const processMessage = async (userMessage: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      let response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      // Parse common payment intents
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('send') && (lowerMessage.includes('sei') || lowerMessage.includes('to'))) {
        // Extract amount and recipient
        const amountMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*sei/i);
        const toMatch = userMessage.match(/to\s+([a-zA-Z0-9._-]+(?:\.sei)?|0x[a-fA-F0-9]{40})/i);
        
        if (amountMatch && toMatch) {
          response.content = `I'll help you send ${amountMatch[1]} SEI to ${toMatch[1]}. Here's the transaction setup:`;
          response.transactionData = {
            to: toMatch[1],
            amount: amountMatch[1],
            message: `Payment via AI Assistant`
          };
          response.suggestions = [
            "Add a payment message",
            "Change the amount",
            "Send to different address"
          ];
        } else {
          response.content = "I need more information to process this payment. Please specify both the amount and recipient address.";
          response.suggestions = [
            "Send 10 SEI to 0x...",
            "Transfer 5 SEI to alice.sei",
            "Pay 25 SEI to merchant.sei"
          ];
        }
      } else if (lowerMessage.includes('balance') || lowerMessage.includes('wallet')) {
        response.content = `Your wallet balance:\n\nAddress: ${address.slice(0, 6)}...${address.slice(-4)}\nBalance: 125.5 SEI\nPending: 0 SEI\n\nRecent transactions:\n• Received 50 SEI from alice.sei (2 hours ago)\n• Sent 10 SEI to merchant.sei (5 hours ago)\n• Received 85.5 SEI from bob.sei (yesterday)`;
        response.suggestions = [
          "Show transaction history",
          "Check pending transactions",
          "Export transaction data"
        ];
      } else if (lowerMessage.includes('qr') || lowerMessage.includes('receive')) {
        response.content = `I've generated a payment QR code for your wallet address. You can share this with anyone who wants to send you SEI.\n\nWallet Address: ${address}\n\n[QR Code would appear here in production]`;
        response.suggestions = [
          "Generate QR with amount",
          "Create payment request link",
          "Share via email"
        ];
      } else if (lowerMessage.includes('split') || lowerMessage.includes('divide')) {
        const amountMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*sei/i);
        const splitMatch = userMessage.match(/(?:between|among)\s+(\d+)/i);
        
        if (amountMatch && splitMatch) {
          const total = parseFloat(amountMatch[1]);
          const count = parseInt(splitMatch[1]);
          const perPerson = (total / count).toFixed(2);
          
          response.content = `I'll help you split ${total} SEI between ${count} recipients. Each person will receive ${perPerson} SEI.\n\nPlease provide the wallet addresses for the ${count} recipients.`;
          response.suggestions = [
            `Send ${perPerson} SEI to first recipient`,
            "Use address book",
            "Create payment group"
          ];
        } else {
          response.content = "To split a payment, please specify the total amount and number of recipients. For example: 'Split 100 SEI between 4 people'";
        }
      } else if (lowerMessage.includes('schedule') || lowerMessage.includes('recurring')) {
        response.content = "Recurring payments require smart contract deployment. This feature is coming soon!\n\nIn the meantime, you can:\n• Set calendar reminders for regular payments\n• Use batch transactions for multiple payments\n• Save recipient addresses for quick access";
        response.suggestions = [
          "Learn about smart contracts",
          "View saved recipients",
          "Create batch payment"
        ];
      } else if (lowerMessage.includes('status') || lowerMessage.includes('transaction')) {
        response.content = "I'll check the transaction status. Please provide the transaction hash or I can show your recent transactions.\n\nYour last 3 transactions:\n• ✅ 0x1a2b...3c4d - Confirmed (10 blocks ago)\n• ✅ 0x5e6f...7g8h - Confirmed (25 blocks ago)\n• ✅ 0x9i0j...1k2l - Confirmed (1 hour ago)";
        response.suggestions = [
          "Check specific transaction",
          "View on block explorer",
          "Download receipts"
        ];
      } else {
        response.content = `I understand you want to: "${userMessage}"\n\nWhile I'm still learning, I can help you with:\n• Sending payments\n• Checking balances\n• Generating QR codes\n• Splitting bills\n• Transaction history\n\nWhat would you like to do?`;
        response.suggestions = EXAMPLE_PROMPTS.slice(3, 6);
      }

      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    processMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Robot weight="duotone" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Payment Assistant</h2>
              <p className="text-sm text-muted-foreground">Powered by Sei Network</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-900">Online</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-3 gap-3">
          {CAPABILITIES.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <div key={index} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                <Icon weight="duotone" size={20} className="text-primary mb-1" />
                <div className="text-xs font-medium">{capability.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{capability.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              message.role === 'user' 
                ? "bg-primary text-white" 
                : message.role === 'assistant'
                ? "bg-orange-100 text-primary"
                : "bg-gray-100 text-gray-600"
            )}>
              {message.role === 'user' ? (
                <User weight="bold" size={16} />
              ) : message.role === 'assistant' ? (
                <Sparkle weight="fill" size={16} />
              ) : (
                <Robot weight="duotone" size={16} />
              )}
            </div>

            <div className={cn(
              "flex-1 space-y-2",
              message.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "rounded-xl px-4 py-3 max-w-[80%] relative group",
                message.role === 'user'
                  ? "bg-primary text-white ml-auto"
                  : "bg-gray-100 text-foreground"
              )}>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                
                {message.transactionData && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-xs font-mono space-y-1">
                      <div>To: {message.transactionData.to}</div>
                      <div>Amount: {message.transactionData.amount} SEI</div>
                      {message.transactionData.message && (
                        <div>Message: {message.transactionData.message}</div>
                      )}
                    </div>
                    <button className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors">
                      Execute Transaction
                    </button>
                  </div>
                )}

                {message.role !== 'user' && (
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-lg shadow-md border border-border"
                  >
                    {copiedId === message.id ? (
                      <CheckCircle weight="fill" size={14} className="text-success" />
                    ) : (
                      <Copy weight="regular" size={14} className="text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 text-xs bg-white border border-border rounded-lg hover:bg-orange-50 hover:border-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-primary flex items-center justify-center">
              <ArrowsClockwise weight="bold" size={16} className="animate-spin" />
            </div>
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-border">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about payments..."
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none resize-none"
            rows={1}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={cn(
              "px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              input.trim() && !isProcessing
                ? "gradient-primary text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            <PaperPlaneTilt weight="bold" size={20} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Example prompts */}
        {messages.length === 1 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(prompt)}
                  className="px-3 py-1.5 text-xs bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-primary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}