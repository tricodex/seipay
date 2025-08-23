'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { 
  User, 
  PencilSimple, 
  CheckCircle, 
  XCircle,
  ArrowsClockwise,
  Warning,
  Copy
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { validateUsername, isValidWalletAddress } from '@/lib/security';

export function UsernameManager() {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Convex queries and mutations
  const user = useQuery(api.users.getUserByWallet, 
    address ? { walletAddress: address } : 'skip'
  );
  
  const registerUser = useMutation(api.users.registerUser);
  const changeUsername = useMutation(api.users.changeUsername);
  const checkAvailability = useQuery(api.users.isUsernameAvailable, 
    isChecking && newUsername.length >= 3 
      ? { username: newUsername, currentWallet: address }
      : 'skip'
  );

  // Register user on mount if needed (with validation)
  useEffect(() => {
    if (address && !user && isValidWalletAddress(address)) {
      registerUser({ walletAddress: address });
    }
  }, [address, user, registerUser]);

  // Handle username validation with security checks
  useEffect(() => {
    if (!isEditing) return;
    
    const timer = setTimeout(() => {
      const validation = validateUsername(newUsername);
      
      if (!validation.isValid) {
        setValidationMessage(validation.error || 'Invalid username');
        setIsChecking(false);
      } else if (newUsername.length >= 3) {
        setIsChecking(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newUsername, isEditing]);

  // Update validation message based on availability check
  useEffect(() => {
    if (checkAvailability) {
      setValidationMessage(checkAvailability.reason || '');
      setIsChecking(false);
    }
  }, [checkAvailability]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewUsername(user?.username || '');
    setValidationMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername('');
    setValidationMessage('');
    setIsChecking(false);
  };

  const handleSaveUsername = async () => {
    if (!address || !newUsername || !checkAvailability?.available) return;

    try {
      const result = await changeUsername({
        walletAddress: address,
        newUsername: newUsername,
      });

      if (result.success) {
        toast.success(`Username changed to @${newUsername}`);
        setIsEditing(false);
        setNewUsername('');
        setValidationMessage('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change username');
    }
  };

  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(`@${user.username}`);
      toast.success('Username copied to clipboard');
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Wallet address copied to clipboard');
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-center space-x-2">
          <ArrowsClockwise className="animate-spin text-primary" size={20} />
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User weight="duotone" size={24} className="text-primary" />
          Your Profile
        </h3>
        {user.isVerified && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
            <CheckCircle weight="fill" size={16} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Verified</span>
          </div>
        )}
      </div>

      {/* Username Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Username</label>
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">@{user.username}</span>
              <button
                onClick={handleCopyUsername}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
                title="Copy username"
              >
                <Copy weight="regular" size={16} className="text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-50 hover:bg-orange-100 text-primary rounded-lg transition-colors"
            >
              <PencilSimple weight="regular" size={16} />
              Change
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="Enter new username"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                  checkAvailability?.available 
                    ? "border-success focus:ring-success/20" 
                    : validationMessage && !isChecking
                    ? "border-destructive focus:ring-destructive/20"
                    : "border-border focus:ring-primary/20"
                )}
                maxLength={30}
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ArrowsClockwise className="animate-spin text-primary" size={16} />
                </div>
              )}
              {!isChecking && checkAvailability?.available && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle weight="fill" className="text-success" size={16} />
                </div>
              )}
              {!isChecking && validationMessage && !checkAvailability?.available && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XCircle weight="fill" className="text-destructive" size={16} />
                </div>
              )}
            </div>
            
            {validationMessage && (
              <p className={cn(
                "text-xs",
                checkAvailability?.available ? "text-success" : "text-destructive"
              )}>
                {validationMessage}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveUsername}
                disabled={!checkAvailability?.available || isChecking}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all",
                  checkAvailability?.available && !isChecking
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                Save Username
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Address Section */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </code>
          <button
            onClick={handleCopyAddress}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
            title="Copy address"
          >
            <Copy weight="regular" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
        <div>
          <div className="text-2xl font-bold text-primary">
            {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-muted-foreground">Member Since</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">
            {new Date(user.lastSeen).toLocaleTimeString()}
          </div>
          <div className="text-xs text-muted-foreground">Last Active</div>
        </div>
      </div>

      {/* Warning */}
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Warning weight="duotone" size={16} className="text-orange-600 mt-0.5" />
          <p className="text-xs text-orange-900">
            <strong>Important:</strong> Usernames are unique across the entire network. 
            Once changed, your old username becomes available for others to claim.
          </p>
        </div>
      </div>
    </div>
  );
}