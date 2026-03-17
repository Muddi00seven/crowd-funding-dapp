import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'

type SignerContext = {
  provider: BrowserProvider
  signer: Awaited<ReturnType<BrowserProvider['getSigner']>>
  signerAddress: string
}

export async function getAuthorizedSigner(
  walletProvider: Eip1193Provider,
  expectedAddress?: string,
): Promise<SignerContext> {
  const provider = new BrowserProvider(walletProvider)
  const normalizedExpected = expectedAddress?.toLowerCase()

  let accounts = (await walletProvider.request({ method: 'eth_accounts' })) as string[]
  if (!accounts?.length) {
    accounts = (await walletProvider.request({ method: 'eth_requestAccounts' })) as string[]
  }
  if (!accounts?.length) {
    throw new Error('No wallet account authorized')
  }

  let signerAddress =
    accounts.find((account) => account.toLowerCase() === normalizedExpected) ?? accounts[0]

  // Re-request if the currently connected dapp address differs from wallet selected account.
  if (normalizedExpected && signerAddress.toLowerCase() !== normalizedExpected) {
    accounts = (await walletProvider.request({ method: 'eth_requestAccounts' })) as string[]
    signerAddress =
      accounts.find((account) => account.toLowerCase() === normalizedExpected) ?? accounts[0] ?? signerAddress
  }

  const signer = await provider.getSigner(signerAddress)
  const finalAddress = await signer.getAddress()
  if (normalizedExpected && finalAddress.toLowerCase() !== normalizedExpected) {
    throw new Error('Connected wallet account does not match selected dapp account')
  }

  return { provider, signer, signerAddress: finalAddress }
}
