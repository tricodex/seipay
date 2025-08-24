/**
 * CUSTODIAL WALLET MANAGEMENT
 * 
 * Secure wallet generation and management for custodial wallets.
 * These wallets can be controlled by AI agents with proper authorization.
 * 
 * SECURITY FEATURES:
 * - Private keys are ALWAYS encrypted before storage
 * - Client-side encryption only
 * - Secure random generation
 * - Support for both imported and generated wallets
 */

import { ethers } from 'ethers';
import { 
  encryptPrivateKey, 
  decryptPrivateKey, 
  generateSecurePassword,
  validatePasswordStrength,
  hashData 
} from './encryption';

// Wallet types
export enum WalletType {
  GENERATED = 'generated',
  IMPORTED = 'imported',
}

// Wallet access levels for AI agents
export enum AccessLevel {
  NONE = 'none',              // No access
  VIEW_ONLY = 'view_only',    // Can view balance and transactions
  SEND_LIMITED = 'send_limited', // Can send up to daily limit
  FULL_ACCESS = 'full_access', // Full control (requires additional auth)
}

// Wallet metadata interface
export interface WalletMetadata {
  id: string;
  address: string;
  type: WalletType;
  createdAt: Date;
  lastUsed?: Date;
  label?: string;
  aiAccess: {
    enabled: boolean;
    level: AccessLevel;
    dailyLimit?: string; // In ETH/SEI
    spentToday?: string;
    lastReset?: Date;
  };
}

// Encrypted wallet interface (for storage)
export interface EncryptedWallet {
  id: string;
  address: string;
  encryptedKey: string;
  salt: string;
  iv: string;
  authTag: string;
  keyHash: string; // Hash of the private key for verification
  metadata: WalletMetadata;
}

/**
 * Generates a new Ethereum wallet with encrypted private key
 * @param password - Password for encryption
 * @param label - Optional label for the wallet
 * @returns Encrypted wallet data and mnemonic
 */
export async function generateWallet(
  password: string,
  label?: string
): Promise<{
  wallet: EncryptedWallet;
  mnemonic: string;
  address: string;
}> {
  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(`Weak password: ${validation.feedback.join(', ')}`);
  }

  // Generate new wallet with mnemonic
  const wallet = ethers.Wallet.createRandom();
  const mnemonic = wallet.mnemonic!.phrase;
  const privateKey = wallet.privateKey;
  const address = wallet.address;

  // Encrypt the private key
  const encrypted = await encryptPrivateKey(privateKey, password);
  
  // Create key hash for verification
  const keyHash = await hashData(privateKey);

  // Generate wallet ID
  const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create wallet metadata
  const metadata: WalletMetadata = {
    id: walletId,
    address,
    type: WalletType.GENERATED,
    createdAt: new Date(),
    label,
    aiAccess: {
      enabled: false,
      level: AccessLevel.NONE,
    },
  };

  // Create encrypted wallet object
  const encryptedWallet: EncryptedWallet = {
    id: walletId,
    address,
    ...encrypted,
    keyHash,
    metadata,
  };

  return {
    wallet: encryptedWallet,
    mnemonic,
    address,
  };
}

/**
 * Imports an existing wallet from private key
 * @param privateKey - Private key to import
 * @param password - Password for encryption
 * @param label - Optional label for the wallet
 * @returns Encrypted wallet data
 */
export async function importWallet(
  privateKey: string,
  password: string,
  label?: string
): Promise<EncryptedWallet> {
  // Validate password strength
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    throw new Error(`Weak password: ${validation.feedback.join(', ')}`);
  }

  // Validate and clean private key
  let cleanKey = privateKey.trim();
  if (!cleanKey.startsWith('0x')) {
    cleanKey = '0x' + cleanKey;
  }

  // Validate private key format
  if (!/^0x[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('Invalid private key format');
  }

  // Create wallet from private key
  const wallet = new ethers.Wallet(cleanKey);
  const address = wallet.address;

  // Encrypt the private key
  const encrypted = await encryptPrivateKey(cleanKey, password);
  
  // Create key hash for verification
  const keyHash = await hashData(cleanKey);

  // Generate wallet ID
  const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create wallet metadata
  const metadata: WalletMetadata = {
    id: walletId,
    address,
    type: WalletType.IMPORTED,
    createdAt: new Date(),
    label,
    aiAccess: {
      enabled: false,
      level: AccessLevel.NONE,
    },
  };

  // Create encrypted wallet object
  return {
    id: walletId,
    address,
    ...encrypted,
    keyHash,
    metadata,
  };
}

/**
 * Decrypts and retrieves wallet for use
 * @param encryptedWallet - Encrypted wallet data
 * @param password - Password for decryption
 * @returns Ethers wallet instance
 */
export async function unlockWallet(
  encryptedWallet: EncryptedWallet,
  password: string
): Promise<ethers.Wallet> {
  try {
    // Decrypt the private key
    const privateKey = await decryptPrivateKey(
      {
        encryptedKey: encryptedWallet.encryptedKey,
        salt: encryptedWallet.salt,
        iv: encryptedWallet.iv,
        authTag: encryptedWallet.authTag,
      },
      password
    );

    // Verify key hash
    const keyHash = await hashData(privateKey);
    if (keyHash !== encryptedWallet.keyHash) {
      throw new Error('Key verification failed');
    }

    // Create and return wallet
    return new ethers.Wallet(privateKey);
  } catch (error) {
    throw new Error('Failed to unlock wallet: Invalid password or corrupted data');
  }
}

/**
 * Updates AI access settings for a wallet
 * @param wallet - Encrypted wallet to update
 * @param settings - New AI access settings
 * @returns Updated wallet
 */
export function updateAIAccess(
  wallet: EncryptedWallet,
  settings: {
    enabled: boolean;
    level: AccessLevel;
    dailyLimit?: string;
  }
): EncryptedWallet {
  return {
    ...wallet,
    metadata: {
      ...wallet.metadata,
      aiAccess: {
        ...wallet.metadata.aiAccess,
        ...settings,
        lastReset: new Date(),
        spentToday: '0',
      },
    },
  };
}

/**
 * Checks if AI agent can perform transaction
 * @param wallet - Wallet to check
 * @param amount - Transaction amount in ETH/SEI
 * @returns Whether transaction is allowed
 */
export function canAITransact(
  wallet: EncryptedWallet,
  amount: string
): {
  allowed: boolean;
  reason?: string;
} {
  const { aiAccess } = wallet.metadata;

  // Check if AI access is enabled
  if (!aiAccess.enabled) {
    return { 
      allowed: false, 
      reason: 'AI access is disabled for this wallet' 
    };
  }

  // Check access level
  if (aiAccess.level === AccessLevel.NONE) {
    return { 
      allowed: false, 
      reason: 'AI has no transaction permissions' 
    };
  }

  if (aiAccess.level === AccessLevel.VIEW_ONLY) {
    return { 
      allowed: false, 
      reason: 'AI has view-only access' 
    };
  }

  // Check daily limit for limited access
  if (aiAccess.level === AccessLevel.SEND_LIMITED && aiAccess.dailyLimit) {
    // Reset daily spending if needed
    const lastReset = aiAccess.lastReset ? new Date(aiAccess.lastReset) : new Date(0);
    const now = new Date();
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceReset >= 1) {
      // Reset daily spending
      aiAccess.spentToday = '0';
      aiAccess.lastReset = now;
    }

    // Check if transaction exceeds daily limit
    const spentToday = parseFloat(aiAccess.spentToday || '0');
    const dailyLimit = parseFloat(aiAccess.dailyLimit);
    const transactionAmount = parseFloat(amount);

    if (spentToday + transactionAmount > dailyLimit) {
      return { 
        allowed: false, 
        reason: `Transaction exceeds daily limit. Limit: ${dailyLimit} SEI, Already spent: ${spentToday} SEI` 
      };
    }
  }

  return { allowed: true };
}

/**
 * Records AI transaction for limit tracking
 * @param wallet - Wallet to update
 * @param amount - Transaction amount
 * @returns Updated wallet
 */
export function recordAITransaction(
  wallet: EncryptedWallet,
  amount: string
): EncryptedWallet {
  const spentToday = parseFloat(wallet.metadata.aiAccess.spentToday || '0');
  const transactionAmount = parseFloat(amount);

  return {
    ...wallet,
    metadata: {
      ...wallet.metadata,
      lastUsed: new Date(),
      aiAccess: {
        ...wallet.metadata.aiAccess,
        spentToday: (spentToday + transactionAmount).toString(),
      },
    },
  };
}

/**
 * Generates a recovery code for wallet backup
 * @param encryptedWallet - Wallet to backup
 * @param masterPassword - Master password for additional encryption
 * @returns Encrypted recovery code
 */
export async function generateRecoveryCode(
  encryptedWallet: EncryptedWallet,
  masterPassword: string
): Promise<string> {
  // Create backup data
  const backupData = {
    wallet: encryptedWallet,
    timestamp: Date.now(),
    version: '1.0',
  };

  // Convert to JSON and encrypt
  const jsonData = JSON.stringify(backupData);
  const encrypted = await encryptPrivateKey(jsonData, masterPassword);

  // Create recovery code
  const recoveryCode = btoa(JSON.stringify(encrypted));
  
  // Add checksum for verification
  const checksum = (await hashData(recoveryCode)).substring(0, 8);
  
  return `SEIPAY-WALLET-${checksum}-${recoveryCode}`;
}

/**
 * Restores wallet from recovery code
 * @param recoveryCode - Recovery code
 * @param masterPassword - Master password
 * @returns Restored wallet
 */
export async function restoreFromRecoveryCode(
  recoveryCode: string,
  masterPassword: string
): Promise<EncryptedWallet> {
  // Validate format
  if (!recoveryCode.startsWith('SEIPAY-WALLET-')) {
    throw new Error('Invalid recovery code format');
  }

  // Extract and verify checksum
  const parts = recoveryCode.split('-');
  if (parts.length !== 4) {
    throw new Error('Invalid recovery code format');
  }

  const checksum = parts[2];
  const encodedData = parts[3];

  // Verify checksum
  const expectedChecksum = (await hashData(encodedData)).substring(0, 8);
  if (checksum !== expectedChecksum) {
    throw new Error('Recovery code checksum verification failed');
  }

  // Decode and decrypt
  const encrypted = JSON.parse(atob(encodedData));
  const decrypted = await decryptPrivateKey(encrypted, masterPassword);
  
  // Parse backup data
  const backupData = JSON.parse(decrypted);
  
  return backupData.wallet;
}