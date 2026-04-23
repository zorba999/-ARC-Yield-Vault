'use client'

import { useReadContracts } from 'wagmi'
import { CONTRACTS, ORACLE_ABI } from '@/lib/contracts'
import { formatPrice } from '@/lib/utils'

export function StatsBar() {
  const { data } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.USYC_ORACLE,
        abi: ORACLE_ABI,
        functionName: 'latestAnswer',
      },
      {
        address: CONTRACTS.USYC_ORACLE,
        abi: ORACLE_ABI,
        functionName: 'decimals',
      },
    ],
  })

  const rawPrice = data?.[0]?.result as bigint | undefined
  const oracleDecimals = data?.[1]?.result as number | undefined

  const priceDisplay =
    rawPrice !== undefined && oracleDecimals !== undefined
      ? formatPrice(rawPrice > 0n ? rawPrice : undefined, oracleDecimals)
      : '—'

  const stats = [
    {
      label: 'USYC Price',
      value: rawPrice !== undefined ? `$${priceDisplay}` : '...',
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
