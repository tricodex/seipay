# Payment Agent Test Guide

## Manual Testing Steps for AI Payment Assistant

### Prerequisites
1. Ensure wallet is connected (MetaMask or compatible)
2. Have some testnet SEI tokens
3. Open the dashboard at `/dashboard`

### Test Cases

#### 1. Basic Payment Flow
```
Input: "Send 0.001 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"

Expected:
- AI responds with transaction details
- Shows "Execute Transaction" button
- Displays: Amount: 0.001 SEI
- Displays: To: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5
```

#### 2. Username Resolution
```
Input: "Send 0.002 SEI to alice.sei"

Expected:
- AI resolves username to test address
- Shows: "alice.sei (resolved to 0x742d...bEb5)"
- Execute Transaction button appears
```

#### 3. Balance Check
```
Input: "What's my wallet balance?"

Expected:
- Shows wallet address
- Displays balance (mocked as 125.5 SEI)
- Shows recent transactions
```

#### 4. QR Code Generation
```
Input: "Generate a payment QR code"

Expected:
- Message about QR code generation
- Shows wallet address
- Suggestions for QR with amount
```

#### 5. Bill Splitting
```
Input: "Split 10 SEI between 4 people"

Expected:
- Shows calculation: 2.50 SEI per person
- Asks for recipient addresses
```

### Transaction Execution Test

1. **Send a test transaction:**
   - Type: "Send 0.001 SEI to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"
   - Click "Execute Transaction"
   - Approve in wallet
   - Verify success message
   - Check explorer link works (testnet.seistream.app)

2. **Error Handling:**
   - Disconnect wallet
   - Try to send payment
   - Should show "Please connect your wallet first"

3. **Invalid Address:**
   - The system now validates addresses before execution
   - Invalid addresses are converted to test address for usernames

### Code Changes Summary

#### Fixed Issues:
1. ✅ Address validation before transaction execution
2. ✅ Proper transaction hash handling
3. ✅ Username to address resolution
4. ✅ Explorer URL updated to seistream.app
5. ✅ Error messages display in chat
6. ✅ Transaction confirmation tracking

#### Key Files Modified:
- `src/components/dashboard/PaymentAgent.tsx`
  - Added address validation
  - Fixed transaction execution flow
  - Improved error handling
  - Updated explorer URLs

### Verification Checklist
- [ ] Wallet connects properly
- [ ] AI responds to payment requests
- [ ] Execute Transaction button appears
- [ ] Transaction popup shows in wallet
- [ ] Success message displays after approval
- [ ] Explorer link opens correct page
- [ ] Error messages show for failures
- [ ] Username resolution works