import type { Metadata } from 'next'
import { Syne, IBM_Plex_Sans, DM_Mono } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'PPE Analytics Platform',
  description: 'Industrial PPE compliance and worker attendance platform',
}

const syne = Syne({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-syne',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ibm-plex-sans',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-dm-mono',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${ibmPlexSans.variable} ${dmMono.variable}`}>
        <div className="top-accent-bar" />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
