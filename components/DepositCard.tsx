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
  const showDeposit = hasEnoughAllowance || step === 'approved'
  const step1State = showDeposit ? 'done' : (step === 'approving' ? 'active' : 'active')
  const step2State = showDeposit ? (step === 'depositing' ? 'active' : 'active') : ''
  const connectorFilled = showDeposit

  if (!isConnected || isWrongNetwork) {
    return (
      <div className="card action-card">
        <div className="action-head">
          <h3>
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#5aa0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
            </svg>
            Deposit
          </h3>
          <span className="tag">USDC → {SHARE_TOKEN_NAME}</span>
        </div>
        <div className="disconnected-placeholder">
          <div className="lock-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </div>
          <p style={{ color: 'var(--text)', fontWeight: 600 }}>{isWrongNetwork ? 'Wrong Network' : 'Connect wallet to deposit'}</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
            {isWrongNetwork ? 'Switch to ARC Testnet (Chain ID: 5042002)' : 'Connect your wallet to start earning yield'}
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
            <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#5aa0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
            </svg>
            Deposit
          </h3>
          <span className="tag">USDC → {SHARE_TOKEN_NAME}</span>
        </div>
        <div className="action-body">
          <div className="success-state">
            <div className="ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h4>Deposit confirmed</h4>
            <p>You received <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{amount} {SHARE_TOKEN_NAME}</span>. Yield starts accruing immediately.</p>
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
              <button className="btn primary" onClick={handleReset} style={{ maxWidth: 240, margin: '0 auto' }}>
                <span className="shimmer" />
                Deposit more
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
          <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="#5aa0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
          </svg>
          Deposit
        </h3>
        <span className="tag">USDC → {SHARE_TOKEN_NAME}</span>
      </div>

      <div className="action-body">
        {/* Step indicator */}
        <div className="steps">
          <div className={`step ${step1State}`}>
            <span className="num">
              {showDeposit ? (
                <svg className="check" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : '1'}
            </span>
            <span className="lbl">Approve USDC</span>
          </div>
          <span className={`step-connector${connectorFilled ? ' filled' : ''}`} />
          <div className={`step${step2State ? ` ${step2State}` : ''}`}>
            <span className="num">2</span>
            <span className="lbl">Deposit</span>
          </div>
        </div>

        {/* Input */}
        <div className="input-wrap">
          <div className="irow1">
            <span className="ilbl">You Deposit</span>
            <span className="ibal">Balance: <b>{formatBalance(usdcBalance, usdcDecimals, 2)}</b> USDC</span>
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
            <button className="max-pill" onClick={() => usdcBalance && setAmount(String(Number(usdcBalance) / 10 ** usdcDecimals))}>MAX</button>
            <div className="token-chip usdc"><span className="mini">$</span>USDC</div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview">
          <div className="prow">
            <span className="pk">You receive</span>
            <span className="pv">≈ {amount || '0'} {SHARE_TOKEN_NAME}</span>
          </div>
          <div className="prow">
            <span className="pk">Exchange rate</span>
            <span className="pv">~1 {SHARE_TOKEN_NAME} = 1.000 USDC</span>
          </div>
          <div className="prow">
            <span className="pk">Estimated yield (1yr)</span>
            <span className="pv pos">~5% APY</span>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="err-banner">
            {errorMsg}
            {txHash && (
              <><br /><a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--coral-2)', fontSize: 12 }}>View TX →</a></>
            )}
          </div>
        )}

        {/* Pending */}
        {(step === 'approving' || step === 'depositing') && isTxLoading && txHash && (
          <div className="pending-banner">
            <span>Transaction pending...</span>
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer">View on ArcScan →</a>
          </div>
        )}

        {/* Buttons */}
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button
            className="btn primary"
            onClick={handleApprove}
            disabled={!parsedAmount || !hasEnoughBalance || isLoading || showDeposit || !isAllowlisted}
          >
            {isLoading && step === 'approving' ? (
              <><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" strokeDasharray="30 20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite"/></circle></svg> Approving...</>
            ) : (
              <><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
              {showDeposit ? '✓ Approved' : 'Approve USDC'}</>
            )}
            <span className="shimmer" />
          </button>
          <button
            className="btn success"
            onClick={handleDeposit}
            disabled={!parsedAmount || !hasEnoughBalance || isLoading || !showDeposit || !isAllowlisted}
          >
            {isLoading && step === 'depositing' ? (
              <><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" strokeDasharray="30 20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite"/></circle></svg> Depositing...</>
            ) : (
              <><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg> Deposit</>
            )}
            <span className="shimmer" />
          </button>
        </div>

        {!hasEnoughBalance && parsedAmount && (
          <p style={{ color: 'var(--coral)', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Insufficient USDC balance</p>
        )}
      </div>
    </div>
  )
}
