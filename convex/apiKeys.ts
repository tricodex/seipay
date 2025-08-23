import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate API key hash (simple implementation for demo)
function hashApiKey(key: string): string {
  // In production, use proper hashing on server side
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Generate random API key
function generateApiKey(): string {
  const prefix = "sei_";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < 32; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomString}`;
}

// Create new API key for x402 payments
export const createApiKey = mutation({
  args: {
    walletAddress: v.string(),
    name: v.string(),
    rateLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    const rateLimit = args.rateLimit || 1000; // Default 1000 requests per day
    
    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .first();
    
    if (!user) {
      throw new Error("User not found. Please register first.");
    }
    
    // Count existing API keys (limit to 5 per user on free tier)
    const existingKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    if (existingKeys.length >= 5) {
      throw new Error("Maximum API keys reached (5). Please delete unused keys.");
    }
    
    // Generate new API key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    
    // Store hashed key
    const keyId = await ctx.db.insert("apiKeys", {
      walletAddress: normalizedAddress,
      keyHash,
      name: args.name,
      createdAt: Date.now(),
      isActive: true,
      rateLimit,
      usageToday: 0,
    });
    
    // Return the unhashed key only once
    return {
      id: keyId,
      apiKey, // Show this only once!
      name: args.name,
      message: "Save this API key securely. It won't be shown again.",
    };
  },
});

// Get user's API keys (without exposing the actual keys)
export const getApiKeys = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .order("desc")
      .collect();
    
    // Don't expose the actual key hashes
    return keys.map(key => ({
      id: key._id,
      name: key.name,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      isActive: key.isActive,
      rateLimit: key.rateLimit,
      usageToday: key.usageToday,
      keyPreview: `sei_${"*".repeat(8)}`, // Show only prefix
    }));
  },
});

// Validate API key for x402 requests
export const validateApiKey = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const keyHash = hashApiKey(args.apiKey);
    
    const apiKeyDoc = await ctx.db
      .query("apiKeys")
      .withIndex("by_key", (q) => q.eq("keyHash", keyHash))
      .first();
    
    if (!apiKeyDoc) {
      return { valid: false, error: "Invalid API key" };
    }
    
    if (!apiKeyDoc.isActive) {
      return { valid: false, error: "API key is inactive" };
    }
    
    // Check rate limit
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    
    // Reset daily usage if it's a new day
    if (!apiKeyDoc.lastUsed || apiKeyDoc.lastUsed < todayStart) {
      await ctx.db.patch(apiKeyDoc._id, {
        usageToday: 1,
        lastUsed: now,
      });
    } else if (apiKeyDoc.usageToday >= apiKeyDoc.rateLimit) {
      return { 
        valid: false, 
        error: "Rate limit exceeded",
        resetAt: new Date().setHours(24, 0, 0, 0),
      };
    } else {
      // Increment usage
      await ctx.db.patch(apiKeyDoc._id, {
        usageToday: apiKeyDoc.usageToday + 1,
        lastUsed: now,
      });
    }
    
    // Get user info
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", apiKeyDoc.walletAddress))
      .first();
    
    return {
      valid: true,
      walletAddress: apiKeyDoc.walletAddress,
      username: user?.username,
      rateLimit: apiKeyDoc.rateLimit,
      usageToday: apiKeyDoc.usageToday,
      remainingRequests: apiKeyDoc.rateLimit - apiKeyDoc.usageToday,
    };
  },
});

// Deactivate API key
export const deactivateApiKey = mutation({
  args: {
    walletAddress: v.string(),
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    const apiKey = await ctx.db.get(args.keyId);
    
    if (!apiKey) {
      throw new Error("API key not found");
    }
    
    if (apiKey.walletAddress !== normalizedAddress) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.keyId, {
      isActive: false,
    });
    
    return { success: true };
  },
});

// Delete API key
export const deleteApiKey = mutation({
  args: {
    walletAddress: v.string(),
    keyId: v.id("apiKeys"),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    const apiKey = await ctx.db.get(args.keyId);
    
    if (!apiKey) {
      throw new Error("API key not found");
    }
    
    if (apiKey.walletAddress !== normalizedAddress) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.keyId);
    
    return { success: true };
  },
});