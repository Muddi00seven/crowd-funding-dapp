import { getConnection, simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import type { Config } from 'wagmi'
import { SUPPORTED_CHAIN_ID } from '@/lib/contract'

type SendContractWriteParams = {
  config: Config
  address: `0x${string}`
  abi: readonly unknown[]
  functionName: string
  args?: readonly unknown[]
}

export async function sendContractWrite({
  config,
  address,
  abi,
  functionName,
  args = [],
}: SendContractWriteParams): Promise<`0x${string}`> {
  const connection = getConnection(config)

  if (!connection.isConnected || !connection.address) {
    throw new Error("Wallet not connected. Please connect your wallet first.")
  }

  if (connection.chainId !== SUPPORTED_CHAIN_ID) {
    throw new Error(`Wrong network. Please switch to chain ID ${SUPPORTED_CHAIN_ID}.`)
  }

  // Preflight simulation catches reverts before wallet prompt for clearer UX.
  const simulation = await simulateContract(config, {
    address,
    abi: abi as never,
    functionName: functionName as never,
    args: args as never,
    account: connection.address,
    chainId: SUPPORTED_CHAIN_ID,
  } as never)

  return writeContract(config, simulation.request as never)
}

export async function waitForTx(config: Config, hash: `0x${string}`) {
  return waitForTransactionReceipt(config, { hash, chainId: SUPPORTED_CHAIN_ID })
}

/** Extracts a human-readable message from any thrown value */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) {
    const withCause = error as Error & { cause?: unknown }
    if (withCause.cause) {
      const causeMessage = getErrorMessage(withCause.cause)
      if (causeMessage && causeMessage !== '[object Object]') return causeMessage
    }
    return error.message
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    if (typeof e.shortMessage === 'string') return e.shortMessage
    if (typeof e.details === 'string') return e.details
    if (typeof e.message === 'string') return e.message
    if (e.cause) return getErrorMessage(e.cause)
  }
  return String(error)
}

/** Returns true if the error was a user rejection (code 4001) */
export function isUserRejection(error: unknown): boolean {
  const msg = getErrorMessage(error).toLowerCase()
  if (msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')) return true

  if (error instanceof Error) {
    const e = error as Error & { cause?: unknown; code?: unknown }
    if (e.code === 4001 || e.code === 'ACTION_REJECTED') return true
    if (e.cause) return isUserRejection(e.cause)
  }

  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>
    if (e.code === 4001 || e.code === 'ACTION_REJECTED') return true
    if (e.cause) return isUserRejection(e.cause)
  }

  return false
}
