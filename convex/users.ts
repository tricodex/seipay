import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a unique username based on wallet address
function generateUsername(address: string): string {
  const adjectives = ["swift", "bright", "cosmic", "digital", "quantum", "stellar", "cyber", "neo", "prime", "ultra"];
  const nouns = ["payment", "wallet", "trader", "holder", "sender", "node", "link", "chain", "block", "user"];
  
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const addressSuffix = address.slice(-4).toLowerCase();
  
  return `${randomAdj}-${randomNoun}-${addressSuffix}`;
}

// Register or get user by wallet address
export const registerUser = mutation({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .first();
    
    if (existingUser) {
      // Update last seen
      await ctx.db.patch(existingUser._id, {
        lastSeen: Date.now(),
      });
      return existingUser;
    }
    
    // Generate unique username
    let username = generateUsername(normalizedAddress);
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const existingUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      
      if (!existingUsername) {
        break;
      }
      
      // Add random number if username exists
      username = `${username}-${Math.floor(Math.random() * 1000)}`;
      attempts++;
    }
    
    // Create new user
    const userId = await ctx.db.insert("users", {
      walletAddress: normalizedAddress,
      username,
      createdAt: Date.now(),
      lastSeen: Date.now(),
    });
    
    return await ctx.db.get(userId);
  },
});

// Get user by wallet address
export const getUserByWallet = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .first();
  },
});

// Get user by username
export const getUserByUsername = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

// Check if username is available
export const isUsernameAvailable = query({
  args: {
    username: v.string(),
    currentWallet: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate username format
    if (!args.username || args.username.length < 3 || args.username.length > 30) {
      return { available: false, reason: "Username must be between 3 and 30 characters" };
    }
    
    // Only allow alphanumeric, dash, and underscore
    if (!/^[a-zA-Z0-9-_]+$/.test(args.username)) {
      return { available: false, reason: "Username can only contain letters, numbers, dashes, and underscores" };
    }
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existingUser) {
      // Check if it's the current user's username
      if (args.currentWallet && existingUser.walletAddress === args.currentWallet.toLowerCase()) {
        return { available: true, reason: "This is your current username" };
      }
      return { available: false, reason: "Username already taken" };
    }
    
    return { available: true, reason: "Username is available" };
  },
});

// Change username (VERY IMPORTANT: Must be unique)
export const changeUsername = mutation({
  args: {
    walletAddress: v.string(),
    newUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    const newUsername = args.newUsername.trim();
    
    // Validate username format
    if (!newUsername || newUsername.length < 3 || newUsername.length > 30) {
      throw new Error("Username must be between 3 and 30 characters");
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(newUsername)) {
      throw new Error("Username can only contain letters, numbers, dashes, and underscores");
    }
    
    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .first();
    
    if (!currentUser) {
      throw new Error("User not found");
    }
    
    // Check if new username is the same as current
    if (currentUser.username === newUsername) {
      return { success: true, message: "Username unchanged" };
    }
    
    // CRITICAL: Check if username is already taken
    const existingUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", newUsername))
      .first();
    
    if (existingUsername) {
      throw new Error("Username already taken");
    }
    
    // Record username change in history
    await ctx.db.insert("usernameHistory", {
      walletAddress: normalizedAddress,
      oldUsername: currentUser.username,
      newUsername: newUsername,
      changedAt: Date.now(),
    });
    
    // Update user's username
    await ctx.db.patch(currentUser._id, {
      username: newUsername,
      lastSeen: Date.now(),
    });
    
    return { 
      success: true, 
      message: "Username changed successfully",
      oldUsername: currentUser.username,
      newUsername: newUsername
    };
  },
});

// Get username history
export const getUsernameHistory = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    return await ctx.db
      .query("usernameHistory")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedAddress))
      .order("desc")
      .take(10);
  },
});

// Search users by username (for sending payments)
export const searchUsersByUsername = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase();
    const limit = args.limit || 10;
    
    if (searchTerm.length < 2) {
      return [];
    }
    
    // Get all users and filter by username
    // Note: In production, you might want to implement a better search index
    const users = await ctx.db
      .query("users")
      .order("desc")
      .take(100);
    
    const filtered = users
      .filter(user => user.username.toLowerCase().includes(searchTerm))
      .slice(0, limit)
      .map(user => ({
        username: user.username,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
      }));
    
    return filtered;
  },
});