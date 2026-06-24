import { JsonRpcProvider, Contract } from 'ethers'

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ''
export const USDT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS ?? ''
export const SUPPORTED_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '11155111')
export const USDT_DECIMALS = 6

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://rpc.sepolia.org'
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL ?? 'https://sepolia.etherscan.io'

/** Read-only provider (no wallet needed) */
export function getReadProvider() {
  return new JsonRpcProvider(RPC_URL)
}

export function getTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`
}

export function getAddressUrl(address: string) {
  return `${EXPLORER_URL}/address/${address}`
}

export const USDT_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function faucet()',
] as const

export const CONTRACT_ABI = [
  'function getCampaignCount() view returns (uint256)',
  'function getCampaign(uint256 id) view returns (uint256 id, address creator, string title, string description, uint256 goal, uint256 raised, uint256 deadline, bool withdrawn, uint256 contributorsCount)',
  'function createCampaign(string title, string description, uint256 goal, uint256 durationDays)',
  'function contribute(uint256 campaignId, uint256 amount)',
  'function withdraw(uint256 campaignId)',
  'function getContributions(uint256 campaignId) view returns (tuple(address contributor, uint256 amount, bytes32 txHash, uint256 timestamp)[])',
] as const

export function getCrowdFundingContract(signerOrProvider: ConstructorParameters<typeof Contract>[2]) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}

export function getUsdtContract(signerOrProvider: ConstructorParameters<typeof Contract>[2]) {
  return new Contract(USDT_TOKEN_ADDRESS, USDT_ABI, signerOrProvider)
}
