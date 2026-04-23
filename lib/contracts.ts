// ─── Switch between USYC (allowlist required) and SimpleYieldVault (no allowlist) ───
// After deploying contracts/src/SimpleYieldVault.sol, paste the address below
// and set USE_VAULT = true
const VAULT_ADDRESS = '0x53A65102aD0630e9811eFF6900e841435aAB0c33' as `0x${string}`
export const USE_VAULT = true // SimpleYieldVault — no allowlist required

const USYC_CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  USYC: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C' as `0x${string}`,
  USYC_TELLER: '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A' as `0x${string}`,
  USYC_ORACLE: '0x0f30ebeb58ef91b0a82408941eab8e7dd1be1097' as `0x${string}`,
  ROLES_AUTHORITY: '0xcc205224862c7641930c87679e98999d23c26113' as `0x${string}`,
}

const VAULT_CONTRACTS = {
  USDC: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  USYC: VAULT_ADDRESS,          // vault IS the share token
  USYC_TELLER: VAULT_ADDRESS,   // vault IS the teller
  USYC_ORACLE: VAULT_ADDRESS,   // vault has latestAnswer()
  ROLES_AUTHORITY: '0x0000000000000000000000000000000000000000' as `0x${string}`,
}

export const CONTRACTS = USE_VAULT ? VAULT_CONTRACTS : USYC_CONTRACTS

export const SHARE_TOKEN_NAME = USE_VAULT ? 'yUSDC' : 'USYC'
export const REQUIRES_ALLOWLIST = !USE_VAULT ? true : false

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const TELLER_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'redeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    name: 'previewDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'previewRedeem',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    name: 'convertToShares',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'convertToAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    name: 'maxDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'maxAssets', type: 'uint256' }],
  },
] as const

export const ORACLE_ABI = [
  {
    name: 'latestAnswer',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'int256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'latestRoundData',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' },
    ],
  },
] as const
