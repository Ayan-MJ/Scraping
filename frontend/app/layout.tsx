import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { DashboardHeader } from '@/components/dashboard-header'

export const metadata: Metadata = {
  title: 'Scraping Wizard',
  description: 'A no-code web scraping platform',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Providers>
          <DashboardHeader />
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
