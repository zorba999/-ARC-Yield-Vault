# ARC Yield Vault

A DeFi dApp built on **ARC Testnet** — deposit USDC, receive **yUSDC** and earn simulated U.S. Treasury yield (~5% APY). No allowlist required.

> 🔗 **Live contract:** [`0x53A65102aD0630e9811eFF6900e841435aAB0c33`](https://testnet.arcscan.app/address/0x53A65102aD0630e9811eFF6900e841435aAB0c33)

---

## Features

- 💰 **Deposit USDC** → receive yUSDC (2-step: approve + deposit)
- 📈 **Earn yield** — yUSDC price grows ~5% APY (US Treasury simulation)
- 🔁 **Redeem anytime** — single-click, no approve needed
- 🚫 **No allowlist** — anyone can use it on ARC Testnet
- ⚡ **< 1 second settlement** — ARC deterministic finality
- 🌙 **Premium dark UI** — glassmorphism, animated background, JetBrains Mono

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Blockchain | wagmi v2 + viem |
| Wallet UI | RainbowKit v2 |
| Styling | TailwindCSS + custom CSS |
| Fonts | Inter + JetBrains Mono |
| Smart Contract | Solidity 0.8.20 (Hardhat) |

---

## ARC Testnet

| Field | Value |
|-------|-------|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

---

## Contract Addresses

| Contract | Address |
|----------|---------|
| USDC (native) | `0x3600000000000000000000000000000000000000` |
| **SimpleYieldVault (yUSDC)** | `0x53A65102aD0630e9811eFF6900e841435aAB0c33` |

> The vault contract acts as both the **yUSDC token** (ERC-20) and the **teller** (deposit/redeem). No external oracle or allowlist needed.

### USYC Contracts (reference only — requires allowlist)

| Contract | Address |
|----------|---------|
| USYC Token | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| USYC Teller | `0x9fdF14c5B14173D74C08Af27AebFf39240dC105A` |
| USYC Oracle | `0x0f30ebeb58ef91b0a82408941eab8e7dd1be1097` |
| Roles Authority | `0xcc205224862c7641930c87679e98999d23c26113` |

---

## How It Works

```
User → approve USDC to vault → vault.deposit(amount, user) → receives yUSDC
User → vault.redeem(shares, user, user) → receives USDC + yield
```

- **Price formula:** `1.000000 + (elapsed_seconds × 5) / (365 × 86400 × 100)`
- Starts at `$1.000000`, grows ~`$0.000000158` per second (~5% APY)
- No fees, no lockups, no KYC

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Add your WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com/):

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

Connect the repo at [vercel.com](https://vercel.com) and set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` as an environment variable.

---

## Deploy Your Own Vault

The Solidity contract is in `contracts/src/SimpleYieldVault.sol`.

```bash
cd contracts
npm install

# Set your private key
$env:PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"

# Deploy to ARC Testnet
npx hardhat run scripts/deploy.ts --network arc_testnet
```

After deployment, update `lib/contracts.ts`:

```ts
const VAULT_ADDRESS = '0xYOUR_NEW_ADDRESS'
export const USE_VAULT = true
```

---

## Project Structure

```
├── app/
│   ├── globals.css       # Design system (CSS variables, animations)
│   ├── layout.tsx        # Fonts + providers
│   ├── page.tsx          # Hero + layout
│   └── providers.tsx     # wagmi + RainbowKit
├── components/
│   ├── Header.tsx        # Sticky frosted glass header
│   ├── StatsBar.tsx      # 4 live stats cards
│   ├── BalanceCards.tsx  # USDC + yUSDC balances
│   ├── DepositCard.tsx   # 2-step deposit flow
│   └── RedeemCard.tsx    # 1-step redeem flow
├── lib/
│   ├── chain.ts          # ARC Testnet chain config
│   ├── contracts.ts      # Addresses + ABIs + USE_VAULT toggle
│   ├── utils.ts          # formatBalance, parseInputAmount
│   └── wagmi-config.ts   # wagmi + RainbowKit config
└── contracts/
    ├── src/
    │   └── SimpleYieldVault.sol
    └── scripts/
        └── deploy.ts
```

---

## Links

- [ARC Network Docs](https://docs.arc.network)
- [Circle Developer Docs](https://developers.circle.com)
- [ARC Block Explorer](https://testnet.arcscan.app)
- [USDC Faucet](https://faucet.circle.com)
