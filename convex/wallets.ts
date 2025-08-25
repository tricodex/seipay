import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Wallet schema validation
const walletSchema = v.object({
  userId: v.string(), // User's wallet address (external wallet)
  walletId: v.string(), // Custodial wallet ID
  address: v.string(), // Custodial wallet address
  
  // Encrypted private key data - NEVER store unencrypted!
  encryptedKey: v.string(),
  salt: v.string(),
  iv: v.string(),
  authTag: v.string(),
  keyHash: v.string(), // For verification
  
  // Metadata
  type: v.union(v.literal("generated"), v.literal("imported")),
  label: v.optional(v.string()),
  createdAt: v.number(),
  lastUsed: v.optional(v.number()),
  
  // AI Access Controls
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
  
  // Security metadata
  lastPasswordChange: v.optional(v.number()),
  failedUnlockAttempts: v.number(),
  isLocked: v.boolean(),
});

// Store encrypted wallet
export const storeWallet = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
    address: v.string(),
    encryptedKey: v.string(),
    salt: v.string(),
    iv: v.string(),
    authTag: v.string(),
    keyHash: v.string(),
    type: v.union(v.literal("generated"), v.literal("imported")),
    label: v.optional(v.string()),
    walletName: v.optional(v.string()), // Unique wallet name (without username prefix)
  },
  handler: async (ctx, args) => {
    // Get user's username
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.userId.toLowerCase()))
      .first();
    
    if (!user || !user.username) {
      throw new Error("Please set up your username first");
    }
    
    // Check if user already has maximum wallets (e.g., 5)
    const existingWallets = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    if (existingWallets.length >= 5) {
      throw new Error("Maximum number of custodial wallets reached (5)");
    }
    
    // Validate wallet name uniqueness if provided
    let fullWalletName: string | undefined;
    if (args.walletName) {
      // Clean the wallet name
      const cleanName = args.walletName.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanName.length < 1 || cleanName.length > 20) {
        throw new Error("Wallet name must be 1-20 characters (letters, numbers, hyphens)");
      }
      
      // Create full wallet name: username.walletname
      fullWalletName = `${user.username}.${cleanName}`;
      
      // Check if this wallet name already exists for this user
      const existingWithName = existingWallets.find(w => w.fullWalletName === fullWalletName);
      if (existingWithName) {
        throw new Error(`Wallet name '${cleanName}' already exists`);
      }
    }
    
    // Check for duplicate addresses
    const duplicateAddress = await ctx.db
      .query("custodialWallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();
    
    if (duplicateAddress) {
      throw new Error("Wallet with this address already exists");
    }
    
    // Store encrypted wallet
    const walletId = await ctx.db.insert("custodialWallets", {
      userId: args.userId,
      walletId: args.walletId,
      address: args.address,
      encryptedKey: args.encryptedKey,
      salt: args.salt,
      iv: args.iv,
      authTag: args.authTag,
      keyHash: args.keyHash,
      type: args.type,
      label: args.label,
      walletName: args.walletName,
      fullWalletName,
      createdAt: Date.now(),
      aiAccess: {
        enabled: false,
        level: "none",
      },
      failedUnlockAttempts: 0,
      isLocked: false,
    });
    
    // Log wallet creation (without sensitive data)
    await ctx.db.insert("walletLogs", {
      userId: args.userId,
      walletId: args.walletId,
      action: "created",
      timestamp: Date.now(),
      metadata: {
        type: args.type,
        address: args.address,
      },
    });
    
    return walletId;
  },
});

// Get user's wallets (without private keys)
export const getUserWallets = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const wallets = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Return wallet info without sensitive encryption data
    return wallets.map(wallet => ({
      id: wallet._id,
      walletId: wallet.walletId,
      address: wallet.address,
      type: wallet.type,
      label: wallet.label,
      walletName: wallet.walletName,
      fullWalletName: wallet.fullWalletName,
      createdAt: wallet.createdAt,
      lastUsed: wallet.lastUsed,
      aiAccess: wallet.aiAccess,
      isLocked: wallet.isLocked,
    }));
  },
});

// Get encrypted wallet data (for decryption on client)
export const getEncryptedWallet = query({
  args: {
    userId: v.string(),
    walletId: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("walletId"), args.walletId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    // Check if wallet is locked
    if (wallet.isLocked) {
      throw new Error("Wallet is locked due to too many failed attempts");
    }
    
    // Return encrypted data for client-side decryption
    return {
      walletId: wallet.walletId,
      address: wallet.address,
      encryptedKey: wallet.encryptedKey,
      salt: wallet.salt,
      iv: wallet.iv,
      authTag: wallet.authTag,
      keyHash: wallet.keyHash,
      metadata: {
        type: wallet.type,
        label: wallet.label,
        createdAt: wallet.createdAt,
        lastUsed: wallet.lastUsed,
        aiAccess: wallet.aiAccess,
      },
    };
  },
});

// Update AI access settings
export const updateAIAccess = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
    enabled: v.boolean(),
    level: v.union(
      v.literal("none"),
      v.literal("view_only"),
      v.literal("send_limited"),
      v.literal("full_access")
    ),
    dailyLimit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("walletId"), args.walletId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    // Update AI access settings
    await ctx.db.patch(wallet._id, {
      aiAccess: {
        enabled: args.enabled,
        level: args.level,
        dailyLimit: args.dailyLimit,
        spentToday: "0",
        lastReset: Date.now(),
      },
    });
    
    // Log the change
    await ctx.db.insert("walletLogs", {
      userId: args.userId,
      walletId: args.walletId,
      action: "ai_access_updated",
      timestamp: Date.now(),
      metadata: {
        enabled: args.enabled,
        level: args.level,
        dailyLimit: args.dailyLimit,
      },
    });
    
    return { success: true };
  },
});

// Record failed unlock attempt
export const recordFailedUnlock = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("walletId"), args.walletId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    const newAttempts = wallet.failedUnlockAttempts + 1;
    const isLocked = newAttempts >= 5; // Lock after 5 failed attempts
    
    await ctx.db.patch(wallet._id, {
      failedUnlockAttempts: newAttempts,
      isLocked,
    });
    
    // Log the failed attempt
    await ctx.db.insert("walletLogs", {
      userId: args.userId,
      walletId: args.walletId,
      action: "failed_unlock",
      timestamp: Date.now(),
      metadata: {
        attempts: newAttempts,
        locked: isLocked,
      },
    });
    
    if (isLocked) {
      throw new Error("Wallet locked after 5 failed attempts. Contact support.");
    }
    
    return {
      attemptsRemaining: 5 - newAttempts,
      isLocked,
    };
  },
});

// Reset failed attempts on successful unlock
export const resetFailedAttempts = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("walletId"), args.walletId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    await ctx.db.patch(wallet._id, {
      failedUnlockAttempts: 0,
      lastUsed: Date.now(),
    });
    
    return { success: true };
  },
});

// Delete wallet (requires additional verification)
export const deleteWallet = mutation({
  args: {
    userId: v.string(),
    walletId: v.string(),
    verificationCode: v.string(), // Additional security
  },
  handler: async (ctx, args) => {
    // In production, verify the code via email/SMS
    if (args.verificationCode.length < 6) {
      throw new Error("Invalid verification code");
    }
    
    const wallet = await ctx.db
      .query("custodialWallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("walletId"), args.walletId))
      .first();
    
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    
    // Delete the wallet
    await ctx.db.delete(wallet._id);
    
    // Log the deletion
    await ctx.db.insert("walletLogs", {
      userId: args.userId,
      walletId: args.walletId,
      action: "deleted",
      timestamp: Date.now(),
      metadata: {
        address: wallet.address,
      },
    });
    
    return { success: true };
  },
});

// Get wallet activity logs
export const getWalletLogs = query({
  args: {
    userId: v.string(),
    walletId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("walletLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    if (args.walletId) {
      query = query.filter((q) => q.eq(q.field("walletId"), args.walletId));
    }
    
    const logs = await query
      .order("desc")
      .take(args.limit || 50);
    
    return logs;
  },
});