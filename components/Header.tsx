'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20 L12 4 L20 20" />
              <path d="M7.5 14 L16.5 14" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="arc">ARC</span>
            <span className="sub">Yield Vault</span>
          </div>
        </div>

        <div className="header-right">
          <span className="net-pill">
            <span className="dot-live" />
            ARC Testnet · 5042002
          </span>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain
              return (
                <div style={!mounted ? { opacity: 0, pointerEvents: 'none' as const } : {}}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="connect-btn">
                      <span className="glow" />
                      Connect Wallet
                    </button>
                  ) : (
                    <button onClick={openAccountModal} className="connect-btn connected">
                      <span className="glow" />
                      <span className="avatar-dot" />
                      {account.displayName}
                    </button>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  )
}
