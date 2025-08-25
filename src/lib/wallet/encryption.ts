/**
 * SECURE WALLET ENCRYPTION MODULE
 * 
 * This module provides military-grade encryption for custodial wallets.
 * Private keys are NEVER stored in plaintext - always encrypted client-side.
 * 
 * Security Features:
 * - AES-256-GCM encryption (authenticated encryption)
 * - PBKDF2 key derivation (100,000+ iterations)
 * - Cryptographically secure random generation
 * - Zero-knowledge architecture
 */

// Constants for encryption
const PBKDF2_ITERATIONS = 100000; // High iteration count for security
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 32; // 256 bits

/**
 * Helper to ensure we have an ArrayBuffer (not SharedArrayBuffer)
 */
function toArrayBuffer(uint8Array: Uint8Array): ArrayBuffer {
  const buffer = uint8Array.buffer;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
  }
  // If it's a SharedArrayBuffer, create a new ArrayBuffer
  const arrayBuffer = new ArrayBuffer(uint8Array.byteLength);
  new Uint8Array(arrayBuffer).set(uint8Array);
  return arrayBuffer;
}

/**
 * Derives an encryption key from a password using PBKDF2
 * @param password - User's password
 * @param salt - Cryptographic salt
 * @returns Derived key for encryption
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a private key using AES-256-GCM
 * @param privateKey - The private key to encrypt
 * @param password - User's password for encryption
 * @returns Encrypted data with salt and IV
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<{
  encryptedKey: string;
  salt: string;
  iv: string;
  authTag: string;
}> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive encryption key from password
  const key = await deriveKey(password, salt);

  // Encrypt the private key
  const encoder = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    encoder.encode(privateKey)
  );

  // GCM mode includes auth tag in the last 16 bytes
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  // Convert to base64 for storage
  return {
    encryptedKey: btoa(String.fromCharCode(...ciphertext)),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    authTag: btoa(String.fromCharCode(...authTag)),
  };
}

/**
 * Decrypts a private key using AES-256-GCM
 * @param encryptedData - The encrypted key data
 * @param password - User's password for decryption
 * @returns Decrypted private key
 */
export async function decryptPrivateKey(
  encryptedData: {
    encryptedKey: string;
    salt: string;
    iv: string;
    authTag: string;
  },
  password: string
): Promise<string> {
  // Convert from base64
  const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedData.encryptedKey), c => c.charCodeAt(0));
  const authTag = Uint8Array.from(atob(encryptedData.authTag), c => c.charCodeAt(0));

  // Combine ciphertext and auth tag for GCM
  const encryptedBuffer = new Uint8Array(ciphertext.length + authTag.length);
  encryptedBuffer.set(ciphertext);
  encryptedBuffer.set(authTag, ciphertext.length);

  // Derive decryption key from password
  const key = await deriveKey(password, salt);

  // Decrypt the private key
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(iv),
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Invalid password or corrupted data');
  }
}

/**
 * Generates a secure random password
 * @param length - Length of the password (default: 32)
 * @returns Cryptographically secure password
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 12) {
    feedback.push('Password must be at least 12 characters long');
  } else if (password.length >= 16) {
    score += 2;
  } else {
    score += 1;
  }

  // Complexity checks
  if (!/[a-z]/.test(password)) {
    feedback.push('Include lowercase letters');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Include uppercase letters');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Include numbers');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Include special characters');
  } else {
    score += 1;
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score -= 1;
  }

  if (/^(password|123456|qwerty)/i.test(password)) {
    feedback.push('Avoid common passwords');
    score = 0;
  }

  return {
    isValid: score >= 4 && password.length >= 12,
    score: Math.max(0, Math.min(5, score)),
    feedback,
  };
}

/**
 * Creates a secure hash of sensitive data for verification
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a secure random nonce
 * @returns Random nonce for one-time use
 */
export function generateNonce(): string {
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...nonce));
}

/**
 * Time-constant comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns Whether strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Export encryption configuration
export const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: PBKDF2_ITERATIONS,
  saltLength: SALT_LENGTH * 8, // in bits
  ivLength: IV_LENGTH * 8, // in bits
  minPasswordLength: 12,
  recommendedPasswordLength: 16,
} as const;