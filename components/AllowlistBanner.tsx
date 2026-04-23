'use client'

export function AllowlistBanner() {
  return (
    <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-2xl p-4 flex items-start gap-3">
      <div className="text-yellow-400 text-lg mt-0.5">⚠️</div>
      <div className="flex-1">
        <p className="text-yellow-300 font-semibold text-sm">USYC Allowlist Required</p>
        <p className="text-yellow-300/70 text-sm mt-1">
          To deposit USDC into USYC on ARC Testnet, your wallet address must be allowlisted by Circle.
          Open a support ticket and include your ARC Testnet wallet address. Requests are typically
          processed within 24–48 hours.
        </p>
        <div className="flex gap-3 mt-3">
          <a
            href="https://support.circle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold underline underline-offset-2 transition-colors"
          >
            Request Allowlisting →
          </a>
          <a
            href="https://usyc.dev.hashnote.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400/70 hover:text-yellow-400 text-sm transition-colors"
          >
            USYC Portal
          </a>
        </div>
      </div>
    </div>
  )
}
