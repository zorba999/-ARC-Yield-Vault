import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'ARC Yield Vault',
  description: 'Deposit USDC on ARC Testnet and earn yield via USYC — U.S. Treasury backed stablecoin returns.',
  openGraph: {
    title: 'ARC Yield Vault',
    description: 'Earn U.S. Treasury yield on your USDC on the ARC blockchain.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
