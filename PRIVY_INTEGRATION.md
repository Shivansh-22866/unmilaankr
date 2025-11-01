# Privy.io Integration Guide

## Overview
This project has been updated to use Privy.io for wallet authentication instead of Reown AppKit. Privy provides a seamless wallet connection experience for Solana wallets.

## Setup Instructions

### 1. Get a Privy App ID
1. Visit [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or use an existing one
3. Copy your App ID

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

You can use the `.env.example` file as a template.

### 3. Configuration Options
The Privy provider is configured in `contexts/index.tsx` with the following options:

- **Appearance**: Dark theme with cyan accent color
- **Embedded Wallets**: Automatically creates Solana wallets for users without wallets
- **Supported Chains**: Solana (mainnet and devnet)

## How It Works

### Wallet Connection Flow
1. User clicks "Connect Wallet" button
2. Privy modal opens with authentication options
3. User authenticates (email, social, or external wallet)
4. Embedded Solana wallet is created if user doesn't have one
5. Wallet address is displayed in the UI

### x402 Payment Integration
The Dashboard uses the connected wallet for x402 payment flows:

1. Wallet is adapted to match x402's expected interface
2. x402 client is created with the adapted wallet
3. API calls through x402 automatically handle payment transactions
4. Users are prompted to approve transactions when needed

## Code Structure

### Key Files
- `contexts/index.tsx`: Privy provider configuration
- `components/Dashboard.tsx`: Main dashboard with wallet integration
- `.env.example`: Environment variable template

### Important Functions

#### `createSolanaWalletAdapter(wallet)`
Converts Privy's wallet interface to be compatible with x402:
- Handles transaction signing
- Supports both legacy and versioned transactions
- Provides sendTransaction functionality

#### `handleRunAgent()`
Main analysis function that:
- Checks wallet connection
- Creates x402 client with wallet adapter
- Makes paid API requests
- Handles payment flow automatically

## Wallet Features

### Supported
- ✅ Embedded Privy wallets (auto-created)
- ✅ External Solana wallets (Phantom, Solflare, etc.)
- ✅ Transaction signing
- ✅ x402 payment handling
- ✅ Wallet address display

### Coming Soon
- Network switching (mainnet/devnet)
- Multiple wallet management
- Transaction history

## Troubleshooting

### Wallet Not Connecting
- Ensure NEXT_PUBLIC_PRIVY_APP_ID is set correctly
- Check browser console for errors
- Verify Privy app is configured for Solana

### x402 Payments Failing
- Ensure wallet has SOL for transaction fees
- Check RPC endpoint is accessible
- Verify x402 API endpoint is correct

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild

## Migration from Reown AppKit

If you're migrating from the old Reown AppKit implementation:

1. Remove Reown AppKit dependencies (kept for backward compatibility)
2. Update wallet connection code to use Privy hooks
3. Test all wallet-dependent features
4. Update any custom wallet logic

## Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [x402 Documentation](https://docs.x402.ai/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## Support

For issues related to:
- Privy integration: Check Privy docs or support
- x402 payments: Refer to x402 documentation
- Application bugs: Create an issue in the repository
