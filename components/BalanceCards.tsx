'use client'

import { useAccount, useReadContracts } from 'wagmi'
import { CONTRACTS, ERC20_ABI } from '@/lib/contracts'
import { formatBalance } from '@/lib/utils'

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

  if (!isConnected) {
    return (
      <div className="card px-6 py-8 text-center">
        <p className="text-arc-muted text-lg">🔌 Connect your wallet to view balances</p>
        <p className="text-arc-muted/60 text-sm mt-2">Make sure you are on ARC Testnet (Chain ID: 5042002)</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">$</div>
            <span className="label">USDC Balance</span>
          </div>
          <p className="text-2xl font-bold text-arc-text">
            {isLoading ? (
              <span className="text-arc-muted text-base animate-pulse">Loading...</span>
            ) : (
              formatBalance(usdcBalance, usdcDecimals, 2)
            )}
          </p>
          <p className="text-arc-muted text-xs mt-1">
            Available to deposit •{' '}
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-arc-blue hover:underline"
            >
              Get testnet USDC
            </a>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-arc-muted hover:text-arc-text transition-colors text-xl"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-arc-green flex items-center justify-center text-white text-xs font-bold">Y</div>
            <span className="label">USYC Balance</span>
          </div>
          <p className="text-2xl font-bold text-arc-text">
            {isLoading ? (
              <span className="text-arc-muted text-base animate-pulse">Loading...</span>
            ) : (
              formatBalance(usycBalance, usycDecimals, 4)
            )}
          </p>
          <p className="text-arc-muted text-xs mt-1">
            Earning U.S. Treasury yield •{' '}
            <a
              href="https://usyc.dev.hashnote.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-arc-blue hover:underline"
            >
              USYC Portal
            </a>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-arc-muted hover:text-arc-text transition-colors text-xl"
          title="Refresh"
        >
          ↻
        </button>
      </div>
    </div>
  )
}
