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
  const amountNum = parseFloat(amount) || 0

  if (!isConnected || isWrongNetwork) {
    return (
      <div className="card action-card">
        <div className="action-head">
          <h3>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#ffa38e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
            </svg>
            Redeem
          </h3>
          <span className="tag">yUSDC → USDC</span>
        </div>
        <div className="disconnected-placeholder">
          <div className="lock-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </div>
          <p style={{ color: 'var(--text)', fontWeight: 600 }}>{isWrongNetwork ? 'Wrong Network' : 'Connect wallet to redeem'}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
            {isWrongNetwork ? 'Switch to ARC Testnet (Chain ID: 5042002)' : 'Connect your wallet to redeem yUSDC for USDC'}
          </p>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="card action-card">
        <div className="action-head">
          <h3>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#ffa38e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
            </svg>
            Redeem
          </h3>
          <span className="tag">yUSDC → USDC</span>
        </div>
        <div className="action-body">
          <div className="success-state" style={{ background: 'radial-gradient(ellipse at top, rgba(249,112,102,0.12), transparent 60%)' }}>
            <div className="ring coral">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h4>Redemption complete</h4>
            <p>USDC has been returned to your wallet.</p>
            {txHash && (
              <a className="tx-link" href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                {txHash.slice(0, 10)}…{txHash.slice(-6)}
              </a>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="btn danger" onClick={handleReset} style={{ maxWidth: 240, margin: '0 auto' }}>
                <span className="shimmer" />Redeem more
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card action-card">
      <div className="action-head">
        <h3>
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#ffa38e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>
          </svg>
          Redeem
        </h3>
        <span className="tag">yUSDC → USDC</span>
      </div>

      <div className="action-body">
        {/* Input */}
        <div className="input-wrap">
          <div className="irow1">
            <span className="ilbl">You Redeem</span>
            <span className="ibal">Balance: <b>{formatBalance(usycBalance, usycDecimals, 4)}</b> yUSDC</span>
          </div>
          <div className="irow2">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setStep('idle'); setErrorMsg('') }}
              min="0"
              disabled={isLoading}
            />
            <button className="max-pill" onClick={() => usycBalance && setAmount(String(Number(usycBalance) / 10 ** usycDecimals))}>MAX</button>
            <div className="token-chip yusdc"><span className="mini">Y</span>yUSDC</div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview">
          <div className="prow">
            <span className="pk">You receive</span>
            <span className="pv">≈ {amount || '0'} USDC</span>
          </div>
          <div className="prow">
            <span className="pk">Exchange rate</span>
            <span className="pv">~1 yUSDC = 1.000 USDC</span>
          </div>
          <div className="prow">
            <span className="pk">Network fee</span>
            <span className="pv">~ $0.0001</span>
          </div>
        </div>

        {/* Profit row */}
        {amountNum > 0 && (
          <div className="profit">
            <span className="pk">
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              Yield earned on this amount
            </span>
            <span className="pv">~5% APY</span>
          </div>
        )}

        {/* Error */}
        {errorMsg && <div className="err-banner">{errorMsg}</div>}

        {/* Pending */}
        {step === 'redeeming' && isTxLoading && txHash && (
          <div className="pending-banner">
            <span>Transaction pending...</span>
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer">View on ArcScan →</a>
          </div>
        )}

        {/* Button */}
        <div style={{ marginTop: 18 }}>
          <button
            className="btn danger"
            onClick={handleRedeem}
            disabled={!parsedAmount || !hasEnoughBalance || isLoading}
          >
            {isLoading && step === 'redeeming' ? (
              <><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" strokeDasharray="30 20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite"/></circle></svg> Redeeming...</>
            ) : (
              <><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg> Redeem yUSDC</>
            )}
            <span className="shimmer" />
          </button>
        </div>

        {!hasEnoughBalance && parsedAmount && (
          <p style={{ color: 'var(--coral)', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Insufficient yUSDC balance</p>
        )}
      </div>
    </div>
  )
}
