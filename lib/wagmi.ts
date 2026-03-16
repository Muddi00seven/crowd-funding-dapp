import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Only include WalletConnect if a project ID is configured
const connectors = projectId
  ? [injected(), walletConnect({ projectId })]
  : [injected()]

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors,
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
