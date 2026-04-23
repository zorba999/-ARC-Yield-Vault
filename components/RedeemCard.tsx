'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, ERC20_ABI, TELLER_ABI } from '@/lib/contracts'
import { formatBalance, parseInputAmount } from '@/lib/utils'
import { arcTestnet } from '@/lib/chain'

type Step = 'idle' | 'redeeming' | 'done' | 'error'

export function RedeemCard() {
  const { address, isConnected, chainId } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id

  const { data, refetch } = useReadContracts({
    contracts: [
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

  const usycBalance = data?.[0]?.result as bigint | undefined
  const usycDecimals = (data?.[1]?.result as number | undefined) ?? 6

  const parsedAmount = parseInputAmount(amount, usycDecimals)
  const hasEnoughBalance = parsedAmount !== null && usycBalance !== undefined && usycBalance >= parsedAmount

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: arcTestnet.id,
    confirmations: 1,
  })

  useEffect(() => {
    if (writeError) {
      const msg = writeError.message
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setErrorMsg('Transaction rejected by user.')
      } else {
        setErrorMsg(msg.slice(0, 150))
      }
      setStep('error')
    }
  }, [writeError])

  useEffect(() => {
    if (isTxError && step === 'redeeming') {
      setErrorMsg('Redeem failed on-chain. Your wallet may not be allowlisted for USYC. Request access at support.circle.com.')
      setStep('error')
    }
  }, [isTxError, step])

  useEffect(() => {
    if (isTxSuccess && step === 'redeeming') {
      setStep('done')
      setAmount('')
      refetch()
    }
  }, [isTxSuccess, step, refetch])

  function handleRedeem() {
    if (!parsedAmount || !address) return
    setStep('redeeming')
    setErrorMsg('')
    writeContract({
      address: CONTRACTS.USYC_TELLER,
      abi: TELLER_ABI,
      functionName: 'redeem',
      args: [parsedAmount, address, address],
    })
  }

  function handleReset() {
    setStep('idle')
    setAmount('')
    setErrorMsg('')
    refetch()
  }

  const isLoading = isWritePending || isTxLoading

  if (!isConnected) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <p className="text-4xl">🔌</p>
        <p className="text-arc-muted text-center">Connect your wallet to redeem USYC</p>
      </div>
    )
  }

  if (isWrongNetwork) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <p className="text-4xl">⛓️</p>
        <p className="text-arc-text font-semibold">Wrong Network</p>
        <p className="text-arc-muted text-sm text-center">
          Switch to <strong className="text-arc-blue">ARC Testnet</strong> (Chain ID: 5042002)
        </p>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-arc-green/20 flex items-center justify-center text-2xl">💰</div>
        <p className="text-arc-green font-bold text-lg">Redeem Successful!</p>
        <p className="text-arc-muted text-sm text-center">USDC has been returned to your wallet.</p>
        {txHash && (
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-arc-blue hover:underline text-sm"
          >
            View on ArcScan →
          </a>
        )}
        <button onClick={handleReset} className="btn-primary mt-2 w-full">
          Redeem Again
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-arc-text font-bold text-lg">Redeem USYC</h2>
        <p className="text-arc-muted text-sm mt-1">Exchange USYC back to USDC at current market rate</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="label">Amount (USYC)</label>
          <button
            className="text-arc-blue text-xs hover:underline"
            onClick={() => usycBalance && setAmount(String(Number(usycBalance) / 10 ** usycDecimals))}
          >
            Max: {formatBalance(usycBalance, usycDecimals, 4)}
          </button>
        </div>
        <input
          type="number"
          className="input-field"
          placeholder="0.0000"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setStep('idle'); setErrorMsg('') }}
          min="0"
          disabled={isLoading}
        />
      </div>

      <div className="bg-arc-bg border border-arc-border rounded-xl p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-arc-muted">You redeem</span>
          <span className="text-arc-text font-medium">{amount || '0'} USYC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-arc-muted">You receive (approx)</span>
          <span className="text-arc-blue-light font-medium">≈ {amount || '0'} USDC*</span>
        </div>
        <p className="text-arc-muted/60 text-xs">* Exact amount depends on current USYC/USDC exchange rate</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}

      {step === 'redeeming' && isTxLoading && txHash && (
        <div className="bg-arc-blue/10 border border-arc-blue/30 rounded-xl p-3">
          <p className="text-arc-blue text-sm">Transaction pending...</p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-arc-blue/70 hover:underline text-xs"
          >
            View on ArcScan →
          </a>
        </div>
      )}

      <div className="space-y-3">
        <button
          className="btn-secondary w-full"
          onClick={handleRedeem}
          disabled={!parsedAmount || !hasEnoughBalance || isLoading}
        >
          {isLoading && step === 'redeeming' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⟳</span> Redeeming...
            </span>
          ) : (
            'Redeem USYC'
          )}
        </button>

        {!hasEnoughBalance && parsedAmount && (
          <p className="text-red-400 text-xs text-center">Insufficient USYC balance</p>
        )}
      </div>
    </div>
  )
}
