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
  metadata: {
    name: 'ChainFund',
    description: 'Decentralized Crowdfunding on Blockchain',
    url: 'http://localhost:3000',
    icons: [],
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
})
