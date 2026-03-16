export interface Campaign {
  id: bigint
  creator: `0x${string}`
  title: string
  description: string
  goal: bigint
  raised: bigint
  deadline: bigint
  withdrawn: boolean
  contributorsCount: bigint
}

export interface Contribution {
  contributor: `0x${string}`
  amount: bigint
  txHash: `0x${string}`
  timestamp: bigint
}

export interface ContributeFormData {
  amount: string
}

export interface CreateCampaignFormData {
  title: string
  description: string
  goalEth: string
  durationDays: number
}

export interface WalletState {
  isConnected: boolean
  address?: `0x${string}`
  chainId?: number
}
