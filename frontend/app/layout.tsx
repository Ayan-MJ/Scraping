import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { DashboardHeader } from '@/components/dashboard-header'
import { useEffect } from 'react'

// Initialize LogRocket in client-side environment
const InitLogRocket = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('logrocket').then(LogRocket => {
        LogRocket.default.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '');
        
        // You can add user identification here if needed
        // if (user) {
        //   LogRocket.default.identify(user.id, {
        //     name: user.name,
        //     email: user.email
        //   });
        // }
      });
    }
  }, []);
  
  return null;
};

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
          {/* Initialize LogRocket */}
          <InitLogRocket />
          <DashboardHeader />
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
