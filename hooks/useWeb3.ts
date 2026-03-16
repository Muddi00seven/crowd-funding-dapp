'use client'
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, useAppKitNetwork } from '@reown/appkit/react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import { SUPPORTED_CHAIN_ID } from '@/lib/contract'

export function useWeb3() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const { disconnect } = useDisconnect()

  const chainId = caipNetwork ? Number(caipNetwork.id) : undefined
  const isCorrectNetwork = chainId === SUPPORTED_CHAIN_ID

  async function getSigner() {
    if (!walletProvider) throw new Error('Wallet not connected')
    const provider = new BrowserProvider(walletProvider)
    return provider.getSigner()
  }

  return {
    address: address as string | undefined,
    isConnected,
    chainId,
    isCorrectNetwork,
    getSigner,
    openModal: () => open(),
    disconnect,
  }
}
