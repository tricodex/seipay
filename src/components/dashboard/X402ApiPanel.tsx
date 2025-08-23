'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  Code, 
  Key, 
  Circuitry, 
  Copy, 
  Trash, 
  Plus,
  CheckCircle,
  Warning,
  Info,
  Globe,
  ArrowRight,
  Cpu,
  HardDrive
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function X402ApiPanel() {
  const { address } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convex queries and mutations
  const apiKeys = useQuery(api.apiKeys.getApiKeys, 
    address ? { walletAddress: address } : 'skip'
  );
  
  const createApiKey = useMutation(api.apiKeys.createApiKey);
  const deactivateKey = useMutation(api.apiKeys.deactivateApiKey);
  const deleteKey = useMutation(api.apiKeys.deleteApiKey);

  const handleCreateKey = async () => {
    if (!address || !newKeyName.trim()) return;

    try {
      const result = await createApiKey({
        walletAddress: address,
        name: newKeyName.trim(),
      });

      setGeneratedKey(result.apiKey);
      setNewKeyName('');
      toast.success('API key created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = async (keyId: any) => {
    if (!address) return;

    try {
      await deleteKey({
        walletAddress: address,
        keyId,
      });
      toast.success('API key deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete key');
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-3">
          <Circuitry weight="duotone" size={24} className="text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold mb-2">HTTP 402 Payment Protocol (L402)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The x402 protocol enables micropayments for API calls using the Lightning Network. 
              Instead of subscriptions or rate limits, users pay tiny amounts per request.
            </p>
            
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs font-semibold text-purple-900 mb-1">Cost per Request</div>
                <div className="text-sm font-mono">0.0001 SEI</div>
                <div className="text-xs text-muted-foreground">~$0.001</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs font-semibold text-purple-900 mb-1">Settlement Time</div>
                <div className="text-sm font-mono">390ms</div>
                <div className="text-xs text-muted-foreground">Instant</div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="text-xs font-semibold text-purple-900 mb-1">No Setup Fee</div>
                <div className="text-sm font-mono">Pay-as-you-go</div>
                <div className="text-xs text-muted-foreground">No subscriptions</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-700">
              <Info weight="fill" size={14} />
              <span>Based on L402 (formerly LSAT) standard used by Lightning Labs</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Code weight="duotone" size={20} className="text-primary" />
          How x402 Works
        </h4>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center text-sm font-bold">1</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Client Makes Request</div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                GET /api/generate HTTP/1.1
              </code>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center text-sm font-bold">2</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Server Returns 402 Status</div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                HTTP/1.1 402 Payment Required
              </code>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block ml-2">
                X-Payment-Invoice: lnbc1000n1...
              </code>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center text-sm font-bold">3</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Client Pays Lightning Invoice</div>
              <div className="text-xs text-muted-foreground mt-1">
                Payment settles in ~390ms on Sei Network
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center text-sm font-bold">4</div>
            <div className="flex-1">
              <div className="font-medium text-sm">Client Retries with Proof</div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                Authorization: L402 token:preimage
              </code>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center text-sm font-bold">
              <CheckCircle weight="fill" size={16} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Server Returns Response</div>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                HTTP/1.1 200 OK
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Key weight="duotone" size={20} className="text-primary" />
            Your API Keys
          </h4>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus weight="bold" size={16} />
            Create Key
          </button>
        </div>

        {/* Generated Key Alert */}
        {generatedKey && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle weight="fill" size={20} className="text-success mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-green-900 mb-2">
                  API Key Created Successfully
                </p>
                <div className="bg-white rounded p-2 mb-2">
                  <code className="text-xs font-mono break-all">{generatedKey}</code>
                </div>
                <p className="text-xs text-green-800 mb-2">
                  ⚠️ Save this key securely. It won't be shown again!
                </p>
                <button
                  onClick={() => {
                    handleCopyKey(generatedKey);
                    setGeneratedKey(null);
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                >
                  <Copy weight="regular" size={14} />
                  Copy & Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && !generatedKey && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="space-y-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="API Key Name (e.g., Production API)"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={50}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                    newKeyName.trim()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Generate Key
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName('');
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        {apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{key.name}</div>
                  <div className="text-xs text-muted-foreground space-x-3">
                    <span>{key.keyPreview}</span>
                    <span>•</span>
                    <span>{key.usageToday}/{key.rateLimit} requests today</span>
                    <span>•</span>
                    <span className={cn(
                      "font-medium",
                      key.isActive ? "text-success" : "text-destructive"
                    )}>
                      {key.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete key"
                >
                  <Trash weight="regular" size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Key weight="light" size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No API keys yet</p>
            <p className="text-xs mt-1">Create your first key to start using x402 payments</p>
          </div>
        )}
      </div>

      {/* Example Implementation */}
      <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm">
        <div className="opacity-60 mb-4"># Example: Using x402 API with JavaScript</div>
        <pre className="overflow-x-auto">
{`async function callX402Api(endpoint, apiKey) {
  const response = await fetch(endpoint, {
    headers: { 'X-API-Key': apiKey }
  });
  
  if (response.status === 402) {
    // Get payment request
    const invoice = response.headers.get('X-Payment-Invoice');
    
    // Pay with Lightning (via wallet API)
    const payment = await payLightningInvoice(invoice);
    
    // Retry with payment proof
    return fetch(endpoint, {
      headers: {
        'X-API-Key': apiKey,
        'Authorization': \`L402 \${payment.token}:\${payment.preimage}\`
      }
    });
  }
  
  return response;
}`}</pre>
      </div>

      {/* Use Cases */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <Globe weight="duotone" size={24} className="text-primary mb-2" />
          <h5 className="font-semibold text-sm mb-2">Perfect For</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• AI model API calls (pay per generation)</li>
            <li>• Data feeds (pay per query)</li>
            <li>• Computing resources (pay per execution)</li>
            <li>• Content APIs (pay per article/video)</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-4">
          <HardDrive weight="duotone" size={24} className="text-primary mb-2" />
          <h5 className="font-semibold text-sm mb-2">Benefits</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• No credit card or KYC required</li>
            <li>• Instant settlement (390ms)</li>
            <li>• Micropayments (fractions of a cent)</li>
            <li>• No chargebacks or fraud</li>
          </ul>
        </div>
      </div>

      {/* Implementation Status */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Warning weight="duotone" size={20} className="text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">Implementation Status</p>
            <p>
              The x402 protocol demonstration above shows how Lightning-based micropayments 
              will work. Full implementation requires Lightning Network integration with Sei, 
              which is part of our roadmap for 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}