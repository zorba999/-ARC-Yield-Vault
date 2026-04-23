# SimpleYieldVault — Deploy Guide

## Requirements

Install Foundry: https://getfoundry.sh/
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Deploy to ARC Testnet

```bash
cd contracts

# Set your private key (from MetaMask → Account Details → Export Private Key)
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output example:
# SimpleYieldVault deployed at: 0xABCD...1234
```

## After Deployment

Copy the deployed vault address, then update `lib/contracts.ts`:

```ts
export const CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000',
  USYC: '0xYOUR_VAULT_ADDRESS',        // ← paste here (vault IS the token)
  USYC_TELLER: '0xYOUR_VAULT_ADDRESS', // ← same address
  USYC_ORACLE: '0xYOUR_VAULT_ADDRESS', // ← same address (has latestAnswer())
  ROLES_AUTHORITY: '0x0000000000000000000000000000000000000000',
}
```

## How it Works

- User approves USDC → vault
- User calls `vault.deposit(amount, address)` → gets yUSDC shares
- Price starts at 1.000000 USDC/yUSDC and increases ~5% per year
- User calls `vault.redeem(shares, address, address)` → gets USDC back with yield
- **No allowlist required**
