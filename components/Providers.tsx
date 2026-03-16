'use client'
import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { config } from '@/lib/wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient per-component instance to avoid shared state across SSR requests
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          richColors
          closeButton
        />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
