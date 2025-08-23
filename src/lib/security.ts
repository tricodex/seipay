/**
 * Security utilities for wallet authentication and data validation
 */

/**
 * Validates if a string is a valid Ethereum/Sei address
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function isValidWalletAddress(address: string): boolean {
  if (!address) return false;
  
  // Check for correct format: 0x followed by 40 hexadecimal characters
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

/**
 * Validates and sanitizes username input
 * @param username - The username to validate
 * @returns Object with validation result and sanitized username
 */
export function validateUsername(username: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  // Remove any whitespace
  const trimmed = username.trim();
  
  // Check length
  if (trimmed.length < 3) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: 'Username must be at least 3 characters long'
    };
  }
  
  if (trimmed.length > 30) {
    return {
      isValid: false,
      sanitized: trimmed.slice(0, 30),
      error: 'Username must be 30 characters or less'
    };
  }
  
  // Only allow alphanumeric, dash, and underscore
  const sanitized = trimmed.replace(/[^a-zA-Z0-9-_]/g, '');
  
  if (sanitized !== trimmed) {
    return {
      isValid: false,
      sanitized,
      error: 'Username can only contain letters, numbers, dashes, and underscores'
    };
  }
  
  // Check for reserved usernames
  const reserved = ['admin', 'root', 'system', 'moderator', 'seipay', 'official'];
  if (reserved.includes(sanitized.toLowerCase())) {
    return {
      isValid: false,
      sanitized,
      error: 'This username is reserved'
    };
  }
  
  return {
    isValid: true,
    sanitized
  };
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags and script content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates transaction amount
 * @param amount - The amount to validate
 * @returns true if valid, false otherwise
 */
export function isValidAmount(amount: string): boolean {
  if (!amount) return false;
  
  const num = parseFloat(amount);
  
  // Check if it's a valid number
  if (isNaN(num)) return false;
  
  // Check if it's positive
  if (num <= 0) return false;
  
  // Check for reasonable maximum (prevent overflow)
  if (num > 1000000000) return false; // 1 billion max
  
  // Check decimal places (max 18 for most tokens)
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 18) return false;
  
  return true;
}

/**
 * Rate limiting helper for API calls
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Check if an identifier has exceeded rate limit
   * @param identifier - Unique identifier (wallet address, IP, etc.)
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // Update the attempts
    this.attempts.set(identifier, validAttempts);
    
    // Check if rate limited
    return validAttempts.length >= this.maxAttempts;
  }

  /**
   * Record an attempt for an identifier
   * @param identifier - Unique identifier
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }
  }

  /**
   * Clean up old entries to prevent memory leak
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, validAttempts);
      }
    }
  }
}

/**
 * Generate a secure nonce for transactions
 * @returns A random nonce string
 */
export function generateNonce(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}