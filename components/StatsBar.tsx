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
  const priceDisplay = rawPrice !== undefined && rawPrice > 0n ? formatPrice(rawPrice, oracleDecimals) : '—'
  const priceValue = rawPrice !== undefined && rawPrice > 0n ? `$${priceDisplay}` : '...'

  return (
    <div className="stats">
      <div className="card stat price">
        <div className="slabel"><span className="dot-live" />{SHARE_TOKEN_NAME} Price</div>
        <div className="value mono" style={{ color: 'var(--green-2)' }}>{priceValue}</div>
        <div className="sub">vs USDC</div>
      </div>
      <div className="card stat yield">
        <div className="slabel">Yield Source</div>
        <div className="value">US Treasuries</div>
        <div className="sub">Overnight repo rate</div>
      </div>
      <div className="card stat network">
        <div className="slabel">Network</div>
        <div className="value">ARC Testnet</div>
        <div className="sub mono">Chain ID · 5042002</div>
      </div>
      <div className="card stat settle">
        <div className="slabel">Settlement</div>
        <div className="value mono">&lt; 1 second</div>
        <div className="sub">Deterministic finality</div>
      </div>
    </div>
  )
}
