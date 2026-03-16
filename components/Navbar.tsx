'use client'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { ContractStatus } from '@/components/contract/ContractStatus'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="w-5 h-5 text-primary" />
          <span>ChainFund</span>
        </Link>

        <div className="flex items-center gap-4">
          <ContractStatus />
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
