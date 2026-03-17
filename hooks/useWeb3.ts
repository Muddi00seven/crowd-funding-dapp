'use client'
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, useAppKitNetwork } from '@reown/appkit/react'
import type { Eip1193Provider } from 'ethers'
import { SUPPORTED_CHAIN_ID } from '@/lib/contract'

export function useWeb3() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const { disconnect } = useDisconnect()

  const chainId = caipNetwork
    ? Number(String(caipNetwork.id).includes(':') ? String(caipNetwork.id).split(':').pop() : caipNetwork.id)
    : undefined
  const isCorrectNetwork = chainId === SUPPORTED_CHAIN_ID

  return {
    address: address as string | undefined,
    isConnected,
    chainId,
    isCorrectNetwork,
    walletProvider,
    openModal: (options?: { view?: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders' }) => open(options),
    disconnect,
  }
}
