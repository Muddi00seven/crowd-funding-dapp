export interface Campaign {
  id: bigint
  creator: string
  title: string
  description: string
  goal: bigint
  raised: bigint
  deadline: bigint
  withdrawn: boolean
  contributorsCount: bigint
}

export interface Contribution {
  contributor: string
  amount: bigint
  txHash: string
  timestamp: bigint
}
