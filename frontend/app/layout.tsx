"use client"

import { useEffect } from 'react'
import './globals.css'
import { Providers } from './providers'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          {/* Initialize LogRocket */}
          <InitLogRocket />
          <div className="flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
