# SeiPay

Payment application built on Sei Network that simplifies crypto transactions through QR codes, payment links, and usernames.

## Features

### Core Payments
- **QR Code Generation** - Recipients generate QR codes that encode payment information
- **Payment Links** - Share URLs like `seipay.app/pay/username?amount=5`
- **Username System** - Register unique usernames to replace wallet addresses
- **Amount Requests** - Specify exact payment amounts in QR codes and links
- **Instant Settlement** - Transactions confirm in under 400ms on Sei Network

### Additional Features
- **Custodial Wallets** - Optional encrypted wallets for AI agent integration
- **Multi-Wallet Support** - Connect via MetaMask, Coinbase Wallet, WalletConnect
- **Transaction History** - Track payments with blockchain explorer links
- **Mobile Responsive** - Full functionality on phones and tablets
- **Test Mode** - Development environment for testing without real funds

## Tech Stack

- **Frontend**: Next.js 15.5, TypeScript, Tailwind CSS v4
- **Blockchain**: Sei Network (EVM-compatible), Wagmi v2, Viem
- **Database**: Convex for real-time data sync
- **Wallet Connection**: RainbowKit
- **Deployment**: Vercel

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/seipay.git
cd seipay

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Optional
NEXT_PUBLIC_NETWORK=testnet  # or mainnet
```

## Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run production server
bun run start

# Type checking
bun run typecheck

# Linting
bun run lint
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── dashboard/    # User dashboard with wallet management
│   ├── send/         # Send payment interface
│   ├── receive/      # Receive payment with QR generation
│   └── slides/       # Presentation slides
├── components/       
│   ├── payment/      # Payment form, QR generator, success modal
│   ├── dashboard/    # Username manager, custodial wallets, AI controls
│   ├── wallet/       # Wallet connection button
│   └── layout/       # Header navigation
├── lib/
│   ├── sei/          # Blockchain configuration and constants
│   ├── wallet/       # Custodial wallet encryption logic
│   └── utils.ts      # Helper functions
└── convex/           # Database schema and functions
    ├── users.ts      # Username registration and lookup
    └── wallets.ts    # Custodial wallet storage
```

## Custodial Wallets

Optional feature for developers building AI agents:

1. **Encryption**: AES-256-GCM with PBKDF2 (100,000 iterations)
2. **Storage**: Encrypted keys stored in Convex database
3. **Access Control**: Configurable permissions with spending limits
4. **Security**: Private keys encrypted client-side, server cannot decrypt

## Network Configuration

### Testnet (Default)
- Chain ID: 1328
- RPC: https://evm-rpc.arctic-1.seinetwork.io
- Explorer: https://seitrace.com

### Mainnet
- Chain ID: 1329
- RPC: https://evm-rpc.sei-apis.com
- Explorer: https://seitrace.com

## API Endpoints

The application does not expose public APIs. Payment processing happens directly through blockchain transactions.

## Security Considerations

- Private keys for custodial wallets encrypted client-side
- Passwords never transmitted to server
- Username system prevents address typos
- All transactions visible on blockchain explorer
- Test mode available for development

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with Web3 wallet support

## Dependencies

Major packages:
- `next`: 15.1.3
- `wagmi`: 2.14.1
- `viem`: 2.21.61
- `@rainbow-me/rainbowkit`: 2.2.1
- `convex`: 1.17.3
- `tailwindcss`: 4.0.0-beta.7

Full dependency list in `package.json`.