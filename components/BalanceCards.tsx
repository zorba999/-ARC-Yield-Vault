'use client'

import { useAccount, useReadContracts } from 'wagmi'
import { CONTRACTS, ERC20_ABI, SHARE_TOKEN_NAME } from '@/lib/contracts'
import { formatBalance } from '@/lib/utils'

function splitBalance(val: string) {
  const [int, dec] = val.split('.')
  return { int: int ?? '0', dec: dec ? `.${dec}` : '' }
}

export function BalanceCards() {
  const { address, isConnected } = useAccount()
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
      {
        address: CONTRACTS.USYC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: CONTRACTS.USYC,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
    ],
    query: { enabled: isConnected && !!address },
  })

  const usdcBalance = data?.[0]?.result as bigint | undefined
  const usdcDecimals = (data?.[1]?.result as number | undefined) ?? 18
  const usycBalance = data?.[2]?.result as bigint | undefined
  const usycDecimals = (data?.[3]?.result as number | undefined) ?? 6

  const usdcStr = isConnected ? formatBalance(usdcBalance, usdcDecimals, 2) : '—'
  const usycStr = isConnected ? formatBalance(usycBalance, usycDecimals, 4) : '—'
  const usdcParts = splitBalance(usdcStr)
  const usycParts = splitBalance(usycStr)

  const RefreshIcon = () => (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )

  return (
    <div className="balances">
      {/* USDC */}
      <div className="card balance">
        <div className="btop">
          <div className="tk">
            <div className="token-logo usdc">$</div>
            <span className="bname">USDC Balance</span>
          </div>
          <button className="refresh" onClick={() => refetch()} title="Refresh"><RefreshIcon /></button>
        </div>
        <div className="big">
          {usdcParts.int}<span className="dec">{usdcParts.dec}</span>
        </div>
        <div className="bfoot">
          <span className="desc">Available to deposit</span>
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">Get testnet USDC →</a>
        </div>
      </div>

      {/* yUSDC */}
      <div className="card balance">
        <div className="btop">
          <div className="tk">
            <div className="token-logo yusdc">Y</div>
            <span className="bname">{SHARE_TOKEN_NAME} Balance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="apy-badge"><span className="d" />~5% APY</span>
            <button className="refresh" onClick={() => refetch()} title="Refresh"><RefreshIcon /></button>
          </div>
        </div>
        <div className="big">
          {usycParts.int}<span className="dec">{usycParts.dec}</span>
        </div>
        <div className="bfoot">
          <span className="desc">Earning U.S. Treasury yield</span>
          <a href="https://testnet.arcscan.app/address/0x53A65102aD0630e9811eFF6900e841435aAB0c33" target="_blank" rel="noopener noreferrer">Vault details →</a>
        </div>
      </div>
    </div>
  )
}
