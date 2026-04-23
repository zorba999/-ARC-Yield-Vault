'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { arcTestnet } from '@/lib/chain'
import { shortenAddress } from '@/lib/utils'

export function Header() {
  const { address, isConnected } = useAccount()

  return (
    <header className="border-b border-arc-border bg-arc-card/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arc-blue flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <h1 className="text-arc-text font-bold text-lg leading-none">ARC Yield Vault</h1>
            <p className="text-arc-muted text-xs mt-0.5">Powered by USYC on ARC Testnet</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-arc-muted hover:text-arc-text text-sm transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-arc-green animate-pulse" />
            {arcTestnet.name}
          </a>

          {isConnected && address && (
            <span className="hidden md:block text-arc-muted text-xs font-mono bg-arc-subtle border border-arc-border px-3 py-1.5 rounded-lg">
              {shortenAddress(address)}
            </span>
          )}

          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  )
}
