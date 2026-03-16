'use client'
import Link from 'next/link'
import { Zap, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

        <div className="flex items-center gap-3">
          <ContractStatus />
          <Button asChild variant="outline" className="hidden sm:flex border-border hover:border-primary/50 gap-2">
            <Link href="/campaigns/create">
              <PlusCircle className="w-4 h-4" />
              New Campaign
            </Link>
          </Button>
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
