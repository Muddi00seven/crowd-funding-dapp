import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// ssr: false prevents WalletConnect from accessing indexedDB during server render
const Providers = dynamic(
  () => import('@/components/Providers').then((mod) => mod.Providers),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'ChainFund — Decentralized Crowdfunding',
  description: 'Transparent crowdfunding on the blockchain. No middlemen, funds go directly to smart contracts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
