# SeiPay Package Versions & Features Guide

## Core Dependencies

### React 19.1.0
**Released**: March 2025
- **Actions & Transitions**: Async functions in transitions handle pending states, errors, forms automatically
- **Server Components**: Full React Server Components support (stable)
- **Direct ref prop**: No more forwardRef needed - pass refs directly as props
- **Improved Hydration**: Better error reporting with detailed mismatch info
- **Automatic Batching**: Enhanced performance with automatic state update batching
- **useId Format Change**: Now uses `«r123»` instead of `:r123:` for valid CSS selectors
- **Owner Stack Debugging**: New development feature to identify component render chains

### Next.js 15.5.0
**Released**: August 2025
- **Turbopack Builds (Beta)**: Production builds 5x faster with `next build --turbopack`
- **Node.js Middleware (Stable)**: Full Node.js runtime support in middleware
- **TypeScript Improvements**: 
  - Typed routes with full type safety
  - Route export validation
  - Route types helpers
- **Client Segment Cache**: Improved navigation performance
- **DevTools Enhancements**: Route Info inspection, browser log forwarding
- **React 19 Support**: Full compatibility with React 19 features
- **App Router Default**: Uses React canary releases with stable React 19 changes

### Tailwind CSS 4.1.12
**Released**: January 2025
- **New Oxide Engine**: Built with Rust, 5x faster full builds, 100x faster incremental
- **Built-in Lightning CSS**: No need for PostCSS plugins, autoprefixer included
- **CSS-first Configuration**: Configure directly in CSS with `@theme`
- **Automatic Content Detection**: No need to configure content paths
- **New Utilities**:
  - `text-shadow-*`: Finally added text shadows!
  - `mask-*`: Image and gradient masking
  - `overflow-wrap`: Better text wrapping control
  - 3D transforms: `rotate-x-*`, `rotate-y-*`, `scale-z-*`
- **Container Queries**: Built-in `@container` support
- **Wide Gamut Colors**: Native oklch() color support
- **Import Syntax**: Single line `@import "tailwindcss"` instead of directives

### TypeScript 5.9.2
**Released**: August 2025
- **Import Defer**: Support for deferred module evaluation with `import defer`
- **Node20 Module Resolution**: Stable `--module node20` option for Node.js v20
- **Expandable Hovers**: Interactive type exploration in editor tooltips
- **Minimal tsc --init**: Cleaner, more prescriptive default tsconfig
- **Performance**: Faster type checking and better caching
- **Native Port Coming**: TypeScript 7.0 (Go rewrite) preview available for 10x performance

### ESLint 9.34.0
**Released**: 2025
- **Flat Config Format**: New configuration system (backwards compatible)
- **ESLint 9 Support**: Next.js 15.5 includes full ESLint 9 compatibility
- **Automatic Migration**: Next.js applies escape hatches for smooth upgrade

## Sei Blockchain Integration

### Wallet Options
1. **Compass Wallet** (Recommended)
   - Dedicated Sei wallet
   - Browser extension + mobile apps
   - Built-in staking & governance
   - NFT gallery support

2. **Keplr Wallet**
   - Leading IBC-enabled wallet
   - Multi-chain Cosmos support
   - Hardware wallet compatible
   - Excellent staking features

3. **MetaMask** (For Sei EVM)
   - Sei V2 EVM compatible
   - Requires manual RPC setup
   - Wide dApp compatibility

### Sei Network Configuration
```javascript
// Sei Mainnet
{
  chainId: 1329, // 0x531 in hex
  name: 'Sei Network',
  rpcUrl: 'https://evm-rpc.sei-apis.com',
  explorer: 'https://seitrace.com',
  symbol: 'SEI',
  decimals: 18
}

// Sei Testnet (atlantic-2)
{
  chainId: 1328, // 0x530 in hex
  name: 'Sei Testnet',
  rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
  explorer: 'https://seitrace.com',
  symbol: 'SEI',
  decimals: 18
}
```

## Animation Libraries

### Lottie Integration
- **lottie-react**: `npm install lottie-react`
  - React 19 compatible
  - Hook-based API with `useLottie`
  - Component API with `<Lottie />`
  - Full control over animation lifecycle

### dotLottie Format
- Compressed Lottie format (.lottie files)
- Smaller file sizes
- Built-in theming support
- State machines for interactivity

## Development Setup

### Recommended Folder Structure
```
seipay/
├── src/
│   ├── app/           # Next.js 15 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── payment/
│   │   ├── wallet/
│   │   └── ui/
│   ├── lib/
│   │   ├── sei/      # Blockchain configs
│   │   └── utils/
│   └── hooks/
├── public/
│   ├── seipay.png
│   ├── banner.png
│   ├── Payment.json
│   ├── Tiger.json
│   └── Worldmap.json
└── versions.md
```

## Migration Notes

### From React 18 to 19
- Remove `forwardRef` - use direct ref props
- Update `useId` format in tests
- PropTypes removed - use TypeScript
- Legacy Context removed - use modern Context API

### From Next.js 14 to 15
- Client Router Cache changes - pages no longer cached by default
- `@next/font` removed - use `next/font`
- ESLint 9 support added automatically
- Turbopack available with `--turbo` flag

### From Tailwind 3 to 4
- Single import line: `@import "tailwindcss"`
- No content configuration needed
- Use CSS variables for theme customization
- Utilities renamed: `flex-start` → `flex-items-start`
- Default border uses `currentColor`

## Browser Support
- **Tailwind CSS 4**: Safari 16.4+, Chrome 111+, Firefox 128+
- **React 19**: Modern browsers with ES2020+ support
- **Sei Network**: Any EVM-compatible wallet browser extension

## Package Installation Commands

```bash
# Core dependencies (already installed)
bun add react@19.1.0 react-dom@19.1.0 next@15.5.0

# Sei blockchain libraries
bun add viem@latest wagmi@latest @tanstack/react-query

# Wallet connections
bun add @rainbow-me/rainbowkit

# Animations
bun add lottie-react

# UI utilities
bun add clsx tailwind-merge sonner lucide-react
bun add react-qr-code

# Development
bun add -D @types/node@20.19.11 @types/react@19.1.11 @types/react-dom@19.1.7
```

## Performance Optimizations

### Next.js 15.5 with Turbopack
- 96.3% faster code updates in development
- 2-5x faster production builds
- Near-instant HMR (Hot Module Replacement)

### React 19 Improvements
- Automatic batching reduces re-renders
- Better Suspense boundaries
- Improved SSR hydration

### Tailwind CSS 4 Speed
- Microsecond incremental builds
- 3.5x faster full rebuilds
- 8x faster incremental CSS updates
