# ARC Yield Vault

A dApp built on **ARC Testnet** that lets users deposit USDC to earn U.S. Treasury yield via **USYC** (tokenized money market fund by Hashnote & Circle).

## Tech Stack

- **Next.js 14** (App Router) — Vercel-ready
- **wagmi v2 + viem** — blockchain interactions
- **RainbowKit v2** — wallet connection UI
- **TailwindCSS** — styling

## ARC Testnet Info

| Field | Value |
|-------|-------|
| Chain ID | 5042002 |
| RPC | https://rpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

## Contract Addresses (ARC Testnet)

| Contract | Address |
|----------|---------|
| USDC | `0x3600000000000000000000000000000000000000` |
| USYC Token (YieldCoinProxy) | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| USYC Teller (TellerProxy) | `0x9fdF14c5B14173D74C08Af27AebFf39240dC105A` |
| USYC Oracle | `0x0f30ebeb58ef91b0a82408941eab8e7dd1be1097` |
| Roles Authority | `0xcc205224862c7641930c87679e98999d23c26113` |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/).

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel
```

Or connect the repo to [vercel.com](https://vercel.com) and add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` as an environment variable.

## USYC Allowlist Requirement

> ⚠️ To interact with USYC on ARC Testnet, your wallet must be allowlisted.

1. Get testnet USDC from [faucet.circle.com](https://faucet.circle.com)
2. Open a ticket at [support.circle.com](https://support.circle.com) with your ARC Testnet wallet address
3. Wait 24–48 hours for approval
4. Use the [USYC Portal](https://usyc.dev.hashnote.com/) or this app to deposit

## How it Works

1. **Deposit**: User approves USDC → calls `Teller.deposit(amount, userAddress)` → receives USYC
2. **Redeem**: User approves USYC → calls `Teller.redeem(amount, userAddress, userAddress)` → receives USDC
3. **Yield**: USYC price increases over time as U.S. Treasury overnight rate accrues

## Links

- [ARC Docs](https://docs.arc.network)
- [Circle Developer Docs](https://developers.circle.com)
- [USYC Overview](https://developers.circle.com/tokenized/usyc/overview)
