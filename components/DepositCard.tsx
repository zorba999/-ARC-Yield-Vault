'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContracts, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACTS, ERC20_ABI, TELLER_ABI, REQUIRES_ALLOWLIST, SHARE_TOKEN_NAME, USE_VAULT } from '@/lib/contracts'
import { formatBalance, parseInputAmount } from '@/lib/utils'
import { arcTestnet } from '@/lib/chain'

type Step = 'idle' | 'approving' | 'approved' | 'depositing' | 'done' | 'error'

export function DepositCard() {
  const { address, isConnected, chainId } = useAccount()
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id

  const { data: allowlistData } = useReadContract({
    address: CONTRACTS.ROLES_AUTHORITY,
    abi: [{
      name: 'doesUserHaveRole',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'user', type: 'address' }, { name: 'role', type: 'uint8' }],
      outputs: [{ name: '', type: 'bool' }],
    }] as const,
    functionName: 'doesUserHaveRole',
    args: [address ?? '0x0000000000000000000000000000000000000000', 0],
    query: { enabled: isConnected && !!address && REQUIRES_ALLOWLIST },
  })

  const isAllowlisted = REQUIRES_ALLOWLIST ? allowlistData === true : true

  const { data, refetch } = useReadContracts({
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
        address: CONTRACTS.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [
          address ?? '0x0000000000000000000000000000000000000000',
          CONTRACTS.USYC_TELLER,
        ],
      },
    ],
    query: { enabled: isConnected && !!address },
  })

  const usdcBalance = data?.[0]?.result as bigint | undefined
  const usdcDecimals = (data?.[1]?.result as number | undefined) ?? 18
  const allowance = (data?.[2]?.result as bigint | undefined) ?? 0n

  const parsedAmount = parseInputAmount(amount, usdcDecimals)
  const hasEnoughAllowance = parsedAmount !== null && allowance >= parsedAmount
  const hasEnoughBalance = parsedAmount !== null && usdcBalance !== undefined && usdcBalance >= parsedAmount

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
    if (isTxError && (step === 'depositing' || step === 'approving')) {
      setErrorMsg(
        step === 'depositing'
          ? 'Deposit failed on-chain. Most likely your wallet is not allowlisted for USYC. Request access at support.circle.com.'
          : 'Approve failed on-chain. Please try again.'
      )
      setStep('error')
    }
  }, [isTxError, step])

  useEffect(() => {
    if (isTxSuccess) {
      if (step === 'approving') {
        setStep('approved')
        refetch()
      } else if (step === 'depositing') {
        setStep('done')
        setAmount('')
        refetch()
      }
    }
  }, [isTxSuccess, step, refetch])

  function handleApprove() {
    if (!parsedAmount) return
    setStep('approving')
    setErrorMsg('')
    writeContract({
      address: CONTRACTS.USDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.USYC_TELLER, parsedAmount],
    })
  }

  function handleDeposit() {
    if (!parsedAmount || !address) return
    setStep('depositing')
    setErrorMsg('')
    writeContract({
      address: CONTRACTS.USYC_TELLER,
      abi: TELLER_ABI,
      functionName: 'deposit',
      args: [parsedAmount, address],
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
        <p className="text-arc-muted text-center">Connect your wallet to deposit USDC</p>
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
        <div className="w-14 h-14 rounded-full bg-arc-green/20 flex items-center justify-center text-2xl">✅</div>
        <p className="text-arc-green font-bold text-lg">Deposit Successful!</p>
        <p className="text-arc-muted text-sm text-center">USYC tokens have been minted to your wallet.</p>
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
          Deposit Again
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-arc-text font-bold text-lg">Deposit USDC</h2>
        <p className="text-arc-muted text-sm mt-1">Deposit USDC to receive {SHARE_TOKEN_NAME} and earn U.S. Treasury yield</p>
      </div>

      {allowlistData !== undefined && (
        <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-medium ${
          isAllowlisted
            ? 'bg-arc-green/10 border border-arc-green/30 text-arc-green'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <span>{isAllowlisted ? '✅' : '🚫'}</span>
          {isAllowlisted
            ? 'Wallet is allowlisted — you can deposit'
            : (
              <span>
                Wallet not allowlisted.{' '}
                <a href="https://support.circle.com/" target="_blank" rel="noopener noreferrer"
                  className="underline hover:opacity-80">Request access →</a>
              </span>
            )
          }
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="label">Amount (USDC)</label>
          <button
            className="text-arc-blue text-xs hover:underline"
            onClick={() => usdcBalance && setAmount(String(Number(usdcBalance) / 10 ** usdcDecimals))}
          >
            Max: {formatBalance(usdcBalance, usdcDecimals, 2)}
          </button>
        </div>
        <input
          type="number"
          className="input-field"
          placeholder="0.00"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setStep('idle'); setErrorMsg('') }}
          min="0"
          disabled={isLoading}
        />
      </div>

      <div className="bg-arc-bg border border-arc-border rounded-xl p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-arc-muted">You deposit</span>
          <span className="text-arc-text font-medium">{amount || '0'} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-arc-muted">You receive (approx)</span>
          <span className="text-arc-green font-medium">≈ {amount || '0'} {SHARE_TOKEN_NAME}*</span>
        </div>
        <p className="text-arc-muted/60 text-xs">* Exact amount depends on current USYC/USDC exchange rate</p>
        {!USE_VAULT && <p className="text-yellow-500/80 text-xs">⚠ Max deposit: 100 USDC/day (USYC daily limit)</p>}
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 space-y-2">
          <p className="text-red-400 text-sm">{errorMsg}</p>
          {txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400/70 hover:text-red-400 text-xs underline"
            >
              View failed TX on ArcScan →
            </a>
          )}
          {step === 'error' && errorMsg.includes('allowlist') && (
            <a
              href="https://support.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-yellow-400 hover:text-yellow-300 text-xs font-semibold"
            >
              ⚠ Request USYC Allowlisting at support.circle.com →
            </a>
          )}
        </div>
      )}

      {(step === 'approving' || step === 'depositing') && isTxLoading && txHash && (
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
        {!hasEnoughAllowance && step !== 'approved' ? (
          <button
            className="btn-primary w-full"
            onClick={handleApprove}
            disabled={!parsedAmount || !hasEnoughBalance || isLoading || !isAllowlisted}
          >
            {isLoading && step === 'approving' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> Approving...
              </span>
            ) : (
              'Step 1: Approve USDC'
            )}
          </button>
        ) : (
          <button
            className="btn-primary w-full"
            onClick={handleDeposit}
            disabled={!parsedAmount || !hasEnoughBalance || isLoading || !isAllowlisted}
          >
            {isLoading && step === 'depositing' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⟳</span> Depositing...
              </span>
            ) : (
              'Step 2: Deposit USDC'
            )}
          </button>
        )}

        {!hasEnoughBalance && parsedAmount && (
          <p className="text-red-400 text-xs text-center">Insufficient USDC balance</p>
        )}
      </div>
    </div>
  )
}
