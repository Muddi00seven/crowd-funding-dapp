'use client'
import '@/lib/appkit' // initialises AppKit once on the client
import { Toaster } from 'sonner'
import { TransactionLoadingScreen } from '@/components/TransactionLoadingScreen'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <TransactionLoadingScreen />
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </>
  )
}
