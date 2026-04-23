'use client'

import { useReadContracts } from 'wagmi'
import { CONTRACTS, ORACLE_ABI, USE_VAULT, SHARE_TOKEN_NAME } from '@/lib/contracts'
import { formatPrice } from '@/lib/utils'

const VAULT_ORACLE_ABI = [{
  name: 'latestAnswer',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ name: '', type: 'int256' }],
}] as const

export function StatsBar() {
  const { data } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.USYC_ORACLE,
        abi: USE_VAULT ? VAULT_ORACLE_ABI : ORACLE_ABI,
        functionName: USE_VAULT ? 'latestAnswer' : 'latestRoundData',
      },
      {
        address: CONTRACTS.USYC_ORACLE,
        abi: ORACLE_ABI,
        functionName: 'decimals',
      },
    ],
  })

  let rawPrice: bigint | undefined
  if (USE_VAULT) {
    rawPrice = data?.[0]?.result as bigint | undefined
  } else {
    const roundData = data?.[0]?.result as readonly [bigint, bigint, bigint, bigint, bigint] | undefined
    rawPrice = roundData?.[1]
  }

  const oracleDecimals = (data?.[1]?.result as number | undefined) ?? 6

  const priceDisplay =
    rawPrice !== undefined && rawPrice > 0n
      ? formatPrice(rawPrice, oracleDecimals)
      : '—'

  const stats = [
    {
      label: `${SHARE_TOKEN_NAME} Price`,
      value: rawPrice !== undefined && rawPrice > 0n ? `$${priceDisplay}` : '...',
      sub: 'vs USDC',
      color: 'text-arc-green',
    },
    {
      label: 'Yield Source',
      value: 'US Treasuries',
      sub: 'Overnight repo rate',
      color: 'text-arc-blue-light',
    },
    {
      label: 'Network',
      value: 'ARC Testnet',
      sub: 'Chain ID: 5042002',
      color: 'text-arc-text',
    },
    {
      label: 'Settlement',
      value: '< 1 second',
      sub: 'Deterministic finality',
      color: 'text-arc-green',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card px-4 py-3">
          <p className="label">{stat.label}</p>
          <p className={`font-bold text-base mt-1 ${stat.color}`}>{stat.value}</p>
          <p className="text-arc-muted text-xs mt-0.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}
