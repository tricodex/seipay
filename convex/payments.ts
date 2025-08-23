import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a payment
export const recordPayment = mutation({
  args: {
    fromAddress: v.string(),
    toAddress: v.string(),
    amount: v.string(),
    currency: v.string(),
    message: v.optional(v.string()),
    txHash: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const fromAddressNorm = args.fromAddress.toLowerCase();
    const toAddressNorm = args.toAddress.toLowerCase();
    
    // Get usernames at time of payment
    const fromUser = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", fromAddressNorm))
      .first();
    
    const toUser = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", toAddressNorm))
      .first();
    
    // Check if payment already exists (prevent duplicates)
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_tx", (q) => q.eq("txHash", args.txHash))
      .first();
    
    if (existingPayment) {
      // Update status if different
      if (existingPayment.status !== args.status) {
        await ctx.db.patch(existingPayment._id, {
          status: args.status,
        });
      }
      return existingPayment;
    }
    
    // Insert new payment
    const paymentId = await ctx.db.insert("payments", {
      fromAddress: fromAddressNorm,
      toAddress: toAddressNorm,
      fromUsername: fromUser?.username,
      toUsername: toUser?.username,
      amount: args.amount,
      currency: args.currency,
      message: args.message,
      txHash: args.txHash,
      timestamp: Date.now(),
      status: args.status,
    });
    
    return await ctx.db.get(paymentId);
  },
});

// Get payment history for a wallet
export const getPaymentHistory = query({
  args: {
    walletAddress: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(v.union(v.literal("sent"), v.literal("received"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    const limit = args.limit || 20;
    const type = args.type || "all";
    
    let payments;
    
    if (type === "sent") {
      payments = await ctx.db
        .query("payments")
        .withIndex("by_from", (q) => q.eq("fromAddress", normalizedAddress))
        .order("desc")
        .take(limit);
    } else if (type === "received") {
      payments = await ctx.db
        .query("payments")
        .withIndex("by_to", (q) => q.eq("toAddress", normalizedAddress))
        .order("desc")
        .take(limit);
    } else {
      // Get both sent and received
      const sent = await ctx.db
        .query("payments")
        .withIndex("by_from", (q) => q.eq("fromAddress", normalizedAddress))
        .order("desc")
        .take(limit);
      
      const received = await ctx.db
        .query("payments")
        .withIndex("by_to", (q) => q.eq("toAddress", normalizedAddress))
        .order("desc")
        .take(limit);
      
      // Combine and sort by timestamp
      payments = [...sent, ...received]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
    
    return payments;
  },
});

// Get payment by transaction hash
export const getPaymentByTxHash = query({
  args: {
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_tx", (q) => q.eq("txHash", args.txHash))
      .first();
  },
});

// Get payment statistics for a wallet
export const getPaymentStats = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedAddress = args.walletAddress.toLowerCase();
    
    // Get all payments
    const sent = await ctx.db
      .query("payments")
      .withIndex("by_from", (q) => q.eq("fromAddress", normalizedAddress))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();
    
    const received = await ctx.db
      .query("payments")
      .withIndex("by_to", (q) => q.eq("toAddress", normalizedAddress))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();
    
    // Calculate totals
    const totalSent = sent.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalReceived = received.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    // Get unique recipients/senders
    const uniqueRecipients = new Set(sent.map(p => p.toAddress)).size;
    const uniqueSenders = new Set(received.map(p => p.fromAddress)).size;
    
    return {
      totalSent: totalSent.toString(),
      totalReceived: totalReceived.toString(),
      sentCount: sent.length,
      receivedCount: received.length,
      uniqueRecipients,
      uniqueSenders,
      firstPayment: [...sent, ...received].sort((a, b) => a.timestamp - b.timestamp)[0]?.timestamp,
      lastPayment: [...sent, ...received].sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp,
    };
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    txHash: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_tx", (q) => q.eq("txHash", args.txHash))
      .first();
    
    if (!payment) {
      throw new Error("Payment not found");
    }
    
    await ctx.db.patch(payment._id, {
      status: args.status,
    });
    
    return { success: true };
  },
});