import { Header } from '@/components/Header'
import { StatsBar } from '@/components/StatsBar'
import { BalanceCards } from '@/components/BalanceCards'
import { DepositCard } from '@/components/DepositCard'
import { RedeemCard } from '@/components/RedeemCard'

export default function Home() {
  return (
    <>
      {/* Animated background */}
      <div className="bg-layer">
        <div className="grid-bg" />
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>

      <Header />

      <main className="app">
        {/* Hero */}
        <section className="hero">
          <div className="eyebrow">
            <span className="dot-live" />
            Live on ARC Testnet · deterministic finality &lt; 1s
          </div>
          <h1>
            <span className="grad">Earn U.S. Treasury yield,<br />onchain, on ARC.</span>
          </h1>
          <p>
            Deposit USDC, receive yUSDC — a yield-bearing share that accrues value against
            the overnight repo rate. No lockups, no intermediaries, redeem anytime.
          </p>
        </section>

        {/* Stats */}
        <StatsBar />

        {/* Balances */}
        <BalanceCards />

        {/* Actions */}
        <section className="actions">
          <DepositCard />
          <RedeemCard />
        </section>

        {/* Footer */}
        <footer className="disclaimer">
          <span>Testnet deployment · no real value. Yield is simulated for demonstration.</span>
          <div className="dlinks">
            <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer">Docs</a>
            <a href={`https://testnet.arcscan.app/address/0x53A65102aD0630e9811eFF6900e841435aAB0c33`} target="_blank" rel="noopener noreferrer">Contract</a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer">ArcScan ↗</a>
          </div>
        </footer>
      </main>
    </>
  )
}
