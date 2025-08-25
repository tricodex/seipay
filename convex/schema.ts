import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles with unique usernames
  users: defineTable({
    walletAddress: v.string(), // Primary wallet address (lowercase)
    username: v.string(), // Unique username
    displayName: v.optional(v.string()), // Optional display name (non-unique)
    createdAt: v.number(), // Timestamp
    lastSeen: v.number(), // Last activity timestamp
    isVerified: v.optional(v.boolean()), // For future verification system
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_username", ["username"]), // Index for uniqueness check

  // Payment history (only essential data)
  payments: defineTable({
    fromAddress: v.string(),
    toAddress: v.string(),
    fromUsername: v.optional(v.string()), // Username at time of payment
    toUsername: v.optional(v.string()), // Username at time of payment
    amount: v.string(), // Store as string to preserve precision
    currency: v.string(), // "SEI" or future tokens
    message: v.optional(v.string()),
    txHash: v.string(), // Transaction hash
    timestamp: v.number(),
    status: v.string(), // "pending", "confirmed", "failed"
  })
    .index("by_from", ["fromAddress"])
    .index("by_to", ["toAddress"])
    .index("by_timestamp", ["timestamp"])
    .index("by_tx", ["txHash"]),

  // Username change history (for audit trail)
  usernameHistory: defineTable({
    walletAddress: v.string(),
    oldUsername: v.string(),
    newUsername: v.string(),
    changedAt: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_old", ["oldUsername"]),

  // AI chat sessions (minimal storage)
  chatSessions: defineTable({
    walletAddress: v.string(),
    sessionId: v.string(),
    startedAt: v.number(),
    lastMessageAt: v.number(),
    messageCount: v.number(),
    // We don't store actual messages to save space
    // Messages are ephemeral in the frontend
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_session", ["sessionId"]),

  // x402 API keys (for future micropayment APIs)
  apiKeys: defineTable({
    walletAddress: v.string(),
    keyHash: v.string(), // Store hashed API key
    name: v.string(),
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
    isActive: v.boolean(),
    rateLimit: v.number(), // Requests per day
    usageToday: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_key", ["keyHash"]),

  // SECURE CUSTODIAL WALLETS (encrypted storage)
  custodialWallets: defineTable({
    userId: v.string(), // User's main wallet address
    walletId: v.string(), // Unique wallet identifier
    address: v.string(), // Custodial wallet address
    
    // ENCRYPTED private key data - NEVER store unencrypted!
    encryptedKey: v.string(), // AES-256-GCM encrypted
    salt: v.string(), // PBKDF2 salt
    iv: v.string(), // Initialization vector
    authTag: v.string(), // Authentication tag
    keyHash: v.string(), // SHA-256 hash for verification
    
    // Metadata
    type: v.union(v.literal("generated"), v.literal("imported")),
    label: v.optional(v.string()), // Display label
    walletName: v.optional(v.string()), // Unique wallet name (without username)
    fullWalletName: v.optional(v.string()), // Full name: username.walletname
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
    
    // AI Agent access controls
    aiAccess: v.object({
      enabled: v.boolean(),
      level: v.union(
        v.literal("none"),
        v.literal("view_only"),
        v.literal("send_limited"),
        v.literal("full_access")
      ),
      dailyLimit: v.optional(v.string()), // In SEI
      spentToday: v.optional(v.string()),
      lastReset: v.optional(v.number()),
    }),
    
    // Security
    failedUnlockAttempts: v.number(),
    isLocked: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_address", ["address"])
    .index("by_wallet_id", ["walletId"]),

  // Wallet activity logs for audit trail
  walletLogs: defineTable({
    userId: v.string(),
    walletId: v.string(),
    action: v.string(), // "created", "unlocked", "ai_transaction", etc.
    timestamp: v.number(),
    metadata: v.optional(v.any()), // Additional context
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletId"])
    .index("by_timestamp", ["timestamp"]),
});