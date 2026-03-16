import { useReadContract, useAccount } from 'wagmi'
import { USDT_ABI, USDT_TOKEN_ADDRESS, CONTRACT_ADDRESS } from '@/lib/contract'
import { formatUsdt } from '@/lib/utils'

export function useTokenBalance() {
  const { address, isConnected } = useAccount()
  const hasToken = USDT_TOKEN_ADDRESS && USDT_TOKEN_ADDRESS !== ('' as `0x${string}`)

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDT_TOKEN_ADDRESS,
    abi: USDT_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected && !!address && hasToken },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDT_TOKEN_ADDRESS,
    abi: USDT_ABI,
    functionName: 'allowance',
    args: [
      address ?? '0x0000000000000000000000000000000000000000',
      CONTRACT_ADDRESS,
    ],
    query: { enabled: isConnected && !!address && hasToken },
  })

  const balanceBigInt = (balance as bigint | undefined) ?? 0n
  const allowanceBigInt = (allowance as bigint | undefined) ?? 0n

  return {
    balance: balanceBigInt,
    allowance: allowanceBigInt,
    formatted: hasToken ? formatUsdt(balanceBigInt) : '—',
    refetch: () => { refetchBalance(); refetchAllowance() },
  }
}
