import { Header } from '@/components/Header'
import { AllowlistBanner } from '@/components/AllowlistBanner'
import { StatsBar } from '@/components/StatsBar'
import { BalanceCards } from '@/components/BalanceCards'
import { DepositCard } from '@/components/DepositCard'
import { RedeemCard } from '@/components/RedeemCard'

export default function Home() {
  return (
    <main className="min-h-screen bg-arc-bg">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 relative">
        <div>
          <h2 className="text-2xl font-bold text-arc-text">Yield Vault</h2>
          <p className="text-arc-muted text-sm mt-1">
            Deposit USDC on ARC Testnet to earn U.S. Treasury yield via USYC — the tokenized money market fund by Hashnote & Circle.
          </p>
        </div>

        <AllowlistBanner />
        <StatsBar />
        <BalanceCards />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DepositCard />
          <RedeemCard />
        </div>

        <footer className="text-center text-arc-muted/50 text-xs pb-4 space-y-1">
          <p>
            ARC Testnet • USYC by Hashnote •{' '}
            <a href="https://docs.arc.network" target="_blank" rel="noopener noreferrer" className="hover:text-arc-muted transition-colors">
              ARC Docs
            </a>{' '}
            •{' '}
            <a href="https://testnet.arcscan.app" target="_blank" rel="noopener noreferrer" className="hover:text-arc-muted transition-colors">
              Block Explorer
            </a>
          </p>
          <p>This is a testnet demo. No real funds are at risk.</p>
        </footer>
      </div>
    </main>
  )
}
