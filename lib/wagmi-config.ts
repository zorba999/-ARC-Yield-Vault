import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arcTestnet } from './chain'

export const wagmiConfig = getDefaultConfig({
  appName: 'ARC Yield Vault',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  chains: [arcTestnet],
  ssr: true,
})
