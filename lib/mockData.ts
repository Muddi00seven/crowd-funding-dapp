import { Campaign, Contribution } from '@/types'
import { parseUnits } from 'ethers'

const usdt = (amount: string) => parseUnits(amount, 6)

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 0n,
    creator: '0x7aF3b12c9d8E4F5a6B7C8D9E0F1a2B3c4D5e6F7' as `0x${string}`,
    title: 'Solar Energy Project',
    description: 'Installing solar panels in remote areas to provide clean, renewable energy to thousands of households and reduce dependence on fossil fuels.',
    goal: usdt('10000'),
    raised: usdt('6400'),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 12),
    withdrawn: false,
    contributorsCount: 47n,
  },
  {
    id: 1n,
    creator: '0x91BcA2d3e4F5a6B7C8D9E0F1a2B3c4D5e6F7a8' as `0x${string}`,
    title: 'Medical Aid DAO',
    description: 'A decentralized fund to provide medicines and treatment support directly to patients in need — no middlemen, full transparency on-chain.',
    goal: usdt('5000'),
    raised: usdt('2100'),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 5),
    withdrawn: false,
    contributorsCount: 23n,
  },
  {
    id: 2n,
    creator: '0xB3Cd4E5f6A7B8c9D0e1F2a3B4c5D6e7F8a9B0c' as `0x${string}`,
    title: 'Education Fund',
    description: 'Covering school fees and books for underprivileged children. Every child deserves access to quality education regardless of their family\'s financial situation.',
    goal: usdt('8000'),
    raised: usdt('8200'),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 3),
    withdrawn: false,
    contributorsCount: 89n,
  },
  {
    id: 3n,
    creator: '0xC4De5F6a7B8c9D0E1f2A3b4C5d6E7f8A9b0C1d' as `0x${string}`,
    title: 'Clean Water Initiative',
    description: 'Installing water purification systems in rural communities to provide safe, clean drinking water to families who currently lack access.',
    goal: usdt('15000'),
    raised: usdt('3700'),
    deadline: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
    withdrawn: false,
    contributorsCount: 18n,
  },
]

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    contributor: '0x7aF3b12c9d8E4F5a6B7C8D9E0F1a2B3c4D5e6F7' as `0x${string}`,
    amount: usdt('200'),
    txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 7200),
  },
  {
    contributor: '0x91BcA2d3e4F5a6B7C8D9E0F1a2B3c4D5e6F7a8' as `0x${string}`,
    amount: usdt('500'),
    txHash: '0xdef456abc123def456abc123def456abc123def456abc123def456abc123def4' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 14400),
  },
  {
    contributor: '0xB3Cd4E5f6A7B8c9D0e1F2a3B4c5D6e7F8a9B0c' as `0x${string}`,
    amount: usdt('1000'),
    txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0' as `0x${string}`,
    timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400),
  },
]
