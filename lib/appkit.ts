'use client'
import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { sepolia } from '@reown/appkit/networks'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

const ethersAdapter = new EthersAdapter()

createAppKit({
  adapters: [ethersAdapter],
  networks: [sepolia],
  defaultNetwork: sepolia,
  projectId,
  // Keep wallet selection deterministic: single injected provider path only.
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: false,
  enableWalletConnect: false,
  allWallets: 'HIDE',
  metadata: {
    name: 'ChainFund',
    description: 'Decentralized Crowdfunding on Blockchain',
    url: 'http://localhost:3000',
    icons: [],
  },
  features: {
    analytics: false,
    allWallets: false,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
})
