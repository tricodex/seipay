'use client';

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Wallet,
  Key,
  Lock,
  ShieldCheck,
  Plus,
  Upload,
  Eye,
  EyeSlash,
  Robot,
  Warning,
  CheckCircle,
  Copy,
  Trash,
  Settings,
  Download,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  generateWallet,
  importWallet,
  unlockWallet,
  validatePasswordStrength,
  generateSecurePassword,
  generateRecoveryCode,
  AccessLevel,
  WalletType,
} from '@/lib/wallet/custodial';

export function CustodialWalletPanel() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'wallets' | 'create' | 'import'>('wallets');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [walletLabel, setWalletLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Convex hooks
  const userWallets = useQuery(api.wallets.getUserWallets, {
    userId: address || '',
  });
  const storeWallet = useMutation(api.wallets.storeWallet);
  const updateAIAccess = useMutation(api.wallets.updateAIAccess);
  const deleteWallet = useMutation(api.wallets.deleteWallet);

  // Password validation
  const passwordValidation = validatePasswordStrength(password);

  // Handle wallet creation
  const handleCreateWallet = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Password is too weak');
      return;
    }

    setIsCreating(true);
    try {
      // Generate wallet client-side
      const { wallet, mnemonic } = await generateWallet(password, walletLabel);
      
      // Store encrypted wallet in Convex
      await storeWallet({
        userId: address.toLowerCase(),
        walletId: wallet.id,
        address: wallet.address,
        encryptedKey: wallet.encryptedKey,
        salt: wallet.salt,
        iv: wallet.iv,
        authTag: wallet.authTag,
        keyHash: wallet.keyHash,
        type: wallet.metadata.type,
        label: walletLabel || undefined,
      });

      setGeneratedMnemonic(mnemonic);
      toast.success('Wallet created successfully!');
      
      // Clear form
      setPassword('');
      setConfirmPassword('');
      setWalletLabel('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  }, [address, password, confirmPassword, passwordValidation, walletLabel, storeWallet]);

  // Handle wallet import
  const handleImportWallet = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!privateKeyInput) {
      toast.error('Please enter a private key');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('Password is too weak');
      return;
    }

    setIsCreating(true);
    try {
      // Import and encrypt wallet client-side
      const wallet = await importWallet(privateKeyInput, password, walletLabel);
      
      // Store encrypted wallet in Convex
      await storeWallet({
        userId: address.toLowerCase(),
        walletId: wallet.id,
        address: wallet.address,
        encryptedKey: wallet.encryptedKey,
        salt: wallet.salt,
        iv: wallet.iv,
        authTag: wallet.authTag,
        keyHash: wallet.keyHash,
        type: wallet.metadata.type,
        label: walletLabel || undefined,
      });

      toast.success('Wallet imported successfully!');
      setActiveTab('wallets');
      
      // Clear form
      setPassword('');
      setConfirmPassword('');
      setPrivateKeyInput('');
      setWalletLabel('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to import wallet');
    } finally {
      setIsCreating(false);
    }
  }, [address, privateKeyInput, password, confirmPassword, passwordValidation, walletLabel, storeWallet]);

  // Copy address to clipboard
  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Lock weight="duotone" size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">Custodial Wallets</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Create secure wallets that can be controlled by AI agents. Private keys are encrypted client-side with military-grade AES-256-GCM encryption.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck weight="duotone" size={16} className="text-green-600" />
              <span className="text-green-700 font-medium">Zero-knowledge architecture</span>
              <span className="text-muted-foreground">• Server never sees your private keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {[
          { id: 'wallets', label: 'My Wallets', icon: Wallet },
          { id: 'create', label: 'Create New', icon: Plus },
          { id: 'import', label: 'Import', icon: Upload },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-white shadow-sm font-medium"
                  : "hover:bg-white/50"
              )}
            >
              <Icon weight="regular" size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-6">
        {/* Wallets List */}
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            {!userWallets || userWallets.length === 0 ? (
              <div className="text-center py-8">
                <Wallet weight="duotone" size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No custodial wallets yet</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userWallets.map((wallet) => (
                  <div
                    key={wallet.walletId}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{wallet.label || 'Custodial Wallet'}</span>
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            wallet.type === 'generated' 
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          )}>
                            {wallet.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-muted-foreground">
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                          </code>
                          <button
                            onClick={() => copyAddress(wallet.address)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Copy weight="regular" size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {wallet.aiAccess.enabled && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-lg">
                            <Robot weight="duotone" size={16} className="text-purple-600" />
                            <span className="text-xs text-purple-700">AI Enabled</span>
                          </div>
                        )}
                        {wallet.isLocked && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
                            <Lock weight="fill" size={16} className="text-red-600" />
                            <span className="text-xs text-red-700">Locked</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Access Settings */}
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Agent Access</span>
                        <button
                          onClick={() => setSelectedWallet(wallet)}
                          className="p-1 hover:bg-white rounded"
                        >
                          <Settings weight="regular" size={16} />
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={wallet.aiAccess.enabled ? "text-green-600" : "text-gray-500"}>
                            {wallet.aiAccess.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Level:</span>
                          <span>{wallet.aiAccess.level.replace('_', ' ')}</span>
                        </div>
                        {wallet.aiAccess.dailyLimit && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Daily Limit:</span>
                            <span>{wallet.aiAccess.dailyLimit} SEI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Wallet */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            {!generatedMnemonic ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Wallet Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={walletLabel}
                    onChange={(e) => setWalletLabel(e.target.value)}
                    placeholder="e.g., AI Trading Wallet"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Encryption Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Strong password (min 12 characters)"
                      className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                    >
                      {showPassword ? (
                        <EyeSlash weight="regular" size={18} />
                      ) : (
                        <Eye weight="regular" size={18} />
                      )}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              passwordValidation.score === 0 && "bg-red-500 w-1/5",
                              passwordValidation.score === 1 && "bg-red-500 w-2/5",
                              passwordValidation.score === 2 && "bg-orange-500 w-3/5",
                              passwordValidation.score === 3 && "bg-yellow-500 w-4/5",
                              passwordValidation.score >= 4 && "bg-green-500 w-full"
                            )}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {passwordValidation.score < 2 && "Weak"}
                          {passwordValidation.score === 2 && "Fair"}
                          {passwordValidation.score === 3 && "Good"}
                          {passwordValidation.score >= 4 && "Strong"}
                        </span>
                      </div>
                      {passwordValidation.feedback.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {passwordValidation.feedback.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleCreateWallet}
                  disabled={isCreating || !passwordValidation.isValid || password !== confirmPassword}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-all",
                    isCreating || !passwordValidation.isValid || password !== confirmPassword
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {isCreating ? 'Creating Wallet...' : 'Create Secure Wallet'}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle weight="fill" size={24} className="text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-2">
                        Wallet Created Successfully!
                      </p>
                      <p className="text-sm text-green-800 mb-3">
                        Save your recovery phrase securely. You will need it to recover your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Warning weight="duotone" size={20} className="text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900 mb-2">
                        Recovery Phrase (Save This!)
                      </p>
                      <div className="p-3 bg-white rounded border border-orange-200 font-mono text-sm">
                        {generatedMnemonic}
                      </div>
                      <p className="text-xs text-orange-800 mt-2">
                        Never share this phrase. Anyone with it can access your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGeneratedMnemonic(null);
                    setActiveTab('wallets');
                  }}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  I've Saved My Recovery Phrase
                </button>
              </div>
            )}
          </div>
        )}

        {/* Import Wallet */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Warning weight="duotone" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Security Warning</p>
                  <p>Only import wallets you trust. Never share your private key with anyone.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Private Key
              </label>
              <textarea
                value={privateKeyInput}
                onChange={(e) => setPrivateKeyInput(e.target.value)}
                placeholder="Enter your private key (with or without 0x prefix)"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Wallet Label (Optional)
              </label>
              <input
                type="text"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
                placeholder="e.g., Imported Trading Wallet"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Encryption Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Strong password to encrypt this wallet"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              onClick={handleImportWallet}
              disabled={isCreating || !passwordValidation.isValid || password !== confirmPassword || !privateKeyInput}
              className={cn(
                "w-full py-3 rounded-lg font-medium transition-all",
                isCreating || !passwordValidation.isValid || password !== confirmPassword || !privateKeyInput
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {isCreating ? 'Importing Wallet...' : 'Import & Encrypt Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}